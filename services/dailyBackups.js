require('dotenv').config();
const pool = require('../db');
const axios = require('axios');
const { BACKUP_RETENTION_DAYS } = require('./backupConfig');

const DO_API = 'https://api.digitalocean.com/v2';
const RETENTION_DAYS = BACKUP_RETENTION_DAYS;

/**
 * Daily Backup Service (Premium plans only)
 * Creates daily snapshots of Premium droplets via DigitalOcean API.
 * Cleans up snapshots older than 7 days.
 * 
 * Note: Pro/Basic plans still get DO's built-in weekly backups.
 * This adds daily snapshots as a Premium perk.
 */

function doHeaders() {
  return {
    'Authorization': `Bearer ${process.env.DIGITALOCEAN_TOKEN}`,
    'Content-Type': 'application/json'
  };
}

// Create a snapshot of a droplet
async function createSnapshot(dropletId, dropletName) {
  const snapshotName = `basement-daily-${dropletId}-${new Date().toISOString().slice(0, 10)}`;
  
  try {
    const response = await axios.post(
      `${DO_API}/droplets/${dropletId}/actions`,
      { type: 'snapshot', name: snapshotName },
      { headers: doHeaders() }
    );
    
    console.log(`[Daily-Backup] Snapshot started for droplet ${dropletId} (${dropletName}): ${snapshotName}`);
    return { success: true, snapshotName, actionId: response.data.action?.id };
  } catch (error) {
    console.error(`[Daily-Backup] Failed to snapshot droplet ${dropletId}:`, error.response?.data || error.message);
    return { success: false, error: error.response?.data?.message || error.message };
  }
}

// Delete old snapshots (older than RETENTION_DAYS)
async function cleanupOldSnapshots() {
  try {
    // List all snapshots tagged with our naming convention (paginate all pages)
    const snapshots = [];
    let page = 1;

    while (true) {
      const response = await axios.get(
        `${DO_API}/snapshots?resource_type=droplet&per_page=200&page=${page}`,
        { headers: doHeaders() }
      );

      const pageSnapshots = response.data.snapshots || [];
      if (pageSnapshots.length === 0) {
        break;
      }

      snapshots.push(...pageSnapshots);
      page++;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);
    
    let deleted = 0;
    
    for (const snapshot of snapshots) {
      // Only delete our daily backup snapshots (not manual ones)
      if (!snapshot.name.startsWith('basement-daily-')) continue;
      
      const snapshotDate = new Date(snapshot.created_at);
      if (snapshotDate < cutoffDate) {
        try {
          await axios.delete(`${DO_API}/snapshots/${snapshot.id}`, {
            headers: doHeaders()
          });
          console.log(`[Daily-Backup] Deleted old snapshot: ${snapshot.name} (created ${snapshot.created_at})`);
          deleted++;
        } catch (err) {
          console.error(`[Daily-Backup] Failed to delete snapshot ${snapshot.name}:`, err.response?.data || err.message);
        }
      }
    }
    
    if (deleted > 0) {
      console.log(`[Daily-Backup] Cleaned up ${deleted} old snapshot(s)`);
    }
  } catch (error) {
    console.error('[Daily-Backup] Failed to list/cleanup snapshots:', error.response?.data || error.message);
  }
}

// Main job: snapshot all Premium droplets + cleanup old snapshots
async function runDailyBackups() {
  console.log('[Daily-Backup] Starting daily backup check...');
  
  try {
    // Find all active Premium servers with droplet IDs
    const result = await pool.query(`
      SELECT s.id, s.droplet_id, s.droplet_name, s.user_id, u.email
      FROM servers s
      JOIN users u ON s.user_id = u.id
      WHERE s.plan = 'premium'
        AND s.status = 'running'
        AND s.droplet_id IS NOT NULL
    `);
    
    const premiumServers = result.rows;
    console.log(`[Daily-Backup] Found ${premiumServers.length} Premium server(s) to back up`);
    
    if (premiumServers.length === 0) {
      return;
    }
    
    let succeeded = 0;
    let failed = 0;
    
    for (const server of premiumServers) {
      const result = await createSnapshot(server.droplet_id, server.droplet_name || `server-${server.id}`);
      if (result.success) {
        succeeded++;
      } else {
        failed++;
      }
      
      // Small delay between API calls to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`[Daily-Backup] Completed: ${succeeded} succeeded, ${failed} failed`);
    
    // Cleanup old snapshots after creating new ones
    await cleanupOldSnapshots();
    
  } catch (error) {
    console.error('[Daily-Backup] Job failed:', error.message);
  }
}

module.exports = { runDailyBackups };
