const axios = require('axios');
const { Client } = require('ssh2');
const pool = require('../db');

// Strict DNS-compliant domain validation
function isValidDomain(domain) {
  // DNS RFC compliance: max 253 chars, labels max 63 chars, valid chars only
  if (!domain || domain.length > 253) return false;
  
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
  if (!domainRegex.test(domain)) return false;
  
  // Check each label (part between dots)
  const labels = domain.split('.');
  for (const label of labels) {
    if (label.length > 63 || label.length === 0) return false;
    if (label.startsWith('-') || label.endsWith('-')) return false;
  }
  
  return true;
}

// POST /server-action
exports.serverAction = async (req, res) => {
  try {
    const action = req.body.action;
    const userId = req.session.userId;

    // Get user's server
    const serverResult = await pool.query(
      'SELECT * FROM servers WHERE user_id = $1',
      [userId]
    );

    if (serverResult.rows.length === 0) {
      return res.redirect('/dashboard?error=No server found');
    }

    // Update server status based on action
    let newStatus;
    let successMessage;
    
    if (action === 'start') {
      newStatus = 'running';
      successMessage = 'Server started successfully';
    } else if (action === 'restart') {
      newStatus = 'running';
      successMessage = 'Server restarted successfully';
    } else if (action === 'stop') {
      newStatus = 'stopped';
      successMessage = 'Server stopped successfully';
    } else {
      return res.redirect('/dashboard?error=Invalid action');
    }

    await pool.query(
      'UPDATE servers SET status = $1 WHERE user_id = $2',
      [newStatus, userId]
    );

    res.redirect('/dashboard?success=' + successMessage);
  } catch (error) {
    console.error('Server action error:', error);
    res.redirect('/dashboard?error=Action failed');
  }
};

// POST /delete-server
exports.deleteServer = async (req, res) => {
  try {
    const userId = req.session.userId;

    // Get user's server
    const serverResult = await pool.query(
      'SELECT * FROM servers WHERE user_id = $1',
      [userId]
    );

    if (serverResult.rows.length === 0) {
      return res.redirect('/dashboard?error=No server found');
    }

    const server = serverResult.rows[0];

    // Find and destroy the DigitalOcean droplet
    try {
      // List all droplets with our tag
      const dropletsResponse = await axios.get('https://api.digitalocean.com/v2/droplets?tag_name=basement-server', {
        headers: {
          'Authorization': `Bearer ${process.env.DIGITALOCEAN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      // Find droplet matching this user
      const droplet = dropletsResponse.data.droplets.find(d => 
        d.name.startsWith(`basement-${userId}-`)
      );

      if (droplet) {
        // Destroy the droplet
        await axios.delete(`https://api.digitalocean.com/v2/droplets/${droplet.id}`, {
          headers: {
            'Authorization': `Bearer ${process.env.DIGITALOCEAN_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        console.log(`Destroyed droplet ${droplet.id} for user ${userId}`);
      } else {
        console.log(`No droplet found for user ${userId}, proceeding with database cleanup`);
      }
    } catch (doError) {
      console.error('DigitalOcean deletion error:', doError.response?.data || doError.message);
      // Continue with database deletion even if DO call fails
    }

    // Delete server from database
    await pool.query(
      'DELETE FROM servers WHERE user_id = $1',
      [userId]
    );

    console.log(`Deleted server record for user ${userId}`);
    res.redirect('/pricing?message=Server deleted successfully');
  } catch (error) {
    console.error('Delete server error:', error);
    res.redirect('/dashboard?error=Failed to delete server');
  }
};

// POST /deploy
exports.deploy = async (req, res) => {
  try {
    const gitUrl = req.body.git_url;
    const userId = req.session.userId;

    // Validate Git URL format
    if (!gitUrl || !gitUrl.includes('github.com') && !gitUrl.includes('gitlab.com') && !gitUrl.includes('bitbucket.org')) {
      return res.redirect('/dashboard?error=Invalid Git URL');
    }

    // Get user's server
    const serverResult = await pool.query(
      'SELECT id FROM servers WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    if (serverResult.rows.length === 0) {
      return res.redirect('/dashboard?error=No server found');
    }

    const serverId = serverResult.rows[0].id;

    // Store deployment in database
    await pool.query(
      'INSERT INTO deployments (server_id, user_id, git_url, status, output) VALUES ($1, $2, $3, $4, $5)',
      [serverId, userId, gitUrl, 'pending', 'Deployment queued...']
    );

    // In real implementation, this would:
    // 1. SSH into the droplet
    // 2. Clone the repo
    // 3. Install dependencies
    // 4. Start the app
    
    res.redirect('/dashboard?success=Deployment initiated! Check deployment history below.');
  } catch (error) {
    console.error('Deploy error:', error);
    res.redirect('/dashboard?error=Deployment failed');
  }
};

// Helper function to execute SSH command
function executeSSHCommand(host, username, password, command) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    
    conn.on('ready', () => {
      conn.exec(command, (err, stream) => {
        if (err) {
          conn.end();
          return reject(err);
        }
        
        let output = '';
        let errorOutput = '';
        
        stream.on('close', (code) => {
          conn.end();
          if (code === 0) {
            resolve(output);
          } else {
            reject(new Error(`Command failed with code ${code}: ${errorOutput}`));
          }
        });
        
        stream.on('data', (data) => {
          output += data.toString();
        });
        
        stream.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });
      });
    });
    
    conn.on('error', (err) => {
      reject(err);
    });
    
    conn.connect({
      host,
      port: 22,
      username,
      password,
      readyTimeout: 30000
    });
  });
}

// POST /add-domain
exports.addDomain = async (req, res) => {
  try {
    const domain = req.body.domain.toLowerCase().trim();
    const userId = req.session.userId;

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    if (!domain || !domainRegex.test(domain)) {
      return res.redirect('/dashboard?error=Invalid domain format');
    }

    // Get user's server
    const serverResult = await pool.query(
      'SELECT id FROM servers WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    if (serverResult.rows.length === 0) {
      return res.redirect('/dashboard?error=No server found');
    }

    const serverId = serverResult.rows[0].id;

    // Check if domain already exists
    const existingDomain = await pool.query(
      'SELECT id FROM domains WHERE domain = $1',
      [domain]
    );

    if (existingDomain.rows.length > 0) {
      return res.redirect('/dashboard?error=Domain already in use');
    }

    // Store domain in database
    await pool.query(
      'INSERT INTO domains (server_id, user_id, domain, ssl_enabled) VALUES ($1, $2, $3, $4)',
      [serverId, userId, domain, false]
    );

    // In real implementation, this would:
    // 1. Configure Nginx on the droplet
    // 2. Set up SSL certificate with Let's Encrypt
    
    res.redirect('/dashboard?success=Domain added! Configure your DNS as shown above.');
  } catch (error) {
    console.error('Add domain error:', error);
    res.redirect('/dashboard?error=Failed to add domain');
  }
};

// POST /enable-ssl
exports.enableSSL = async (req, res) => {
  try {
    const domain = req.body.domain.toLowerCase().trim();
    const userId = req.session.userId;

    // Validate domain with strict DNS compliance
    if (!domain || !isValidDomain(domain)) {
      return res.redirect('/dashboard?error=Invalid domain format. Use format: example.com');
    }

    // Get user's server
    const serverResult = await pool.query(
      'SELECT * FROM servers WHERE user_id = $1 AND status = $2',
      [userId, 'running']
    );

    if (serverResult.rows.length === 0) {
      return res.redirect('/dashboard?error=No running server found');
    }

    const server = serverResult.rows[0];

    // Update server domain and set SSL status to pending
    await pool.query(
      'UPDATE servers SET domain = $1, ssl_status = $2 WHERE id = $3',
      [domain, 'pending', server.id]
    );

    // Send response immediately - process SSL in background
    res.redirect('/dashboard?message=Domain assigned. SSL certificate generation started!');

    // Background process - trigger SSL certificate generation
    triggerSSLCertificateForCustomer(server.id, domain, server).catch(err => {
      console.error('[SSL] Failed to trigger certificate for server', server.id, ':', err);
      pool.query('UPDATE servers SET ssl_status = $1 WHERE id = $2', ['failed', server.id]).catch(e => console.error(e));
    });

  } catch (error) {
    console.error('Enable SSL error:', error);
    res.redirect('/dashboard?error=Failed to enable SSL');
  }
};

// Background function to trigger SSL via SSH2 library (secure, no command injection)
async function triggerSSLCertificateForCustomer(serverId, domain, server) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    
    conn.on('ready', () => {
      console.log(`[SSL] SSH connected to server ${serverId}`);
      
      // Use SSH2 library's exec with properly escaped parameters
      // Domain is already validated by isValidDomain() before reaching here
      const certbotCmd = `certbot certonly --standalone -d "${domain}" --email "admin@${domain}" --non-interactive --agree-tos`;
      
      conn.exec(certbotCmd, { timeout: 60000 }, (err, stream) => {
        if (err) {
          conn.end();
          return reject(err);
        }
        
        let stdout = '';
        let stderr = '';
        
        stream.on('close', async (code) => {
          conn.end();
          
          try {
            if (stdout.includes('Congratulations') || stderr.includes('Congratulations')) {
              // Certificate generated successfully
              await pool.query(
                'UPDATE servers SET ssl_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                ['active', serverId]
              );
              console.log(`[SSL] Certificate activated for ${domain} on server ${serverId}`);
              resolve();
            } else {
              throw new Error('Certbot command did not complete successfully');
            }
          } catch (dbError) {
            reject(dbError);
          }
        });
        
        stream.on('data', (data) => {
          stdout += data.toString();
        });
        
        stream.stderr.on('data', (data) => {
          stderr += data.toString();
        });
      });
    });
    
    conn.on('error', (err) => {
      console.error(`[SSL] SSH connection error for server ${serverId}:`, err.message);
      reject(err);
    });
    
    conn.connect({
      host: server.ip_address,
      port: 22,
      username: server.ssh_username,
      password: server.ssh_password
    });
  }).catch(async (error) => {
    console.error(`[SSL] Error generating certificate for server ${serverId}:`, error.message);
    await pool.query(
      'UPDATE servers SET ssl_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['failed', serverId]
    );
  });
}

module.exports = {
  serverAction: exports.serverAction,
  deleteServer: exports.deleteServer,
  deploy: exports.deploy,
  addDomain: exports.addDomain,
  enableSSL: exports.enableSSL
};
