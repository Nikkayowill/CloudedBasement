require('dotenv').config();
const pool = require('../db');
const axios = require('axios');
const { sendEmail, sendTrialEndingEmail } = require('./email');

/**
 * Subscription Monitor Service
 * Checks for unpaid/expired subscriptions and powers off droplets
 * Destroys droplets after 7 days of being stopped
 */

// Destroy a DigitalOcean droplet completely
async function destroyDroplet(dropletId, serverId) {
  try {
    await axios.delete(
      `https://api.digitalocean.com/v2/droplets/${dropletId}`,
      { headers: { 'Authorization': `Bearer ${process.env.DIGITALOCEAN_TOKEN}` } }
    );
    
    // Delete server record from database
    await pool.query('DELETE FROM servers WHERE id = $1', [serverId]);
    
    console.log(`[Subscription Monitor] Destroyed droplet ${dropletId} and deleted server ${serverId}`);
    return true;
  } catch (error) {
    console.error(`[Subscription Monitor] Failed to destroy droplet ${dropletId}:`, error.response?.data || error.message);
    return false;
  }
}

// Power off a DigitalOcean droplet
async function powerOffDroplet(dropletId) {
  try {
    await axios.post(
      `https://api.digitalocean.com/v2/droplets/${dropletId}/actions`,
      { type: 'power_off' },
      { headers: { 'Authorization': `Bearer ${process.env.DIGITALOCEAN_TOKEN}` } }
    );
    console.log(`[Subscription Monitor] Powered off droplet ${dropletId}`);
    return true;
  } catch (error) {
    console.error(`[Subscription Monitor] Failed to power off droplet ${dropletId}:`, error.response?.data || error.message);
    return false;
  }
}

// Check for expired free trials (3 days)
async function checkExpiredTrials() {
  try {
    const result = await pool.query(`
      SELECT s.*, u.email 
      FROM servers s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN payments p ON s.user_id = p.user_id AND p.status = 'succeeded'
      WHERE s.status = 'running'
        AND s.created_at < NOW() - INTERVAL '3 days'
        AND p.id IS NULL
        AND s.droplet_id IS NOT NULL
    `);

    console.log(`[Subscription Monitor] Found ${result.rows.length} expired trial servers`);

    for (const server of result.rows) {
      console.log(`[Subscription Monitor] Trial expired for user ${server.email} (server ${server.id})`);
      
      // Power off the droplet
      const powered_off = await powerOffDroplet(server.droplet_id);
      
      if (powered_off) {
        // Update server status
        await pool.query(
          `UPDATE servers SET status = 'stopped', updated_at = NOW() WHERE id = $1`,
          [server.id]
        );
        
        // Send email notification to admin
        try {
          await sendEmail(
            process.env.ADMIN_EMAIL || 'admin@cloudedbasement.ca',
            'Trial Expired - Server Powered Off',
            `Server ${server.id} for user ${server.email} has been powered off after 3-day trial expired.\n\nDroplet ID: ${server.droplet_id}\nServer will be destroyed in 7 days if no payment received.`
          );
        } catch (emailError) {
          console.error('[Subscription Monitor] Failed to send email:', emailError.message);
        }
        
        console.log(`[Subscription Monitor] Server ${server.id} powered off - trial expired`);
      }
    }
  } catch (error) {
    console.error('[Subscription Monitor] Error checking expired trials:', error);
  }
}

// Check for servers with failed/cancelled payments
async function checkFailedPayments() {
  try {
    const result = await pool.query(`
      SELECT s.*, u.email, p.created_at as last_payment
      FROM servers s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN payments p ON s.user_id = p.user_id 
        AND p.status = 'succeeded' 
        AND p.created_at > NOW() - INTERVAL '35 days'
      WHERE s.status = 'running'
        AND s.droplet_id IS NOT NULL
        AND s.created_at < NOW() - INTERVAL '3 days'
        AND p.id IS NULL
    `);

    console.log(`[Subscription Monitor] Found ${result.rows.length} servers with payment issues`);

    for (const server of result.rows) {
      console.log(`[Subscription Monitor] Payment failed for user ${server.email} (server ${server.id})`);
      
      // Power off the droplet
      const powered_off = await powerOffDroplet(server.droplet_id);
      
      if (powered_off) {
        // Update server status
        await pool.query(
          `UPDATE servers SET status = 'stopped', updated_at = NOW() WHERE id = $1`,
          [server.id]
        );
        
        // Send email notification to admin
        try {
          await sendEmail(
            process.env.ADMIN_EMAIL || 'admin@cloudedbasement.ca',
            'Payment Failed - Server Powered Off',
            `Server ${server.id} for user ${server.email} has been powered off due to payment failure.\n\nDroplet ID: ${server.droplet_id}\nLast payment: ${server.last_payment || 'None'}\nServer will be destroyed in 7 days if no payment received.`
          );
        } catch (emailError) {
          console.error('[Subscription Monitor] Failed to send email:', emailError.message);
        }
        
        console.log(`[Subscription Monitor] Server ${server.id} powered off - payment failed`);
      }
    }
  } catch (error) {
    console.error('[Subscription Monitor] Error checking failed payments:', error);
  }
}

// Check for servers that have been stopped for 7+ days and destroy them
async function destroyStoppedServers() {
  try {
    const result = await pool.query(`
      SELECT s.*, u.email 
      FROM servers s
      JOIN users u ON s.user_id = u.id
      WHERE s.status = 'stopped'
        AND s.updated_at < NOW() - INTERVAL '7 days'
        AND s.droplet_id IS NOT NULL
    `);

    console.log(`[Subscription Monitor] Found ${result.rows.length} servers to destroy`);

    for (const server of result.rows) {
      console.log(`[Subscription Monitor] Destroying server ${server.id} for user ${server.email} (stopped for 7+ days)`);
      
      const destroyed = await destroyDroplet(server.droplet_id, server.id);
      
      if (destroyed) {
        // Send email notification to admin
        try {
          await sendEmail(
            process.env.ADMIN_EMAIL || 'admin@cloudedbasement.ca',
            'Server Destroyed - No Payment',
            `Server ${server.id} for user ${server.email} has been destroyed after 7 days without payment.\n\nDroplet ID: ${server.droplet_id}\nPlan: ${server.plan}\nCreated: ${server.created_at}`
          );
        } catch (emailError) {
          console.error('[Subscription Monitor] Failed to send email:', emailError.message);
        }
        
        console.log(`[Subscription Monitor] Server ${server.id} destroyed permanently`);
      }
    }
  } catch (error) {
    console.error('[Subscription Monitor] Error destroying stopped servers:', error);
  }
}

// Check for trials ending soon and send warning emails
async function checkTrialWarnings() {
  try {
    // Find servers in trial (no payment) that are 1 or 2 days old
    const result = await pool.query(`
      SELECT s.*, u.email,
        EXTRACT(DAY FROM (INTERVAL '3 days' - (NOW() - s.created_at))) as days_left
      FROM servers s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN payments p ON s.user_id = p.user_id AND p.status = 'succeeded'
      WHERE s.status = 'running'
        AND p.id IS NULL
        AND s.droplet_id IS NOT NULL
        AND s.created_at >= NOW() - INTERVAL '2 days 23 hours'
        AND s.created_at < NOW() - INTERVAL '1 day'
    `);

    console.log(`[Subscription Monitor] Found ${result.rows.length} trials needing warning emails`);

    for (const server of result.rows) {
      const daysLeft = Math.max(1, Math.ceil(server.days_left));
      console.log(`[Subscription Monitor] Sending trial warning to ${server.email} (${daysLeft} days left)`);
      
      try {
        await sendTrialEndingEmail(server.email, daysLeft, server.droplet_name || server.name);
      } catch (emailError) {
        console.error('[Subscription Monitor] Failed to send trial warning:', emailError.message);
      }
    }
  } catch (error) {
    console.error('[Subscription Monitor] Error checking trial warnings:', error);
  }
}

// Main monitoring function
async function monitorSubscriptions() {
  console.log('[Subscription Monitor] Starting subscription check...');
  
  await checkTrialWarnings();
  await checkExpiredTrials();
  await checkFailedPayments();
  await destroyStoppedServers();
  
  console.log('[Subscription Monitor] Subscription check completed');
}

module.exports = {
  monitorSubscriptions,
  powerOffDroplet,
  destroyDroplet
};
