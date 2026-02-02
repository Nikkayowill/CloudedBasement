/**
 * Auto-SSL Service
 * Monitors domains without SSL and automatically provisions certificates
 * once DNS is pointing to the correct server IP
 */

const dns = require('dns').promises;
const pool = require('../db');
const { Client } = require('ssh2');

/**
 * Check all domains without SSL and auto-provision certificates
 * Runs every 5 minutes from index.js
 */
async function checkAndProvisionSSL() {
  console.log('[Auto-SSL] Starting SSL check...');
  
  try {
    // Get all domains without SSL that have a running server
    const result = await pool.query(`
      SELECT d.id, d.domain, d.server_id, d.user_id,
             s.ip_address, s.ssh_username, s.ssh_password, s.status
      FROM domains d
      JOIN servers s ON d.server_id = s.id
      WHERE d.ssl_enabled = false
        AND s.status = 'running'
        AND s.ip_address IS NOT NULL
    `);
    
    if (result.rows.length === 0) {
      console.log('[Auto-SSL] No pending domains to check');
      return;
    }
    
    console.log(`[Auto-SSL] Checking ${result.rows.length} domain(s)...`);
    
    for (const domain of result.rows) {
      await checkDomainAndProvision(domain);
    }
    
    console.log('[Auto-SSL] SSL check complete');
  } catch (error) {
    console.error('[Auto-SSL] Error in checkAndProvisionSSL:', error.message);
  }
}

/**
 * Check if a domain's DNS points to the server and provision SSL if so
 */
async function checkDomainAndProvision(domainRecord) {
  const { domain, ip_address, server_id, ssh_username, ssh_password } = domainRecord;
  
  try {
    console.log(`[Auto-SSL] Checking DNS for ${domain} (expected: ${ip_address})`);
    
    // Resolve domain A record
    const addresses = await dns.resolve4(domain);
    
    if (!addresses || addresses.length === 0) {
      console.log(`[Auto-SSL] ${domain}: No A records found`);
      return;
    }
    
    console.log(`[Auto-SSL] ${domain} resolves to: ${addresses.join(', ')}`);
    
    // Check if any A record matches our server IP
    if (!addresses.includes(ip_address)) {
      console.log(`[Auto-SSL] ${domain}: DNS not pointing to server yet (expected ${ip_address})`);
      return;
    }
    
    console.log(`[Auto-SSL] ${domain}: DNS verified! Provisioning SSL certificate...`);
    
    // DNS is correct - provision SSL
    await provisionSSLCertificate(domainRecord);
    
  } catch (error) {
    if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
      console.log(`[Auto-SSL] ${domain}: Domain not resolvable yet`);
    } else {
      console.error(`[Auto-SSL] ${domain}: DNS check error:`, error.message);
    }
  }
}

/**
 * SSH into server and run certbot to provision SSL certificate
 */
function provisionSSLCertificate(domainRecord) {
  const { domain, server_id, ip_address, ssh_username, ssh_password } = domainRecord;
  
  return new Promise((resolve, reject) => {
    const conn = new Client();
    
    conn.on('ready', () => {
      console.log(`[Auto-SSL] SSH connected to server ${server_id} for ${domain}`);
      
      // Security: Strict domain validation (RFC 1123)
      if (!/^[a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?)*$/i.test(domain)) {
        conn.end();
        return reject(new Error('Invalid domain format'));
      }
      
      // Use certbot with nginx plugin
      const certbotCmd = `certbot --nginx -d ${domain} --email admin@${domain} --non-interactive --agree-tos --redirect`;
      
      conn.exec(certbotCmd, { timeout: 120000 }, (err, stream) => {
        if (err) {
          conn.end();
          return reject(err);
        }
        
        let stdout = '';
        let stderr = '';
        
        stream.on('close', async (code) => {
          console.log(`[Auto-SSL] Certbot finished for ${domain}, exit code: ${code}`);
          
          const output = stdout + stderr;
          const success = output.includes('Congratulations') || 
                         output.includes('Successfully received certificate') ||
                         output.includes('Certificate not yet due for renewal');
          
          if (success || code === 0) {
            console.log(`[Auto-SSL] Certificate success for ${domain}, configuring reverse proxy...`);
            
            // Configure reverse proxy in the SSL server block
            const proxyCmd = `
              # Add proxy config to the SSL server block for this domain
              grep -q "proxy_pass" /etc/nginx/sites-available/default || \\
              sed -i '/${domain}/,/location \\/ {/{ s|location / {|location / {\\n        proxy_pass http://127.0.0.1:3000;\\n        proxy_http_version 1.1;\\n        proxy_set_header Host \\$host;\\n        proxy_set_header X-Real-IP \\$remote_addr;\\n        proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;\\n        proxy_set_header X-Forwarded-Proto \\$scheme;| }' /etc/nginx/sites-available/default
              nginx -t && systemctl reload nginx
            `;
            
            conn.exec(proxyCmd, { timeout: 30000 }, async (proxyErr, proxyStream) => {
              let proxyOut = '';
              
              proxyStream.on('close', async (proxyCode) => {
                conn.end();
                
                // Update database - SSL is now enabled
                try {
                  await pool.query('UPDATE domains SET ssl_enabled = true WHERE id = $1', [domainRecord.id]);
                  console.log(`[Auto-SSL] ✓ SSL enabled for ${domain}`);
                  resolve();
                } catch (dbErr) {
                  console.error(`[Auto-SSL] DB update failed for ${domain}:`, dbErr.message);
                  reject(dbErr);
                }
              });
              
              proxyStream.on('data', (data) => { proxyOut += data.toString(); });
              proxyStream.stderr.on('data', (data) => { proxyOut += data.toString(); });
            });
          } else {
            conn.end();
            console.error(`[Auto-SSL] Certbot failed for ${domain}: ${stderr.substring(0, 300)}`);
            reject(new Error(`Certbot failed: ${stderr.substring(0, 100)}`));
          }
        });
        
        stream.on('data', (data) => { stdout += data.toString(); });
        stream.stderr.on('data', (data) => { stderr += data.toString(); });
      });
    });
    
    conn.on('error', (err) => {
      console.error(`[Auto-SSL] SSH connection error for ${domain}:`, err.message);
      reject(err);
    });
    
    conn.connect({
      host: ip_address,
      port: 22,
      username: ssh_username,
      password: ssh_password,
      readyTimeout: 30000
    });
  }).catch(error => {
    console.error(`[Auto-SSL] Failed to provision ${domain}:`, error.message);
  });
}

module.exports = {
  checkAndProvisionSSL
};
