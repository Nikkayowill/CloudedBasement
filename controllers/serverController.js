// Validate Git URL against trusted hosts and repo path format
function isValidGitUrl(gitUrl, trustedHosts) {
  if (typeof gitUrl !== 'string') return false;
  // Support git://, ssh://, https://, and scp-like syntax
  let host = null;
  let repoPath = null;
  try {
    // HTTPS or SSH URL
    const urlMatch = gitUrl.match(/^(https?|ssh|git):\/\/(.+?)(?:[:/])([^\s]+?)(?:\.git)?$/i);
    if (urlMatch) {
      host = urlMatch[2].replace(/[:/].*$/, '');
      repoPath = urlMatch[3];
    } else {
      // SCP-like SSH syntax: git@host:owner/repo.git
      const scpMatch = gitUrl.match(/^([\w.-]+)@([\w.-]+):(.+?)(?:\.git)?$/);
      if (scpMatch) {
        host = scpMatch[2];
        repoPath = scpMatch[3];
      }
    }
    if (!host || !repoPath) return false;
    if (!trustedHosts.includes(host.toLowerCase())) return false;
    // Basic repo path validation: must be owner/repo or group/subgroup/repo
    if (!/^([\w.-]+\/)+[\w.-]+$/.test(repoPath)) return false;
    return true;
  } catch {
    return false;
  }
}
const axios = require('axios');
const crypto = require('crypto');
const dns = require('dns').promises;
const net = require('net');
const { Client } = require('ssh2');
const pool = require('../db');
const { escapeHtml } = require('../src/utils/helpers');
const { getUserServer, verifyServerOwnership, updateServerStatus, appendDeploymentOutput, updateDeploymentStatus } = require('../src/utils/db-helpers');
const { SERVER_STATUS, DEPLOYMENT_STATUS, TIMEOUTS, PORTS } = require('../src/utils/constants');
const { sendDeployErrorEmail, sendDeploySuccessEmail } = require('../services/email');
const { analyzeDeploymentFailure } = require('../services/aiDiagnosis');
const { decryptSshPassword } = require('../src/utils/sshCrypto');
const { createRealServer } = require('../services/digitalocean');
const { generateSubdomain, createDNSRecord, deleteDNSRecord } = require('../services/dns');
const { generateNginxConfig, isValidDomainName } = require('../src/utils/nginxTemplates');

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

    // Get user's server (using helper)
    const server = await getUserServer(userId);

    if (!server) {
      return res.redirect('/dashboard?error=No server found');
    }

    // Map actions to DigitalOcean API endpoints
    let doAction;
    let newStatus;
    let successMessage;
    
    if (action === 'start') {
      doAction = 'power_on';
      newStatus = SERVER_STATUS.RUNNING;
      successMessage = 'Server started successfully';
    } else if (action === 'restart') {
      doAction = 'reboot';
      newStatus = SERVER_STATUS.RUNNING;
      successMessage = 'Server restarted successfully';
    } else if (action === 'stop') {
      doAction = 'power_off';
      newStatus = SERVER_STATUS.STOPPED;
      successMessage = 'Server stopped successfully';
    } else {
      return res.redirect('/dashboard?error=Invalid action');
    }

    // Call DigitalOcean API if droplet_id exists
    if (server.droplet_id) {
      try {
        await axios.post(
          `https://api.digitalocean.com/v2/droplets/${server.droplet_id}/actions`,
          { type: doAction },
          {
            headers: {
              'Authorization': `Bearer ${process.env.DIGITALOCEAN_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log(`DigitalOcean action ${doAction} sent to droplet ${server.droplet_id}`);
      } catch (doError) {
        console.error('DigitalOcean action error:', doError.response?.data || doError.message);
        // If droplet not found (404), continue anyway - it might be manually deleted
        if (doError.response?.status === 404) {
          console.log(`Droplet ${server.droplet_id} not found in DO, updating database only`);
        } else {
          return res.redirect('/dashboard?error=Failed to execute action on server');
        }
      }
    }

    // Update database status (scoped by server ID to be safe)
    await pool.query(
      'UPDATE servers SET status = $1 WHERE id = $2 AND user_id = $3',
      [newStatus, server.id, userId]
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

    // Get user's server and email
    const serverResult = await pool.query(
      'SELECT s.*, u.email FROM servers s JOIN users u ON s.user_id = u.id WHERE s.user_id = $1',
      [userId]
    );

    if (serverResult.rows.length === 0) {
      return res.redirect('/dashboard?error=No server found');
    }

    const server = serverResult.rows[0];
    const userEmail = server.email;

    // Find droplet info for admin notification
    let dropletId = server.droplet_id || 'Unknown';
    let dropletIp = server.ip_address || 'Unknown';
    
    // CRITICAL: Cancel Stripe subscription FIRST (stops future billing)
    if (server.stripe_subscription_id) {
      try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        await stripe.subscriptions.cancel(server.stripe_subscription_id);
        console.log(`Cancelled Stripe subscription: ${server.stripe_subscription_id}`);
      } catch (stripeError) {
        console.error('Failed to cancel Stripe subscription:', stripeError.message);
        // Continue with deletion even if Stripe fails (we'll handle manually)
      }
    }
    
    // Destroy DigitalOcean droplet automatically
    if (dropletId && dropletId !== 'Unknown') {
      try {
        const { destroyDroplet } = require('../services/digitalocean');
        await destroyDroplet(dropletId);
        console.log(`Destroyed droplet ${dropletId}`);
      } catch (doError) {
        console.error('Failed to destroy droplet:', doError.message);
        // Continue with deletion, admin will be notified
      }
    }

    // Mark server as deleted (keep record for audit)
    await pool.query(
      'UPDATE servers SET status = $1, cancelled_at = CURRENT_TIMESTAMP WHERE user_id = $2',
      ['deleted', userId]
    );

    console.log(`Marked server as deleted for user ${userId}`);

    // Send admin notification email (don't wait for it)
    const { sendEmail } = require('../services/email');
    const emailHtml = `
      <h2>Customer Cancelled Subscription</h2>
      <p><strong>User ID:</strong> ${userId}</p>
      <p><strong>Email:</strong> ${userEmail}</p>
      <p><strong>Droplet ID:</strong> ${dropletId}</p>
      <p><strong>IP Address:</strong> ${dropletIp}</p>
      <p><strong>Plan:</strong> ${server.plan || 'Unknown'}</p>
      <p><strong>Time:</strong> ${new Date().toISOString()}</p>
      <p><strong>Subscription ID:</strong> ${server.stripe_subscription_id || 'N/A'}</p>
      <hr>
      <p>✅ Stripe subscription cancelled automatically</p>
      <p>✅ Droplet destruction attempted</p>
    `;
    const emailText = `Customer Cancelled Subscription\n\nUser ID: ${userId}\nEmail: ${userEmail}\nDroplet ID: ${dropletId}\nIP: ${dropletIp}\nPlan: ${server.plan || 'Unknown'}\nTime: ${new Date().toISOString()}`;
    
    sendEmail('support@cloudedbasement.ca', 'Subscription Cancelled', emailHtml, emailText)
      .catch(err => console.error('Failed to send cancellation notification:', err));

    res.redirect('/pricing?success=Plan cancelled successfully. We\'re sad to see you go!');
  } catch (error) {
    console.error('Delete server error:', error);
    res.redirect('/dashboard?error=Failed to cancel plan');
  }
};

// POST /deploy
exports.deploy = async (req, res) => {
  try {
    const gitUrl = req.body.git_url;
    const userId = req.session.userId;

    // Validate Git URL - only allow trusted platforms
    if (!gitUrl) {
      return res.redirect('/dashboard?error=Git URL is required');
    }
    
    // Whitelist trusted Git hosting platforms (exact hostname match)
    const trustedHosts = [
      'github.com',
      'gitlab.com',
      'bitbucket.org',
      'codeberg.org',
      'sr.ht' // SourceHut
    ];
    
    if (!isValidGitUrl(gitUrl, trustedHosts)) {
      return res.redirect('/dashboard?error=Invalid Git URL. Only GitHub, GitLab, Bitbucket, Codeberg, and SourceHut are supported.');
    }
    
    // Prevent SSRF attacks - block private IPs
    const privateIpPattern = /(localhost|127\.0\.0\.1|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/i;
    if (privateIpPattern.test(gitUrl)) {
      return res.redirect('/dashboard?error=Cannot deploy from private IP addresses');
    }

    // Get user's server
    const serverResult = await pool.query(
      'SELECT * FROM servers WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    if (serverResult.rows.length === 0) {
      return res.redirect('/dashboard?error=No server found');
    }

    const server = serverResult.rows[0];
    server.ssh_password = decryptSshPassword(server.ssh_password, server.ssh_password_iv);

    if (!server.ip_address || !server.ssh_password) {
      return res.redirect('/dashboard?error=Server not ready yet. Please wait for provisioning to complete.');
    }

    // Check if this is a new site or an update
    const existingDeployment = await pool.query(
      'SELECT id FROM deployments WHERE server_id = $1 AND git_url = $2 LIMIT 1',
      [server.id, gitUrl]
    );

    const isUpdate = existingDeployment.rows.length > 0;

    // If new site, check site limit
    if (!isUpdate) {
      const siteCount = await pool.query(
        'SELECT COUNT(DISTINCT git_url) as count FROM deployments WHERE server_id = $1',
        [server.id]
      );

      const currentSites = parseInt(siteCount.rows[0].count);
      const siteLimit = server.site_limit || 2;

      if (currentSites >= siteLimit) {
        return res.redirect(`/dashboard?error=Site limit reached (${siteLimit} sites). Please upgrade your plan or delete an existing site to add a new one.`);
      }
    }

    // Extract repo name from URL
    const repoName = gitUrl.split('/').pop().replace('.git', '').replace(/[^a-zA-Z0-9_-]/g, '');
    
    // Generate subdomain for this deployment (Vercel-style)
    const subdomain = generateSubdomain(repoName, userId);
    console.log(`[DEPLOY] Generated subdomain: ${subdomain}.cloudedbasement.ca`);
    
    // Create DNS record pointing to user's server
    let dnsRecordId = null;
    try {
      const dnsResult = await createDNSRecord(subdomain, server.ip_address);
      if (dnsResult.success) {
        dnsRecordId = dnsResult.recordId;
        console.log(`[DEPLOY] DNS record created: ${subdomain}.cloudedbasement.ca -> ${server.ip_address} (ID: ${dnsRecordId})`);
      } else {
        console.error(`[DEPLOY] Failed to create DNS record: ${dnsResult.error}`);
      }
    } catch (dnsErr) {
      console.error(`[DEPLOY] DNS creation error:`, dnsErr);
    }
    
    // Store deployment in database with pending status and subdomain
    const deployResult = await pool.query(
      'INSERT INTO deployments (server_id, user_id, git_url, status, output, subdomain, dns_record_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [server.id, userId, gitUrl, 'pending', 'Starting deployment...', subdomain, dnsRecordId]
    );

    const deploymentId = deployResult.rows[0].id;
    console.log(`[DEPLOY] Deployment #${deploymentId} started for user ${userId}: ${gitUrl} -> ${subdomain}.cloudedbasement.ca`);

    // Perform deployment asynchronously (don't block response)
    setImmediate(() => {
      performDeployment(server, gitUrl, repoName, deploymentId, subdomain).catch(async (err) => {
        console.error(`[DEPLOY] Deployment #${deploymentId} failed:`, err);
        console.error(`[DEPLOY] Stack trace:`, err.stack);
        const failureOutput = `❌ Deployment failed: ${err.message}\n\nStack trace:\n${err.stack}`;
        try {
          await pool.query(
            'UPDATE deployments SET status = $1, output = $2, deployed_at = NOW() WHERE id = $3',
            ['failed', failureOutput, deploymentId]
          );
        } catch (dbErr) {
          console.error(`[DEPLOY] Failed to update deployment #${deploymentId} status:`, dbErr);
        }
        analyzeDeploymentFailure(deploymentId, failureOutput);
      });
    });

    res.redirect('/dashboard?success=Deployment started! Check deployment history below for progress.');
  } catch (error) {
    console.error('Deploy error:', error);
    res.redirect('/dashboard?error=Deployment failed to start');
  }
};

// POST /api/deploy — API-key-authenticated deploy (JSON responses, no CSRF, no redirects)
exports.apiDeploy = async (req, res) => {
  try {
    const gitUrl = req.body.git_url;
    const userId = req.userId; // set by apiKeyAuth middleware

    if (!gitUrl) {
      return res.status(400).json({ error: 'git_url is required' });
    }

    const trustedHosts = ['github.com', 'gitlab.com', 'bitbucket.org', 'codeberg.org', 'sr.ht'];
    if (!isValidGitUrl(gitUrl, trustedHosts)) {
      return res.status(400).json({ error: 'Invalid Git URL. Only GitHub, GitLab, Bitbucket, Codeberg, and SourceHut are supported.' });
    }

    const privateIpPattern = /(localhost|127\.0\.0\.1|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/i;
    if (privateIpPattern.test(gitUrl)) {
      return res.status(400).json({ error: 'Cannot deploy from private IP addresses' });
    }

    const serverResult = await pool.query(
      'SELECT * FROM servers WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    if (serverResult.rows.length === 0) {
      return res.status(404).json({ error: 'No server found for this account' });
    }

    const server = serverResult.rows[0];
    server.ssh_password = decryptSshPassword(server.ssh_password, server.ssh_password_iv);

    if (!server.ip_address || !server.ssh_password) {
      return res.status(503).json({ error: 'Server not ready yet. Please wait for provisioning to complete.' });
    }

    const existingDeployment = await pool.query(
      'SELECT id FROM deployments WHERE server_id = $1 AND git_url = $2 LIMIT 1',
      [server.id, gitUrl]
    );
    const isUpdate = existingDeployment.rows.length > 0;

    if (!isUpdate) {
      const siteCount = await pool.query(
        'SELECT COUNT(DISTINCT git_url) as count FROM deployments WHERE server_id = $1',
        [server.id]
      );
      const currentSites = parseInt(siteCount.rows[0].count);
      const siteLimit = server.site_limit || 2;
      if (currentSites >= siteLimit) {
        return res.status(400).json({ error: `Site limit reached (${siteLimit} sites). Upgrade your plan or delete an existing site.` });
      }
    }

    const repoName = gitUrl.split('/').pop().replace('.git', '').replace(/[^a-zA-Z0-9_-]/g, '');
    const subdomain = generateSubdomain(repoName, userId);

    let dnsRecordId = null;
    try {
      const dnsResult = await createDNSRecord(subdomain, server.ip_address);
      if (dnsResult.success) {
        dnsRecordId = dnsResult.recordId;
      } else {
        console.error(`[API DEPLOY] Failed to create DNS record for ${subdomain}: ${dnsResult.error}`);
      }
    } catch (dnsErr) {
      console.error(`[API DEPLOY] DNS creation error for subdomain ${subdomain} -> ${server.ip_address}:`, dnsErr.message);
    }

    const deployResult = await pool.query(
      'INSERT INTO deployments (server_id, user_id, git_url, status, output, subdomain, dns_record_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [server.id, userId, gitUrl, 'pending', 'Starting deployment...', subdomain, dnsRecordId]
    );
    const deploymentId = deployResult.rows[0].id;
    console.log(`[API DEPLOY] Deployment #${deploymentId} started via API key for user ${userId}: ${gitUrl}`);

    setImmediate(() => {
      performDeployment(server, gitUrl, repoName, deploymentId, subdomain).catch(async (err) => {
        const failureOutput = `❌ Deployment failed: ${err.message}\n\nStack trace:\n${err.stack}`;
        pool.query(
          'UPDATE deployments SET status = $1, output = $2, deployed_at = NOW() WHERE id = $3',
          ['failed', failureOutput, deploymentId]
        ).catch(() => {});
        analyzeDeploymentFailure(deploymentId, failureOutput);
      });
    });

    res.status(202).json({
      deploymentId,
      subdomain: `${subdomain}.cloudedbasement.ca`,
      status: 'pending',
      message: 'Deployment started. Poll GET /api/deployment-status/:id for progress.',
    });
  } catch (error) {
    console.error('[API DEPLOY] Error:', error);
    res.status(500).json({ error: 'Deployment failed to start' });
  }
};

// Roll back to a specific past deployment by its commit SHA
exports.rollback = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { deploymentId } = req.body;

    if (!deploymentId) {
      return res.redirect('/dashboard?error=Missing deployment ID');
    }

    // Fetch target deployment — verify ownership
    const depResult = await pool.query(
      'SELECT d.*, s.id as server_id FROM deployments d JOIN servers s ON s.id = d.server_id WHERE d.id = $1 AND d.user_id = $2',
      [deploymentId, userId]
    );

    if (depResult.rows.length === 0) {
      return res.redirect('/dashboard?error=Deployment not found');
    }

    const target = depResult.rows[0];

    if (target.status !== 'success') {
      return res.redirect('/dashboard?error=Can only roll back to a successful deployment');
    }

    if (!target.commit_sha) {
      return res.redirect('/dashboard?error=This deployment has no commit SHA — redeploy it once to enable rollback');
    }

    // Get user's server
    const serverResult = await pool.query(
      'SELECT * FROM servers WHERE id = $1 AND user_id = $2',
      [target.server_id, userId]
    );

    if (serverResult.rows.length === 0) {
      return res.redirect('/dashboard?error=Server not found');
    }

    const server = serverResult.rows[0];
    server.ssh_password = decryptSshPassword(server.ssh_password, server.ssh_password_iv);

    if (!server.ip_address || !server.ssh_password) {
      return res.redirect('/dashboard?error=Server not ready');
    }

    const repoName = target.git_url.split('/').pop().replace('.git', '').replace(/[^a-zA-Z0-9_-]/g, '');

    // Create a new deployment record for rollback tracking.
    // Reuse the original subdomain (no new DNS record needed — domain already exists).
    const rollbackResult = await pool.query(
      `INSERT INTO deployments
         (server_id, user_id, git_url, status, output, subdomain, dns_record_id, branch)
       VALUES ($1, $2, $3, 'pending', $4, $5, $6, $7)
       RETURNING id`,
      [
        server.id,
        userId,
        target.git_url,
        `Rolling back to commit ${target.commit_sha.slice(0, 7)}...`,
        target.subdomain,
        target.dns_record_id,
        target.branch,
      ]
    );

    const newDeploymentId = rollbackResult.rows[0].id;
    console.log(`[ROLLBACK] Deployment #${newDeploymentId} rolling back to ${target.commit_sha.slice(0, 7)} for user ${userId}`);

    setImmediate(() => {
      performDeployment(
        server,
        target.git_url,
        repoName,
        newDeploymentId,
        target.subdomain,
        target.branch,
        target.commit_sha,   // ← triggers the rollback path in performDeployment
      ).catch(async (err) => {
        console.error(`[ROLLBACK] Deployment #${newDeploymentId} failed:`, err.message);
        const failureOutput = `❌ Rollback failed: ${err.message}`;
        try {
          await pool.query(
            'UPDATE deployments SET status = $1, output = $2, deployed_at = NOW() WHERE id = $3',
            ['failed', failureOutput, newDeploymentId]
          );
        } catch (dbErr) {
          console.error(`[ROLLBACK] Failed to update deployment status:`, dbErr.message);
        }
        analyzeDeploymentFailure(newDeploymentId, failureOutput);
      });
    });

    res.redirect('/dashboard?success=Rollback started! Check deployment history for progress.');
  } catch (error) {
    console.error('[ROLLBACK] Error:', error);
    res.redirect('/dashboard?error=Rollback failed to start');
  }
};

// Async deployment function
async function performDeployment(server, gitUrl, repoName, deploymentId, subdomain = null, branch = null, rollbackSha = null) {
  console.log(`[DEPLOY] ============================================`);
  console.log(`[DEPLOY] Starting performDeployment for deployment #${deploymentId}`);
  console.log(`[DEPLOY] Server IP: ${server.ip_address}, Repo: ${gitUrl}`);
  console.log(`[DEPLOY] Subdomain: ${subdomain ? `${subdomain}.cloudedbasement.ca` : 'none'}`);
  console.log(`[DEPLOY] Branch: ${branch || 'auto-detect'}`);
  console.log(`[DEPLOY] ============================================`);
  
  const conn = new Client();
  let output = '';

  try {
    console.log(`[DEPLOY] Attempting SSH connection to ${server.ip_address}...`);
    
    // Connect via SSH
    await new Promise((resolve, reject) => {
      conn.on('ready', resolve);
      conn.on('error', (err) => {
        console.error(`[DEPLOY] SSH connection error:`, err.message);
        reject(err);
      });
      conn.connect({
        host: server.ip_address,
        port: 22,
        username: 'root',
        password: server.ssh_password,
        readyTimeout: 30000
      });
    });

    output += '✓ Connected to server via SSH\n';
    await updateDeploymentOutput(deploymentId, output, 'in-progress');

    // Clone repository via git (unified path — captures commit SHA for rollback)
    output += `\n[1/5] Cloning repository...\n`;

    // Security: only HTTPS URLs permitted
    if (!gitUrl.match(/^https:\/\/[\w.-]+\.[a-z]{2,}\//)) {
      throw new Error('Only HTTPS git URLs are supported. Use format: https://github.com/username/repo');
    }

    const safeUrl = gitUrl.replace(/["$`\\]/g, '\\$&');

    if (rollbackSha) {
      // Rollback path: validate SHA then clone full history + checkout exact commit
      if (!/^[0-9a-f]{40}$/i.test(rollbackSha)) {
        throw new Error('Invalid commit SHA for rollback.');
      }
      output += `Rolling back to commit ${rollbackSha.slice(0, 7)}...\n`;
      await execSSH(conn, `cd /root && rm -rf ${repoName} && git clone -- "${safeUrl}" ${repoName}`);
      await execSSH(conn, `cd /root/${repoName} && git checkout ${rollbackSha}`);
      output += `✓ Checked out commit ${rollbackSha.slice(0, 7)}\n`;
    } else {
      // Normal deploy path: shallow clone for speed, try main then master
      const branchesToTry = branch ? [branch] : ['main', 'master'];
      let cloneSuccess = false;

      for (const tryBranch of branchesToTry) {
        // Sanitize branch name — only allow safe git ref characters
        const safeBranch = tryBranch.replace(/[^a-zA-Z0-9._\/-]/g, '');
        if (!safeBranch) throw new Error(`Invalid branch name: '${tryBranch}'`);
        try {
          output += `Cloning branch '${safeBranch}'...\n`;
          await execSSH(conn, `cd /root && rm -rf ${repoName} && git clone --depth 1 --branch ${safeBranch} -- "${safeUrl}" ${repoName}`);
          output += `✓ Cloned branch '${safeBranch}'\n`;
          cloneSuccess = true;
          break;
        } catch (err) {
          output += `Branch '${safeBranch}' not found\n`;
          if (safeBranch === branchesToTry[branchesToTry.length - 1].replace(/[^a-zA-Z0-9._\/-]/g, '')) {
            throw new Error(`Repository not found or is private. Make sure:\n1. Repository URL is correct\n2. Repository is public\n3. Branch '${safeBranch}' exists`);
          }
        }
      }

      if (!cloneSuccess) {
        throw new Error('Failed to clone repository. Please check the URL and try again.');
      }
    }

    // Capture commit SHA — enables rollback to this exact state
    const shaOutput = await execSSH(conn, `cd /root/${repoName} && git rev-parse HEAD`);
    const commitSha = shaOutput.trim();
    output += `Commit: ${commitSha.slice(0, 7)}\n`;

    // Persist SHA (non-blocking — don't let a DB hiccup fail the deploy)
    pool.query('UPDATE deployments SET commit_sha = $1 WHERE id = $2', [commitSha, deploymentId])
      .catch(e => console.error('[DEPLOY] Failed to save commit_sha:', e.message));

    await updateDeploymentOutput(deploymentId, output, 'in-progress');

    // Detect project type
    output += `\n[2/5] Detecting project type...\n`;
    const hasPackageJson = await fileExists(conn, `/root/${repoName}/package.json`);
    const hasCargoToml = await fileExists(conn, `/root/${repoName}/Cargo.toml`);
    const hasGoMod = await fileExists(conn, `/root/${repoName}/go.mod`);
    const hasRequirementsTxt = await fileExists(conn, `/root/${repoName}/requirements.txt`);
    const hasIndexHtml = await fileExists(conn, `/root/${repoName}/index.html`);

    if (hasPackageJson) {
      // Node.js project
      const packageJson = await execSSH(conn, `cat /root/${repoName}/package.json`);
      const isReactOrVue = packageJson.includes('"react"') || packageJson.includes('"vue"') || packageJson.includes('"build"');
      
      if (isReactOrVue) {
        output += `✓ Detected: Static site (React/Vue)\n`;
        output = await deployStaticSite(conn, repoName, output, deploymentId, server.id, subdomain);
      } else {
        output += `✓ Detected: Node.js backend\n`;
        output = await deployNodeBackend(conn, repoName, output, deploymentId, server.id, subdomain);
      }
    } else if (hasCargoToml) {
      output += `✓ Detected: Rust application\n`;
      output = await deployRustApp(conn, repoName, output, deploymentId, server.id, subdomain);
    } else if (hasGoMod) {
      output += `✓ Detected: Go application\n`;
      output = await deployGoApp(conn, repoName, output, deploymentId, server.id, subdomain);
    } else if (hasRequirementsTxt) {
      output += `✓ Detected: Python application\n`;
      output = await deployPythonApp(conn, repoName, output, deploymentId, server.id, subdomain);
    } else if (hasIndexHtml) {
      output += `✓ Detected: Static HTML site\n`;
      output = await deployStaticHTML(conn, repoName, output, deploymentId, subdomain);
    } else {
      throw new Error('Unable to detect project type. Ensure package.json, requirements.txt, or index.html exists.');
    }

    output += `\n✅ Deployment completed successfully!\n`;
    await updateDeploymentOutput(deploymentId, output, 'success');

    // Success notifications — fire-and-forget, never block the deploy
    try {
      const notifyResult = await pool.query(
        'SELECT u.email, s.notify_webhook_url FROM users u JOIN servers s ON s.user_id = u.id WHERE s.id = $1',
        [server.id]
      );
      const { email, notify_webhook_url } = notifyResult.rows[0] || {};
      if (email) sendDeploySuccessEmail(email, gitUrl, subdomain).catch(() => {});
      if (notify_webhook_url) fireDeployWebhook(notify_webhook_url, 'deploy.success', { gitUrl, branch, subdomain, deploymentId, commitSha: rollbackSha || commitSha });
    } catch (_) {}

  } catch (error) {
    console.error(`[DEPLOY] Deployment #${deploymentId} error:`, error);
    output += `\n❌ Deployment failed: ${error.message}\n`;
    output += `Error details: ${error.stack || error}\n`;
    await updateDeploymentOutput(deploymentId, output, 'failed');

    // AI diagnosis — fire-and-forget, never blocks
    analyzeDeploymentFailure(deploymentId, output);

    // Failure notifications
    try {
      const notifyResult = await pool.query(
        'SELECT u.email, s.notify_webhook_url FROM users u JOIN servers s ON s.user_id = u.id WHERE s.id = $1',
        [server.id]
      );
      const { email, notify_webhook_url } = notifyResult.rows[0] || {};
      if (email) sendDeployErrorEmail(email, gitUrl, error.message).catch(() => {});
      if (notify_webhook_url) fireDeployWebhook(notify_webhook_url, 'deploy.failure', { gitUrl, branch, subdomain, deploymentId, error: error.message });
    } catch (emailErr) {
      console.error(`[DEPLOY] Failed to send deploy error email:`, emailErr.message);
    }
  } finally {
    conn.end();
  }
}

// Helper: Setup Node version using nvm if specified in package.json
async function setupNodeVersion(conn, repoName, output, deploymentId) {
  try {
    // Read package.json to check for Node version requirement
    const packageJson = await execSSH(conn, `cat /root/${repoName}/package.json`);
    const parsed = JSON.parse(packageJson);
    
    // Check for Node version in engines field
    const nodeVersion = parsed.engines?.node;
    
    if (nodeVersion) {
      output += `📦 Detected Node version requirement: ${nodeVersion}\n`;
      await updateDeploymentOutput(deploymentId, output, 'in-progress');
      
      // Extract major version (e.g., "14.x" -> "14", ">=12.0.0" -> "12")
      const majorVersion = nodeVersion.match(/\d+/)?.[0];
      
      if (majorVersion) {
        output += `🔄 Installing Node ${majorVersion} via nvm...\n`;
        await updateDeploymentOutput(deploymentId, output, 'in-progress');
        
        // Source nvm and install/use specified version
        const nvmCommand = `source /root/.nvm/nvm.sh && nvm install ${majorVersion} && nvm use ${majorVersion}`;
        await execSSH(conn, nvmCommand);
        
        output += `✓ Switched to Node ${majorVersion}\n`;
        await updateDeploymentOutput(deploymentId, output, 'in-progress');
      }
    }
  } catch (error) {
    // If nvm setup fails, continue with default Node version
    output += `⚠️ Could not detect/switch Node version, using default\n`;
    await updateDeploymentOutput(deploymentId, output, 'in-progress');
  }
}

// Helper: Wrap command with nvm sourcing
function withNvm(command) {
  return `source /root/.nvm/nvm.sh 2>/dev/null || true; ${command}`;
}

// Helper: Inject environment variables into .env file
async function injectEnvVars(conn, repoName, output, deploymentId, serverId) {
  try {
    if (!serverId) return output;
    
    // Fetch env vars from database
    const envResult = await pool.query(
      'SELECT key, value FROM environment_variables WHERE server_id = $1',
      [serverId]
    );
    
    if (envResult.rows.length === 0) {
      output += `No environment variables configured\n`;
      return output;
    }
    
    output += `Injecting ${envResult.rows.length} environment variable(s)...\n`;
    
    // Create .env file content
    const envContent = envResult.rows
      .map(row => `${row.key}=${row.value}`)
      .join('\n');
    
    // Write .env file (escape quotes and newlines for shell)
    const escapedContent = envContent.replace(/'/g, "'\\''");
    await execSSH(conn, `echo '${escapedContent}' > /root/${repoName}/.env`);
    
    output += `✓ Environment variables injected\n`;
    await updateDeploymentOutput(deploymentId, output, 'in-progress');
    
    return output;
  } catch (error) {
    console.error('Env injection error:', error);
    output += `⚠️ Failed to inject environment variables: ${error.message}\n`;
    return output;
  }
}

// Helper: Read PORT env var from DB for this server (falls back to defaultPort)
async function getAppPort(serverId, defaultPort) {
  if (!serverId) return defaultPort;
  try {
    const result = await pool.query(
      "SELECT value FROM environment_variables WHERE server_id = $1 AND key = 'PORT' LIMIT 1",
      [serverId]
    );
    if (result.rows.length > 0) {
      const port = parseInt(result.rows[0].value, 10);
      if (port > 0 && port < 65536) return port;
    }
  } catch (_) { /* fall through */ }
  return defaultPort;
}

// Helper: Perform health check after deployment
async function performHealthCheck(conn, type, output, deploymentId, serviceName = null) {
  try {
    output += `\n[Health Check] Verifying deployment...\n`;
    await updateDeploymentOutput(deploymentId, output, 'in-progress');
    
    if (type === 'static') {
      // Check if Nginx is serving content
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const result = await execSSH(conn, `curl -s -o /dev/null -w "%{http_code}" http://localhost/`);
          const statusCode = result.trim();
          
          if (statusCode === '200') {
            output += `✓ Site is responding (HTTP ${statusCode})\n`;
            break;
          } else if (attempt === 3) {
            output += `⚠️ Site returned HTTP ${statusCode} (may need time to initialize)\n`;
          } else {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s between retries
          }
        } catch (err) {
          if (attempt === 3) {
            output += `⚠️ Health check failed: ${err.message}\n`;
          } else {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
    } else if (type === 'backend' && serviceName) {
      // Check if systemd service is running
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for service startup
          
          const status = await execSSH(conn, `systemctl is-active ${serviceName}`);
          
          if (status.trim() === 'active') {
            output += `✓ Service is running\n`;
            break;
          } else if (attempt === 3) {
            output += `⚠️ Service status: ${status.trim()}\n`;
            output += `Check logs: journalctl -u ${serviceName} -n 20\n`;
          }
        } catch (err) {
          if (attempt === 3) {
            output += `⚠️ Service health check failed\n`;
            output += `Check logs: journalctl -u ${serviceName} -n 20\n`;
          }
        }
      }
    }
    
    await updateDeploymentOutput(deploymentId, output, 'in-progress');
    return output;
  } catch (error) {
    console.error('Health check error:', error);
    output += `⚠️ Health check error: ${error.message}\n`;
    return output;
  }
}

// Helper: Setup SSL for subdomain using certbot
async function setupSubdomainSSL(conn, subdomain, output, deploymentId) {
  if (!subdomain) return output;
  
  const fullDomain = `${subdomain}.cloudedbasement.ca`;
  const siteDir = `/var/www/sites/${subdomain}`;
  output += `\n[SSL] Setting up HTTPS for ${fullDomain}...\n`;
  await updateDeploymentOutput(deploymentId, output, 'deploying');
  
  try {
    // Step 1: Update nginx config with subdomain as server_name
    output += `Configuring nginx for subdomain...\n`;
    
    // Use heredoc to avoid escaping issues with $uri
    // Note: 'NGINXEOF' (quoted) prevents shell expansion, so $uri stays literal
    const nginxConfigCmd = `cat > /etc/nginx/sites-available/${subdomain} << 'NGINXEOF'
server {
    listen 80;
    listen [::]:80;
    server_name ${fullDomain};
    root ${siteDir};
    index index.html index.htm;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINXEOF`;
    
    await execSSH(conn, nginxConfigCmd);
    await execSSH(conn, `ln -sf /etc/nginx/sites-available/${subdomain} /etc/nginx/sites-enabled/`);
    await execSSH(conn, `nginx -t && systemctl reload nginx`);
    output += `✓ Nginx configured for ${fullDomain}\n`;
    await updateDeploymentOutput(deploymentId, output, 'deploying');
    
    // Step 2: Wait a moment for DNS propagation (usually instant since we control DO DNS)
    output += `Waiting for DNS propagation...\n`;
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 3: Run certbot
    output += `Requesting SSL certificate from Let's Encrypt...\n`;
    await updateDeploymentOutput(deploymentId, output, 'deploying');
    
    const certbotResult = await execSSH(conn, 
      `certbot --nginx -d ${fullDomain} --non-interactive --agree-tos --email support@cloudedbasement.ca --redirect 2>&1 || echo "CERTBOT_FAILED"`
    );
    
    if (certbotResult.includes('CERTBOT_FAILED') || certbotResult.includes('error')) {
      output += `⚠️ SSL setup failed (site works on HTTP). You can retry later.\n`;
      output += `   Error: ${certbotResult.substring(0, 200)}\n`;
    } else {
      output += `✓ SSL certificate installed!\n`;
      output += `🔒 Your site is now live at: https://${fullDomain}/\n`;
    }
    
  } catch (err) {
    console.error(`[SSL] Error setting up SSL for ${fullDomain}:`, err.message);
    output += `⚠️ SSL setup error: ${err.message}\n`;
    output += `   Your site is still accessible via HTTP.\n`;
  }
  
  await updateDeploymentOutput(deploymentId, output, 'deploying');
  return output;
}

// Deploy static site (React/Vue/Vite)
async function deployStaticSite(conn, repoName, output, deploymentId, serverId, subdomain = null) {
  // Detect and switch Node version if specified
  output += `\n[3/5] Installing dependencies...\n`;
  await setupNodeVersion(conn, repoName, output, deploymentId);
  
  // Inject environment variables
  output = await injectEnvVars(conn, repoName, output, deploymentId, serverId);
  
  // Try npm install with progressively more aggressive flags
  let installSuccess = false;
  try {
    await execSSH(conn, withNvm(`cd /root/${repoName} && npm install --legacy-peer-deps`));
    output += `✓ Dependencies installed\n`;
    installSuccess = true;
  } catch (e) {
    output += `⚠️ Standard install failed, trying with --force...\n`;
    try {
      await execSSH(conn, withNvm(`cd /root/${repoName} && npm install --legacy-peer-deps --force`));
      output += `✓ Dependencies installed (with --force)\n`;
      installSuccess = true;
    } catch (e2) {
      output += `⚠️ Install with --force failed, trying with --ignore-scripts...\n`;
      try {
        await execSSH(conn, withNvm(`cd /root/${repoName} && npm install --legacy-peer-deps --force --ignore-scripts`));
        output += `✓ Dependencies installed (ignoring scripts)\n`;
        installSuccess = true;
      } catch (e3) {
        output += `⚠️ npm install failed completely, checking for pre-built files...\n`;
      }
    }
  }
  await updateDeploymentOutput(deploymentId, output, 'in-progress');

  output += `\n[4/5] Building project...\n`;
  
  // Check if build directory already exists (pre-built)
  const prebuiltDist = await fileExists(conn, `/root/${repoName}/dist`);
  const prebuiltBuild = await fileExists(conn, `/root/${repoName}/build`);
  const prebuiltOut = await fileExists(conn, `/root/${repoName}/out`);
  
  if (prebuiltDist || prebuiltBuild || prebuiltOut) {
    output += `✓ Found pre-built files, skipping build step\n`;
  } else if (installSuccess) {
    // Only try to build if install succeeded
    try {
      await execSSH(conn, withNvm(`cd /root/${repoName} && npm run build`));
      output += `✓ Build completed\n`;
    } catch (buildError) {
      output += `⚠️ Build failed: ${buildError.message}\n`;
      output += `Attempting to deploy source files directly...\n`;
    }
  } else {
    output += `⚠️ Skipping build (dependencies not installed)\n`;
  }
  await updateDeploymentOutput(deploymentId, output, 'in-progress');

  output += `\n[5/5] Deploying to web server...\n`;
  
  // Multi-site: Each subdomain gets its own directory
  const siteDir = subdomain ? `/var/www/sites/${subdomain}` : '/var/www/html';
  await execSSH(conn, `mkdir -p ${siteDir}`);
  
  // Detect build directory (dist, build, out)
  const hasDist = await fileExists(conn, `/root/${repoName}/dist`);
  const hasBuild = await fileExists(conn, `/root/${repoName}/build`);
  const hasOut = await fileExists(conn, `/root/${repoName}/out`);
  const hasPublic = await fileExists(conn, `/root/${repoName}/public`);
  
  let buildDir = hasDist ? 'dist' : hasBuild ? 'build' : hasOut ? 'out' : hasPublic ? 'public' : null;
  
  // If no build directory found, try deploying source directly
  if (!buildDir) {
    output += `⚠️ No build directory found. Deploying source files directly...\n`;
    await execSSH(conn, `rm -rf ${siteDir}/* && cp -r /root/${repoName}/* ${siteDir}/`);
    output += `✓ Source files deployed to ${siteDir}\n`;
  } else {
    await execSSH(conn, `rm -rf ${siteDir}/* && cp -r /root/${repoName}/${buildDir}/* ${siteDir}/`);
    output += `✓ Site deployed to ${siteDir} (from ${buildDir}/)\n`;
  }
  
  // Show URLs (subdomain is primary, IP is backup)
  if (subdomain) {
    output += `\n🌐 Your site is live at: http://${subdomain}.cloudedbasement.ca/\n`;
    output += `   (also accessible via: http://${conn.config.host}/)\n`;
  } else {
    output += `\n🌐 Your site is live at: http://${conn.config.host}/\n`;
  }
  await updateDeploymentOutput(deploymentId, output, 'in-progress');
  
  // Health check
  output = await performHealthCheck(conn, 'static', output, deploymentId);
  
  // Setup SSL for subdomain (auto HTTPS)
  output = await setupSubdomainSSL(conn, subdomain, output, deploymentId);
  
  // Set deployment_type = 'static' for future NGINX config generation
  await pool.query('UPDATE deployments SET deployment_type = $1 WHERE id = $2', ['static', deploymentId]);
  
  return output;
}

// Deploy static HTML (no build step)
async function deployStaticHTML(conn, repoName, output, deploymentId, subdomain = null) {
  output += `\n[3/5] Skipping dependencies (static HTML)\n`;
  output += `[4/5] Skipping build (static HTML)\n`;
  output += `\n[5/5] Deploying to web server...\n`;
  
  // Multi-site: Each subdomain gets its own directory
  const siteDir = subdomain ? `/var/www/sites/${subdomain}` : '/var/www/html';
  await execSSH(conn, `mkdir -p ${siteDir}`);
  await execSSH(conn, `rm -rf ${siteDir}/* && cp -r /root/${repoName}/* ${siteDir}/`);
  output += `✓ Site deployed to ${siteDir}\n`;
  
  // Show URLs (subdomain is primary, IP is backup)
  if (subdomain) {
    output += `\n🌐 Your site is live at: http://${subdomain}.cloudedbasement.ca/\n`;
    output += `   (also accessible via: http://${conn.config.host}/)\n`;
  } else {
    output += `\n🌐 Your site is live at: http://${conn.config.host}/\n`;
  }
  await updateDeploymentOutput(deploymentId, output, 'in-progress');
  
  // Health check
  output = await performHealthCheck(conn, 'static', output, deploymentId);
  
  // Setup SSL for subdomain
  if (subdomain) {
    output = await setupSubdomainSSL(conn, subdomain, output, deploymentId);
  }
  
  // Set deployment_type = 'static' for future NGINX config generation
  await pool.query('UPDATE deployments SET deployment_type = $1 WHERE id = $2', ['static', deploymentId]);
  
  return output;
}

// Deploy Node.js backend
async function deployNodeBackend(conn, repoName, output, deploymentId, serverId, subdomain = null) {
  output += `\n[3/5] Installing dependencies...\n`;

  // Inject environment variables
  output = await injectEnvVars(conn, repoName, output, deploymentId, serverId);
  const appPort = await getAppPort(serverId, 3000);
  
  // Try npm install with progressively more aggressive flags
  let installSuccess = false;
  try {
    await execSSH(conn, `cd /root/${repoName} && npm install --legacy-peer-deps --production`);
    output += `✓ Dependencies installed\n`;
    installSuccess = true;
  } catch (e) {
    output += `⚠️ Standard install failed, trying with --force...\n`;
    try {
      await execSSH(conn, `cd /root/${repoName} && npm install --legacy-peer-deps --force --production`);
      output += `✓ Dependencies installed (with --force)\n`;
      installSuccess = true;
    } catch (e2) {
      output += `⚠️ Install with --force failed, trying with --ignore-scripts...\n`;
      try {
        await execSSH(conn, `cd /root/${repoName} && npm install --legacy-peer-deps --force --ignore-scripts --production`);
        output += `✓ Dependencies installed (ignoring scripts)\n`;
        installSuccess = true;
      } catch (e3) {
        output += `❌ npm install failed: ${e3.message}\n`;
        throw new Error('Failed to install Node.js dependencies');
      }
    }
  }
  await updateDeploymentOutput(deploymentId, output, 'in-progress');

  output += `\n[4/5] Creating systemd service...\n`;
  const serviceName = `${repoName}.service`;
  const serviceContent = `[Unit]
Description=${repoName} Node.js App
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/${repoName}
ExecStart=/usr/bin/node index.js
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=${appPort}

[Install]
WantedBy=multi-user.target`;

  await execSSH(conn, `echo '${serviceContent}' > /etc/systemd/system/${serviceName}`);
  output += `✓ Service created\n`;
  await updateDeploymentOutput(deploymentId, output, 'in-progress');

  output += `\n[5/5] Starting application...\n`;
  await execSSH(conn, `systemctl daemon-reload && systemctl enable ${serviceName} && systemctl restart ${serviceName}`);
  output += `✓ Application started\n`;
  await updateDeploymentOutput(deploymentId, output, 'in-progress');

  // Configure Nginx as reverse proxy
  output += `\nConfiguring Nginx reverse proxy...\n`;
  const nginxConfig = `server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:${appPort};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\$host;
        proxy_set_header X-Real-IP \\$remote_addr;
        proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\$scheme;
        proxy_cache_bypass \\$http_upgrade;
    }
}`;

  await execSSH(conn, `echo '${nginxConfig}' > /etc/nginx/sites-available/default`);
  await execSSH(conn, `nginx -t && systemctl reload nginx`);
  output += `✓ Nginx configured as reverse proxy to port ${appPort}\n`;

  // Show URLs (subdomain is primary, IP is backup)
  if (subdomain) {
    output += `\n🚀 Your backend is live at: http://${subdomain}.cloudedbasement.ca/\n`;
    output += `   (also accessible via: http://${conn.config.host}/)\n`;
  } else {
    output += `\n🚀 Your backend is live!\n`;
  }
  await updateDeploymentOutput(deploymentId, output, 'in-progress');

  // Health check
  output = await performHealthCheck(conn, 'backend', output, deploymentId, serviceName);

  // Setup SSL for subdomain
  if (subdomain) {
    output = await setupSubdomainSSL(conn, subdomain, output, deploymentId);
  }

  // Set deployment_type = 'node' and app_port for future NGINX config generation
  await pool.query('UPDATE deployments SET deployment_type = $1, app_port = $2 WHERE id = $3', ['node', appPort, deploymentId]);
  
  return output;
}

// Deploy Python app
async function deployPythonApp(conn, repoName, output, deploymentId, serverId, subdomain = null) {
  output += `\n[3/5] Installing dependencies...\n`;

  // Inject environment variables
  output = await injectEnvVars(conn, repoName, output, deploymentId, serverId);
  const appPort = await getAppPort(serverId, 5000);

  await execSSH(conn, `cd /root/${repoName} && pip3 install -r requirements.txt`);
  output += `✓ Dependencies installed\n`;
  await updateDeploymentOutput(deploymentId, output, 'in-progress');

  output += `\n[4/5] Creating systemd service...\n`;
  const serviceName = `${repoName}.service`;
  const serviceContent = `[Unit]
Description=${repoName} Python App
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/${repoName}
ExecStart=/usr/bin/python3 app.py
Restart=on-failure
Environment=PORT=${appPort}

[Install]
WantedBy=multi-user.target`;

  await execSSH(conn, `echo '${serviceContent}' > /etc/systemd/system/${serviceName}`);
  output += `✓ Service created\n`;
  await updateDeploymentOutput(deploymentId, output, 'in-progress');

  output += `\n[5/5] Starting application...\n`;
  await execSSH(conn, `systemctl daemon-reload && systemctl enable ${serviceName} && systemctl restart ${serviceName}`);
  output += `✓ Application started\n`;
  await updateDeploymentOutput(deploymentId, output, 'in-progress');

  // Configure Nginx as reverse proxy
  output += `\nConfiguring Nginx reverse proxy...\n`;
  const nginxConfig = `server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:${appPort};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\$host;
        proxy_set_header X-Real-IP \\$remote_addr;
        proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\$scheme;
        proxy_cache_bypass \\$http_upgrade;
    }
}`;

  await execSSH(conn, `echo '${nginxConfig}' > /etc/nginx/sites-available/default`);
  await execSSH(conn, `nginx -t && systemctl reload nginx`);
  output += `✓ Nginx configured as reverse proxy to port ${appPort}\n`;
  
  // Show URLs (subdomain is primary, IP is backup)
  if (subdomain) {
    output += `\n🐍 Your Python app is live at: http://${subdomain}.cloudedbasement.ca/\n`;
    output += `   (also accessible via: http://${conn.config.host}/)\n`;
  } else {
    output += `\n🐍 Your Python app is live!\n`;
  }
  await updateDeploymentOutput(deploymentId, output, 'in-progress');
  
  // Health check
  output = await performHealthCheck(conn, 'backend', output, deploymentId, serviceName);
  
  // Setup SSL for subdomain
  if (subdomain) {
    output = await setupSubdomainSSL(conn, subdomain, output, deploymentId);
  }

  await pool.query('UPDATE deployments SET deployment_type = $1, app_port = $2 WHERE id = $3', ['python', appPort, deploymentId]);

  return output;
}

// Deploy Rust app
async function deployRustApp(conn, repoName, output, deploymentId, serverId, subdomain = null) {
  output += `\n[3/5] Building Rust application...\n`;
  output += `This may take several minutes...\n`;
  
  // Inject environment variables
  output = await injectEnvVars(conn, repoName, output, deploymentId, serverId);
  
  try {
    // Source cargo environment and build
    await execSSH(conn, `cd /root/${repoName} && source /root/.cargo/env && cargo build --release`);
    output += `✓ Rust build successful\n`;
  } catch (err) {
    output += `⚠️ Cargo build failed: ${err.message}\n`;
    output += `Attempting basic deployment...\n`;
  }
  
  await updateDeploymentOutput(deploymentId, output, 'in-progress');

  output += `\n[4/5] Deploying to Nginx...\n`;
  
  // Multi-site: Each subdomain gets its own directory
  const siteDir = subdomain ? `/var/www/sites/${subdomain}` : '/var/www/html';
  await execSSH(conn, `mkdir -p ${siteDir}`);
  
  // Check for static files or WASM output
  const hasStaticDir = await fileExists(conn, `/root/${repoName}/static`);
  const hasPkgDir = await fileExists(conn, `/root/${repoName}/pkg`);
  
  if (hasStaticDir) {
    await execSSH(conn, `cp -r /root/${repoName}/static/* ${siteDir}/`);
    output += `✓ Deployed static files to ${siteDir}\n`;
  } else if (hasPkgDir) {
    await execSSH(conn, `cp -r /root/${repoName}/pkg/* ${siteDir}/`);
    output += `✓ Deployed WASM package to ${siteDir}\n`;
  } else {
    // Deploy binary as systemd service
    const binPath = `/root/${repoName}/target/release/${repoName}`;
    const hasBinary = await fileExists(conn, binPath);
    
    if (hasBinary) {
      output += `\n[5/5] Creating systemd service...\n`;
      const serviceName = `${repoName}.service`;
      const serviceContent = `[Unit]
Description=${repoName} Rust App
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/${repoName}
ExecStart=${binPath}
Restart=always

[Install]
WantedBy=multi-user.target`;
      
      await execSSH(conn, `echo '${serviceContent}' > /etc/systemd/system/${serviceName}`);
      await execSSH(conn, `systemctl daemon-reload && systemctl enable ${serviceName} && systemctl restart ${serviceName}`);
      output += `✓ Service started\n`;
      await updateDeploymentOutput(deploymentId, output, 'in-progress');
      
      // Configure Nginx as reverse proxy (Rust apps typically run on port 8080)
      output += `\nConfiguring Nginx reverse proxy...\n`;
      const nginxConfig = `server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\$host;
        proxy_set_header X-Real-IP \\$remote_addr;
        proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\$scheme;
        proxy_cache_bypass \\$http_upgrade;
    }
}`;
      
      await execSSH(conn, `echo '${nginxConfig}' > /etc/nginx/sites-available/default`);
      await execSSH(conn, `nginx -t && systemctl reload nginx`);
      output += `✓ Nginx configured as reverse proxy to port 8080\n`;
      output += `\n🚀 Your Rust backend is live!\n`;
    } else {
      output += `⚠️ No deployable artifacts found\n`;
      output += `Expected: static/, pkg/, or target/release/${repoName}\n`;
    }
  }
  
  await updateDeploymentOutput(deploymentId, output, 'in-progress');
  return output;
}

// Deploy Go app
async function deployGoApp(conn, repoName, output, deploymentId, serverId, subdomain = null) {
  output += `\n[3/5] Building Go application...\n`;
  
  // Inject environment variables
  output = await injectEnvVars(conn, repoName, output, deploymentId, serverId);
  
  try {
    // Build the Go binary
    await execSSH(conn, `cd /root/${repoName} && export PATH=$PATH:/usr/local/go/bin && go build -o ${repoName}`);
    output += `✓ Go build successful\n`;
  } catch (err) {
    output += `⚠️ Go build failed: ${err.message}\n`;
    throw new Error('Go build failed');
  }
  
  await updateDeploymentOutput(deploymentId, output, 'in-progress');

  output += `\n[4/5] Creating systemd service...\n`;
  const serviceName = `${repoName}.service`;
  const serviceContent = `[Unit]
Description=${repoName} Go App
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/${repoName}
ExecStart=/root/${repoName}/${repoName}
Restart=always

[Install]
WantedBy=multi-user.target`;
  
  await execSSH(conn, `echo '${serviceContent}' > /etc/systemd/system/${serviceName}`);
  output += `✓ Service file created\n`;
  await updateDeploymentOutput(deploymentId, output, 'in-progress');

  output += `\n[5/5] Starting application...\n`;
  await execSSH(conn, `systemctl daemon-reload && systemctl enable ${serviceName} && systemctl restart ${serviceName}`);
  output += `✓ Application started\n`;
  await updateDeploymentOutput(deploymentId, output, 'in-progress');
  
  // Configure Nginx as reverse proxy (Go apps typically run on port 8080)
  output += `\nConfiguring Nginx reverse proxy...\n`;
  const nginxConfig = `server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\$host;
        proxy_set_header X-Real-IP \\$remote_addr;
        proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\$scheme;
        proxy_cache_bypass \\$http_upgrade;
    }
}`;
  
  await execSSH(conn, `echo '${nginxConfig}' > /etc/nginx/sites-available/default`);
  await execSSH(conn, `nginx -t && systemctl reload nginx`);
  output += `✓ Nginx configured as reverse proxy to port 8080\n`;
  output += `\n🚀 Your Go backend is live!\n`;
  await updateDeploymentOutput(deploymentId, output, 'in-progress');
  return output;
}

// Helper: Sanitize output to mask secrets
function sanitizeOutput(output) {
  if (!output) return output;
  
  // Mask common secret patterns
  let sanitized = output;
  
  // API Keys (various formats)
  sanitized = sanitized.replace(/(['"]?api[_-]?key['"]?\s*[:=]\s*['"]?)([A-Za-z0-9_\-]{20,})/gi, '$1***REDACTED***');
  sanitized = sanitized.replace(/(['"]?apikey['"]?\s*[:=]\s*['"]?)([A-Za-z0-9_\-]{20,})/gi, '$1***REDACTED***');
  
  // Tokens (Bearer, JWT, OAuth)
  sanitized = sanitized.replace(/(['"]?token['"]?\s*[:=]\s*['"]?)([A-Za-z0-9_\-\.]{20,})/gi, '$1***REDACTED***');
  sanitized = sanitized.replace(/(['"]?bearer['"]?\s+)([A-Za-z0-9_\-\.]{20,})/gi, '$1***REDACTED***');
  
  // Passwords
  sanitized = sanitized.replace(/(['"]?password['"]?\s*[:=]\s*['"]?)([^\s'"]+)/gi, '$1***REDACTED***');
  sanitized = sanitized.replace(/(['"]?passwd['"]?\s*[:=]\s*['"]?)([^\s'"]+)/gi, '$1***REDACTED***');
  sanitized = sanitized.replace(/(['"]?pwd['"]?\s*[:=]\s*['"]?)([^\s'"]+)/gi, '$1***REDACTED***');
  
  // Secret keys
  sanitized = sanitized.replace(/(['"]?secret[_-]?key['"]?\s*[:=]\s*['"]?)([^\s'"]+)/gi, '$1***REDACTED***');
  sanitized = sanitized.replace(/(['"]?private[_-]?key['"]?\s*[:=]\s*['"]?)([^\s'"]+)/gi, '$1***REDACTED***');
  
  // Database URLs
  sanitized = sanitized.replace(/(postgres|mysql|mongodb):\/\/([^:]+):([^@]+)@/gi, '$1://$2:***REDACTED***@');
  
  // AWS credentials
  sanitized = sanitized.replace(/(AKIA[0-9A-Z]{16})/g, '***REDACTED_AWS_KEY***');
  sanitized = sanitized.replace(/(['"]?aws[_-]?secret[_-]?access[_-]?key['"]?\s*[:=]\s*['"]?)([^\s'"]+)/gi, '$1***REDACTED***');
  
  // Stripe keys
  sanitized = sanitized.replace(/(sk_live_[A-Za-z0-9]{24,})/g, '***REDACTED_STRIPE_KEY***');
  sanitized = sanitized.replace(/(pk_live_[A-Za-z0-9]{24,})/g, '***REDACTED_STRIPE_KEY***');
  
  // GitHub tokens
  sanitized = sanitized.replace(/(ghp_[A-Za-z0-9]{36,})/g, '***REDACTED_GITHUB_TOKEN***');
  
  // Generic base64 secrets (>40 chars)
  sanitized = sanitized.replace(/(['"]?secret['"]?\s*[:=]\s*['"]?)([A-Za-z0-9+\/]{40,}={0,2})/gi, '$1***REDACTED***');
  
  return sanitized;
}

// Helper: Execute SSH command with timeout
// Helper: Validate and fire webhook
async function fireDeployWebhook(url, event, payload) {
  try {
    let parsed;
    try { parsed = new URL(url); } catch { throw new Error('Invalid webhook URL'); }
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Webhook URL must use http or https');
    const hostname = parsed.hostname;
    const denyPatterns = [/^localhost$/i, /^127\./, /^10\./, /^192\.168\./, /^172\.(1[6-9]|2\d|3[01])\./];
    if (denyPatterns.some(re => re.test(hostname))) throw new Error('Webhook URL cannot point to local/private address');
    let addresses;
    try { addresses = await dns.lookup(hostname, { all: true }); } catch { throw new Error('Could not resolve webhook host'); }
    for (const addr of addresses) {
      if (net.isPrivate && net.isPrivate(addr.address)) throw new Error('Webhook host resolves to private IP');
      if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|127\.)/.test(addr.address)) throw new Error('Webhook host resolves to private IP');
    }
    let fetchFn = global.fetch;
    if (!fetchFn) fetchFn = require('node-fetch');
    const body = JSON.stringify({ event, timestamp: new Date().toISOString(), ...payload });
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 5000);
    await fetchFn(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'CloudedBasement/1.0' },
      body,
      signal: controller.signal,
    });
    clearTimeout(tid);
  } catch (err) {
    console.warn('[WEBHOOK] Delivery failed:', err.message);
  }
}

function execSSH(conn, command, timeoutMs = 900000) { // 15 min default timeout
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Command timed out after ${timeoutMs / 1000}s: ${command.substring(0, 100)}...`));
    }, timeoutMs);
    
    conn.exec(command, (err, stream) => {
      if (err) {
        clearTimeout(timeoutId);
        return reject(err);
      }
      
      let output = '';
      let errorOutput = '';
      
      stream.on('close', (code) => {
        clearTimeout(timeoutId);
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Command failed (exit ${code}): ${errorOutput || output}`));
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
}

// Helper: Check if file exists
async function fileExists(conn, path) {
  try {
    await execSSH(conn, `test -f ${path} || test -d ${path}`);
    return true;
  } catch {
    return false;
  }
}

// Helper: Update deployment output in database
async function updateDeploymentOutput(deploymentId, output, status) {
  try {
    // Sanitize output before storing
    const sanitizedOutput = sanitizeOutput(output);
    
    await pool.query(
      'UPDATE deployments SET output = $1::text, status = $2::text, deployed_at = CASE WHEN $2 = \'success\' THEN NOW() ELSE deployed_at END WHERE id = $3',
      [sanitizedOutput, status, deploymentId]
    );
  } catch (err) {
    console.error('[DEPLOY] Failed to update deployment output:', err);
  }
}

// POST /add-domain
exports.addDomain = async (req, res) => {
  try {
    const domain = req.body.domain.toLowerCase().trim();
    const linkedSubdomain = req.body.linked_subdomain || null;
    const userId = req.session.userId;

    // Validate domain format (supports subdomains like sub.example.com)
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    if (!domain || !domainRegex.test(domain)) {
      return res.redirect('/dashboard?error=Invalid domain format');
    }

    // Get user's server (full row needed for SSH credentials)
    const serverResult = await pool.query(
      "SELECT * FROM servers WHERE user_id = $1 AND status NOT IN ('deleted', 'failed') ORDER BY created_at DESC LIMIT 1",
      [userId]
    );

    if (serverResult.rows.length === 0) {
      return res.redirect('/dashboard?error=No server found');
    }

    const server = serverResult.rows[0];
    server.ssh_password = decryptSshPassword(server.ssh_password, server.ssh_password_iv);

    // Determine deployment type from linked subdomain (if provided)
    let deploymentType = 'static';
    let appPort = null;
    let siteDirectory = '/var/www/html';

    if (linkedSubdomain) {
      const depResult = await pool.query(
        'SELECT id, deployment_type, app_port FROM deployments WHERE subdomain = $1 AND user_id = $2',
        [linkedSubdomain, userId]
      );
      if (depResult.rows.length === 0) {
        return res.redirect('/dashboard?error=Invalid deployment selected');
      }
      const dep = depResult.rows[0];
      deploymentType = dep.deployment_type || 'static';
      appPort = dep.app_port;
      siteDirectory = `/var/www/sites/${linkedSubdomain}`;
    }

    // Check if domain already exists
    const existingDomain = await pool.query(
      'SELECT id FROM domains WHERE domain = $1',
      [domain]
    );

    if (existingDomain.rows.length > 0) {
      return res.redirect('/dashboard?error=Domain already in use');
    }

    // Insert to DB so domain appears in dashboard immediately
    await pool.query(
      'INSERT INTO domains (server_id, user_id, domain, ssl_enabled, linked_subdomain) VALUES ($1, $2, $3, $4, $5)',
      [server.id, userId, domain, false, linkedSubdomain]
    );

    // Configure Nginx on the droplet asynchronously
    configureNginxForDomain(server, domain, deploymentType, appPort, siteDirectory).catch(err => {
      console.error(`[DOMAIN] Nginx configuration failed for ${domain}:`, err.message);
    });

    res.redirect('/dashboard?success=Domain added! Nginx is being configured — point your DNS A record to your server IP.');
  } catch (error) {
    console.error('Add domain error:', error);
    res.redirect('/dashboard?error=Failed to add domain');
  }
};

async function configureNginxForDomain(server, domain, deploymentType, appPort, siteDirectory) {
  const nginxResult = generateNginxConfig({
    domain,
    deploymentType,
    siteDirectory,
    port: appPort,
  });

  const configFilename = domain.replace(/\./g, '-');
  const conn = new Client();

  await new Promise((resolve, reject) => {
    conn.on('ready', async () => {
      try {
        // Write Nginx config using heredoc (safe for configs with special chars)
        const writeCmd = `cat > /etc/nginx/sites-available/${configFilename} << 'NGINXEOF'\n${nginxResult.config}\nNGINXEOF`;
        await new Promise((res, rej) => {
          conn.exec(writeCmd, (err, stream) => {
            if (err) return rej(err);
            stream.on('close', () => res());
            stream.on('data', () => {});
            stream.stderr.on('data', () => {});
          });
        });

        // Enable site and reload Nginx
        await new Promise((res, rej) => {
          const enableCmd = `ln -sf /etc/nginx/sites-available/${configFilename} /etc/nginx/sites-enabled/${configFilename} && nginx -t && systemctl reload nginx`;
          conn.exec(enableCmd, (err, stream) => {
            if (err) return rej(err);
            let stderr = '';
            stream.on('close', (code) => {
              if (code === 0) res();
              else rej(new Error(`Nginx reload failed (exit ${code}): ${stderr}`));
            });
            stream.on('data', () => {});
            stream.stderr.on('data', (data) => { stderr += data.toString(); });
          });
        });

        console.log(`[DOMAIN] Nginx configured for ${domain} (${deploymentType})`);
        conn.end();
        resolve();
      } catch (err) {
        conn.end();
        reject(err);
      }
    });

    conn.on('error', reject);

    conn.connect({
      host: server.ip_address,
      port: 22,
      username: server.ssh_username || 'root',
      password: server.ssh_password,
      readyTimeout: 30000
    });
  });
}

// POST /delete-domain
exports.deleteDomain = async (req, res) => {
  try {
    const domainId = req.body.domainId;
    const userId = req.session.userId;

    if (!domainId) {
      return res.json({ success: false, error: 'Domain ID required' });
    }

    // Verify the domain belongs to this user
    const domainResult = await pool.query(
      'SELECT d.id, d.domain, d.server_id, s.ip_address, s.ssh_password, s.ssh_password_iv FROM domains d JOIN servers s ON d.server_id = s.id WHERE d.id = $1 AND d.user_id = $2',
      [domainId, userId]
    );

    if (domainResult.rows.length === 0) {
      return res.json({ success: false, error: 'Domain not found or access denied' });
    }

    const domain = domainResult.rows[0];
    domain.ssh_password = decryptSshPassword(domain.ssh_password, domain.ssh_password_iv);
    const domainName = domain.domain;

    // Try to remove nginx config for this domain on the server
    // This is best-effort - domain will be deleted from DB regardless
    if (domain.ip_address && domain.ssh_password) {
      try {
        const Client = require('ssh2').Client;
        const conn = new Client();
        
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            conn.end();
            resolve(); // Don't fail on timeout, just continue
          }, 15000);

          conn.on('ready', () => {
            // Remove nginx config for this domain (filename uses hyphens, not dots)
            const configFilename = domainName.replace(/\./g, '-');
            const cmd = `rm -f /etc/nginx/sites-enabled/${configFilename} /etc/nginx/sites-available/${configFilename} && nginx -t && systemctl reload nginx`;
            
            conn.exec(cmd, (err, stream) => {
              if (err) {
                clearTimeout(timeout);
                conn.end();
                resolve(); // Don't fail, continue with DB deletion
                return;
              }
              
              stream.on('close', () => {
                clearTimeout(timeout);
                conn.end();
                resolve();
              });
              
              stream.on('data', () => {}); // Drain output
              stream.stderr.on('data', () => {}); // Drain errors
            });
          });

          conn.on('error', () => {
            clearTimeout(timeout);
            resolve(); // Don't fail, continue with DB deletion
          });

          conn.connect({
            host: domain.ip_address,
            port: 22,
            username: 'root',
            password: domain.ssh_password,
            readyTimeout: 10000
          });
        });
      } catch (sshError) {
        console.error('SSH cleanup error (non-fatal):', sshError.message);
        // Continue with deletion regardless
      }
    }

    // Delete from database
    await pool.query('DELETE FROM domains WHERE id = $1', [domainId]);

    console.log(`[DELETE-DOMAIN] User ${userId} deleted domain: ${domainName}`);

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete domain error:', error);
    return res.json({ success: false, error: 'Failed to delete domain' });
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
    server.ssh_password = decryptSshPassword(server.ssh_password, server.ssh_password_iv);

    // SECURITY: Verify domain belongs to this user and get linked_subdomain
    const domainCheck = await pool.query(
      'SELECT id, linked_subdomain FROM domains WHERE domain = $1 AND user_id = $2',
      [domain, userId]
    );

    if (domainCheck.rows.length === 0) {
      return res.redirect('/dashboard?error=Domain not found or access denied');
    }
    
    const linkedSubdomain = domainCheck.rows[0].linked_subdomain;

    // Send response immediately - process SSL in background
    res.redirect('/dashboard?message=SSL certificate generation started! This may take a minute.');

    // Background process - trigger SSL certificate generation
    triggerSSLCertificateForCustomer(server.id, domain, server, linkedSubdomain).catch(err => {
      console.error('[SSL] Failed to trigger certificate for server', server.id, ':', err);
    });

  } catch (error) {
    console.error('Enable SSL error:', error);
    res.redirect('/dashboard?error=Failed to enable SSL');
  }
};

// Background function to trigger SSL via SSH2 library (secure, no command injection)
// REFACTORED: Now uses explicit deployment_type from database - no guessing!
async function triggerSSLCertificateForCustomer(serverId, domain, server, linkedSubdomain = null) {
  return new Promise(async (resolve, reject) => {
    try {
      // Step 0: Domain validation (RFC 1123 compliance)
      if (!isValidDomainName(domain)) {
        return reject(new Error(`Invalid domain format: ${domain}`));
      }

      // Step 1: Determine deployment type from database - NEVER GUESS
      let deploymentType = 'static'; // Default for legacy domains without linked subdomain
      let appPort = null;
      let siteDirectory = '/var/www/html';

      if (linkedSubdomain) {
        const deploymentResult = await pool.query(
          'SELECT deployment_type, app_port FROM deployments WHERE subdomain = $1',
          [linkedSubdomain]
        );

        if (deploymentResult.rows.length === 0) {
          return reject(new Error(`NGINX_CONFIG_ERROR: No deployment found for subdomain "${linkedSubdomain}". Cannot determine config type.`));
        }

        const deployment = deploymentResult.rows[0];
        deploymentType = deployment.deployment_type;
        appPort = deployment.app_port;
        siteDirectory = `/var/www/sites/${linkedSubdomain}`;

        // GUARDRAIL: Fail loudly if deployment_type is not set
        if (!deploymentType) {
          return reject(new Error(`NGINX_CONFIG_ERROR: Deployment "${linkedSubdomain}" has NULL deployment_type. Run migration 020 to fix.`));
        }

        // GUARDRAIL: Node apps MUST have a port
        if (deploymentType === 'node' && !appPort) {
          return reject(new Error(`NGINX_CONFIG_ERROR: Node deployment "${linkedSubdomain}" has no app_port. Cannot create proxy config.`));
        }
      }

      console.log(`[SSL] Config decision: domain=${domain}, subdomain=${linkedSubdomain}, type=${deploymentType}, port=${appPort}`);

      // Step 2: Generate the correct nginx config using templates
      const nginxConfig = generateNginxConfig({
        domain,
        deploymentType,
        siteDirectory,
        port: appPort,
      });

      console.log(`[SSL] Generated ${deploymentType} config for ${domain} -> ${siteDirectory}`);

      // Step 3: SSH and apply config
      const conn = new Client();

      conn.on('ready', async () => {
        console.log(`[SSL] SSH connected to server ${serverId}`);

        try {
          // Step 3a: Preflight check - verify directory/port exists
          const preflightCmd = deploymentType === 'static'
            ? `test -d ${siteDirectory} && test -f ${siteDirectory}/index.html && echo "PREFLIGHT_OK" || echo "PREFLIGHT_FAIL: ${siteDirectory} missing or no index.html"`
            : `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:${appPort}/ 2>/dev/null | grep -q "^[2345]" && echo "PREFLIGHT_OK" || echo "PREFLIGHT_FAIL: Nothing listening on port ${appPort}"`;

          const preflightResult = await new Promise((res, rej) => {
            conn.exec(preflightCmd, (err, stream) => {
              if (err) return rej(err);
              let output = '';
              stream.on('close', () => res(output.trim()));
              stream.on('data', (data) => { output += data.toString(); });
              stream.stderr.on('data', () => {});
            });
          });

          console.log(`[SSL] Preflight result: ${preflightResult}`);

          // Warn but don't fail on preflight - directory might be created during deploy
          if (preflightResult.includes('PREFLIGHT_FAIL')) {
            console.warn(`[SSL] Preflight warning for ${domain}: ${preflightResult}`);
            // Continue anyway - user might be setting up domain before deploy
          }

          // Step 3b: Write nginx config
          const configFilename = domain.replace(/\./g, '-');
          const writeCmd = `cat > /etc/nginx/sites-available/${configFilename} << 'NGINXEOF'\n${nginxConfig}\nNGINXEOF`;

          await new Promise((res, rej) => {
            conn.exec(writeCmd, (err, stream) => {
              if (err) return rej(err);
              stream.on('close', () => res());
              stream.on('data', () => {});
              stream.stderr.on('data', () => {});
            });
          });

          // Step 3c: Enable site and test config
          await new Promise((res, rej) => {
            conn.exec(`ln -sf /etc/nginx/sites-available/${configFilename} /etc/nginx/sites-enabled/ && nginx -t && systemctl reload nginx`, (err, stream) => {
              if (err) return rej(err);
              let stderr = '';
              stream.on('close', (code) => {
                if (code === 0) {
                  res();
                } else {
                  rej(new Error(`Nginx config test failed: ${stderr}`));
                }
              });
              stream.on('data', () => {});
              stream.stderr.on('data', (data) => { stderr += data.toString(); });
            });
          });

          console.log(`[SSL] Nginx config applied for ${domain} (type: ${deploymentType})`);

          // Step 4: Run certbot to get SSL certificate
          const certbotCmd = `certbot --nginx -d ${domain} --email admin@cloudedbasement.ca --non-interactive --agree-tos --redirect`;

          conn.exec(certbotCmd, { timeout: 90000 }, (err, stream) => {
            if (err) {
              conn.end();
              return reject(err);
            }

            let stdout = '';
            let stderr = '';

            stream.on('close', async (code) => {
              console.log(`[SSL] Certbot finished for ${domain}, exit code: ${code}`);
              if (stdout) console.log(`[SSL] stdout: ${stdout.substring(0, 500)}`);
              if (stderr) console.log(`[SSL] stderr: ${stderr.substring(0, 500)}`);

              try {
                const success = stdout.includes('Congratulations') ||
                  stderr.includes('Congratulations') ||
                  stdout.includes('Successfully received certificate') ||
                  stderr.includes('Successfully received certificate') ||
                  stdout.includes('Certificate not yet due for renewal');

                if (success || code === 0) {
                  console.log(`[SSL] Certificate success for ${domain}`);
                  conn.end();

                  // Update domains table - SSL cert is working
                  await pool.query('UPDATE domains SET ssl_enabled = true WHERE domain = $1', [domain]);
                  console.log(`[SSL] Certificate activated for ${domain} on server ${serverId}`);
                  resolve();
                } else {
                  conn.end();
                  console.error(`[SSL] Certbot did not succeed. Code: ${code}`);
                  reject(new Error('Certbot command did not complete successfully'));
                }
              } catch (dbError) {
                conn.end();
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
        } catch (nginxErr) {
          conn.end();
          reject(nginxErr);
        }
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

    } catch (error) {
      reject(error);
    }
  }).catch(async (error) => {
    console.error(`[SSL] Error generating certificate for server ${serverId}:`, error.message);
    // Log the failure - domains.ssl_enabled stays false
  });
}

// POST /setup-database - One-click database installation
exports.setupDatabase = async (req, res) => {
  try {
    const { database_type } = req.body;
    const userId = req.session.userId;

    if (!['postgres', 'mongodb'].includes(database_type)) {
      return res.redirect('/dashboard?error=Invalid database type');
    }

    // Get user's server
    const serverResult = await pool.query(
      "SELECT * FROM servers WHERE user_id = $1 AND status NOT IN ('deleted', 'failed')",
      [userId]
    );

    if (serverResult.rows.length === 0) {
      return res.redirect('/dashboard?error=No server found');
    }

    const server = serverResult.rows[0];
    server.ssh_password = decryptSshPassword(server.ssh_password, server.ssh_password_iv);

    if (!server.ip_address || !server.ssh_password) {
      return res.redirect('/dashboard?error=Server not ready yet');
    }

    // Perform database setup asynchronously
    setupDatabaseAsync(server, database_type, userId).catch(err => {
      console.error(`[DB] Database setup failed:`, err);
    });

    res.redirect(`/dashboard?success=Setting up ${database_type === 'postgres' ? 'PostgreSQL' : 'MongoDB'}... Check status in a moment.`);
  } catch (error) {
    console.error('Setup database error:', error);
    res.redirect('/dashboard?error=Failed to start database setup');
  }
};

// Async database setup function
async function setupDatabaseAsync(server, databaseType, userId) {
  const conn = new Client();

  try {
    // Connect via SSH
    await new Promise((resolve, reject) => {
      conn.on('ready', resolve);
      conn.on('error', reject);
      conn.connect({
        host: server.ip_address,
        port: 22,
        username: 'root',
        password: server.ssh_password,
        readyTimeout: 30000
      });
    });

    if (databaseType === 'postgres') {
      console.log(`[DB] Installing PostgreSQL on server ${server.id}...`);
      await execSSH(conn, `apt update && apt install -y postgresql postgresql-contrib`);
      await execSSH(conn, `systemctl start postgresql && systemctl enable postgresql`);
      
      // Create database user and store credentials
      const dbUser = 'basement_user';
      const dbPass = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Use psql -v variables to safely pass values (immune to SQL injection even with special chars)
      const createUserCmd = `sudo -u postgres psql -v "username=${dbUser}" -v "password=${dbPass}" -c "CREATE USER :\\"username\\" WITH PASSWORD :'password';" || true`;
      const createDbCmd = `sudo -u postgres psql -v "username=${dbUser}" -c "CREATE DATABASE app_db OWNER :\\"username\\";" || true`;
      
      await execSSH(conn, createUserCmd);
      await execSSH(conn, createDbCmd);
      
      // Store credentials file using base64 encoding (prevents shell injection)
      const credsContent = `PostgreSQL Credentials\n\nHost: localhost\nPort: 5432\nDatabase: app_db\nUsername: ${dbUser}\nPassword: ${dbPass}\n\nConnection String:\npostgresql://${dbUser}:${dbPass}@localhost:5432/app_db`;
      const credsBase64 = Buffer.from(credsContent).toString('base64');
      await execSSH(conn, `echo '${credsBase64}' | base64 -d > /root/.database_config`);
      
      console.log(`[DB] PostgreSQL installed successfully on server ${server.id}`);
      
      // Store credentials in database
      await pool.query(
        `UPDATE servers SET 
          postgres_installed = true,
          postgres_db_name = $1,
          postgres_db_user = $2,
          postgres_db_password = $3
         WHERE id = $4`,
        ['app_db', dbUser, dbPass, server.id]
      );
    } else if (databaseType === 'mongodb') {
      console.log(`[DB] Installing MongoDB on server ${server.id}...`);
      
      // Add official MongoDB repository (mongodb-org not in default Ubuntu repos)
      // Use --batch and --yes flags for non-interactive GPG import
      await execSSH(conn, `curl -fsSL https://pgp.mongodb.com/server-7.0.asc | gpg --batch --yes --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg`);
      await execSSH(conn, `echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list`);
      await execSSH(conn, `apt update`);
      
      // Install MongoDB
      await execSSH(conn, `apt install -y mongodb-org`);
      await execSSH(conn, `systemctl start mongod && systemctl enable mongod`);
      
      // Generate secure credentials
      const mongoUsername = 'basement_user';
      const mongoPassword = crypto.randomBytes(16).toString('hex');
      const mongoDbName = 'app_db';
      
      // Create MongoDB admin user with authentication
      const createUserScript = `
db = db.getSiblingDB('${mongoDbName}');
db.createUser({
  user: '${mongoUsername}',
  pwd: '${mongoPassword}',
  roles: [{ role: 'readWrite', db: '${mongoDbName}' }]
});
`;
      
      // Save script to file and execute via mongosh
      const scriptBase64 = Buffer.from(createUserScript).toString('base64');
      await execSSH(conn, `echo '${scriptBase64}' | base64 -d > /tmp/create_mongo_user.js`);
      
      // Verify user creation succeeded before enabling auth
      const createResult = await execSSH(conn, `mongosh < /tmp/create_mongo_user.js 2>&1`);
      await execSSH(conn, `rm /tmp/create_mongo_user.js`);
      
      if (!createResult.includes('Successfully added user') && !createResult.includes('"ok"') && !createResult.includes('ok: 1')) {
        throw new Error(`MongoDB user creation failed: ${createResult}`);
      }
      
      // Enable authentication in MongoDB config (use proper YAML newline)
      await execSSH(conn, `sed -i 's/#security:/security:/' /etc/mongod.conf`);
      await execSSH(conn, `sed -i '/^security:/a\\  authorization: enabled' /etc/mongod.conf`);
      await execSSH(conn, `systemctl restart mongod`);
      
      // Wait for MongoDB to restart
      await execSSH(conn, `sleep 3`);
      
      // Store credentials file using base64 encoding (prevents shell injection)
      const connectionString = `mongodb://${mongoUsername}:${mongoPassword}@localhost:27017/${mongoDbName}`;
      const credsContent = `MongoDB Credentials\n\nHost: localhost\nPort: 27017\nDatabase: ${mongoDbName}\nUsername: ${mongoUsername}\nPassword: ${mongoPassword}\n\nConnection String:\n${connectionString}`;
      const credsBase64 = Buffer.from(credsContent).toString('base64');
      await execSSH(conn, `echo '${credsBase64}' | base64 -d > /root/.database_config`);
      
      console.log(`[DB] MongoDB installed successfully on server ${server.id}`);
      
      // Store in database
      await pool.query(
        `UPDATE servers SET 
          mongodb_installed = true,
          mongodb_db_name = $1,
          mongodb_db_user = $2,
          mongodb_db_password = $3
         WHERE id = $4`,
        [mongoDbName, mongoUsername, mongoPassword, server.id]
      );
    }
  } catch (error) {
    console.error(`[DB] Database setup failed: ${error.message}`);
    
    // Mark installation as failed (NULL = failed, false = not attempted, true = success)
    const columnName = databaseType === 'postgres' ? 'postgres_installed' : 'mongodb_installed';
    await pool.query(
      `UPDATE servers SET ${columnName} = NULL WHERE id = $1`,
      [server.id]
    ).catch(dbError => {
      console.error(`[DB] Failed to update failure status:`, dbError.message);
    });
  } finally {
    conn.end();
  }
}

// POST /delete-deployment
exports.deleteDeployment = async (req, res) => {
  try {
    const { deploymentId } = req.body;
    const userId = req.session.userId;
    
    if (!deploymentId) {
      return res.redirect('/dashboard?error=Invalid deployment ID');
    }
    
    // SECURITY: Verify deployment belongs to this user and get DNS record info
    const deploymentCheck = await pool.query(
      'SELECT id, subdomain, dns_record_id FROM deployments WHERE id = $1 AND user_id = $2',
      [deploymentId, userId]
    );
    
    if (deploymentCheck.rows.length === 0) {
      return res.redirect('/dashboard?error=Deployment not found or access denied');
    }
    
    const deployment = deploymentCheck.rows[0];
    
    // Clean up DNS record if one exists
    if (deployment.subdomain) {
      try {
        const dnsResult = await deleteDNSRecord(deployment.subdomain);
        if (dnsResult.success) {
          console.log(`[DELETE] Deleted DNS record for ${deployment.subdomain}.cloudedbasement.ca`);
        } else {
          console.log(`[DELETE] DNS cleanup note: ${dnsResult.error}`);
        }
      } catch (dnsErr) {
        console.error(`[DELETE] DNS cleanup error:`, dnsErr.message);
        // Continue with deletion even if DNS cleanup fails
      }
    }
    
    // Delete deployment
    await pool.query('DELETE FROM deployments WHERE id = $1', [deploymentId]);
    
    res.redirect('/dashboard?success=Deployment deleted successfully');
  } catch (error) {
    console.error('Delete deployment error:', error);
    res.redirect('/dashboard?error=Failed to delete deployment');
  }
};

// ============================================
// GITHUB AUTO-DEPLOY FUNCTIONS
// Called by githubWebhookController when a push event is received
// ============================================

/**
 * Trigger auto-deploy from GitHub webhook (server-wide, legacy)
 * 
 * Flow:
 * 1. GitHub push event → webhook controller verifies signature
 * 2. Webhook controller calls this function
 * 3. Creates deployment record with 'pending' status
 * 4. Triggers performDeployment asynchronously
 * 5. Returns immediately so GitHub doesn't timeout
 * 
 * @param {Object} server - Server row from database
 * @param {string} gitUrl - Repository URL to deploy
 * @param {string} reason - Human-readable reason for deploy log
 * @returns {Object} { deploymentId }
 */
exports.triggerAutoDeploy = async (server, gitUrl, reason = 'Auto-deploy', branch = null) => {
  const repoName = gitUrl.split('/').pop().replace('.git', '');

  // Create deployment record with pending status
  const deployResult = await pool.query(
    'INSERT INTO deployments (server_id, user_id, git_url, status, output, branch) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
    [server.id, server.user_id, gitUrl, 'pending', `🚀 ${reason}\nStarting deployment...`, branch]
  );

  const deploymentId = deployResult.rows[0].id;
  console.log(`[AUTO-DEPLOY] Deployment #${deploymentId} triggered: ${gitUrl} (branch: ${branch || 'auto'})`);

  // Perform deployment asynchronously (don't await - return immediately for GitHub)
  setImmediate(() => {
    performDeployment(server, gitUrl, repoName, deploymentId, null, branch).catch(async (err) => {
      console.error(`[AUTO-DEPLOY] Deployment #${deploymentId} failed:`, err);
      const failureOutput = `❌ Auto-deploy failed: ${err.message}`;
      try {
        await pool.query(
          'UPDATE deployments SET status = $1, output = $2, deployed_at = NOW() WHERE id = $3',
          ['failed', failureOutput, deploymentId]
        );
      } catch (dbErr) {
        console.error(`[AUTO-DEPLOY] Failed to update deployment status:`, dbErr);
      }
      analyzeDeploymentFailure(deploymentId, failureOutput);
    });
  });

  return { deploymentId };
};

/**
 * Trigger a preview deployment for a non-default branch.
 * Provisions a unique subdomain (pr-{branch}-{repo}) and deploys there.
 * Cleans up any previous preview for the same branch+repo.
 */
exports.triggerPreviewDeploy = async (server, gitUrl, branch, reason = 'Preview deploy') => {
  const repoName = gitUrl.split('/').pop().replace('.git', '');

  // Sanitize branch name for use in subdomain: lowercase, replace non-alnum with hyphen, max 40 chars
  const safeBranch = branch.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').substring(0, 40);
  const safeRepo   = repoName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').substring(0, 20);
  const previewSubdomain = `pr-${safeBranch}-${safeRepo}`;

  // Clean up any previous preview deployment for this branch+repo
  const existing = await pool.query(
    `SELECT id, subdomain, dns_record_id FROM deployments
     WHERE server_id = $1 AND git_url = $2 AND branch = $3 AND is_preview = true`,
    [server.id, gitUrl, branch]
  );
  for (const old of existing.rows) {
    if (old.dns_record_id) {
      const { deleteDNSRecord } = require('../services/dns');
      await deleteDNSRecord(old.subdomain).catch(err =>
        console.error(`[PREVIEW] DNS cleanup failed for ${old.subdomain}:`, err.message)
      );
    }
    await pool.query('DELETE FROM deployments WHERE id = $1', [old.id]);
    console.log(`[PREVIEW] Cleaned up previous preview deployment #${old.id}`);
  }

  // Create DNS record for the preview subdomain
  const { createDNSRecord } = require('../services/dns');
  const dnsResult = await createDNSRecord(previewSubdomain, server.ip_address);
  const dnsRecordId = dnsResult.success ? dnsResult.recordId : null;
  if (!dnsResult.success) {
    console.warn(`[PREVIEW] DNS record creation failed for ${previewSubdomain}: ${dnsResult.error}`);
  }

  // Create deployment record
  const deployResult = await pool.query(
    `INSERT INTO deployments (server_id, user_id, git_url, status, output, subdomain, dns_record_id, branch, is_preview)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true) RETURNING id`,
    [
      server.id, server.user_id, gitUrl, 'pending',
      `🔍 ${reason}\nPreview: ${previewSubdomain}.cloudedbasement.ca\n`,
      previewSubdomain, dnsRecordId, branch,
    ]
  );

  const deploymentId = deployResult.rows[0].id;
  console.log(`[PREVIEW] Deployment #${deploymentId} for branch '${branch}' -> ${previewSubdomain}.cloudedbasement.ca`);

  setImmediate(() => {
    performDeployment(server, gitUrl, repoName, deploymentId, previewSubdomain, branch).catch(async (err) => {
      console.error(`[PREVIEW] Deployment #${deploymentId} failed:`, err);
      const failureOutput = `❌ Preview deploy failed: ${err.message}`;
      try {
        await pool.query(
          'UPDATE deployments SET status = $1, output = $2, deployed_at = NOW() WHERE id = $3',
          ['failed', failureOutput, deploymentId]
        );
      } catch (dbErr) {
        console.error(`[PREVIEW] Failed to update status:`, dbErr);
      }
      analyzeDeploymentFailure(deploymentId, failureOutput);
    });
  });

  return { deploymentId, previewSubdomain };
};

/**
 * Trigger auto-deploy for a specific domain from GitHub webhook
 * 
 * This is for multi-site setups where each domain has its own repo.
 * 
 * Flow:
 * 1. GitHub push → webhook with domainId in URL
 * 2. Webhook controller verifies domain-specific secret
 * 3. Calls this function with domain info
 * 4. Deploys to /var/www/sites/{linked_subdomain}/
 * 
 * @param {Object} server - Server row from database  
 * @param {Object} domain - Domain row from database (must have linked_subdomain)
 * @param {string} gitUrl - Repository URL to deploy
 * @param {string} reason - Human-readable reason for deploy log
 * @returns {Object} { deploymentId }
 */
exports.triggerDomainAutoDeploy = async (server, domain, gitUrl, reason = 'Domain auto-deploy') => {
  const repoName = gitUrl.split('/').pop().replace('.git', '');
  
  // Domain MUST have linked_subdomain to know where to deploy
  if (!domain.linked_subdomain) {
    throw new Error(`Domain ${domain.domain} has no linked subdomain - cannot determine deploy path`);
  }
  
  // Create deployment record with domain_id
  const deployResult = await pool.query(
    `INSERT INTO deployments (server_id, user_id, git_url, status, output, subdomain, domain_id) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [server.id, server.user_id, gitUrl, 'pending', 
     `🚀 ${reason}\nDeploying to ${domain.domain} (${domain.linked_subdomain})...`,
     domain.linked_subdomain, domain.id]
  );

  const deploymentId = deployResult.rows[0].id;
  console.log(`[DOMAIN-AUTO-DEPLOY] Deployment #${deploymentId} for ${domain.domain}: ${gitUrl}`);

  // Update domain deployment status
  await pool.query(
    'UPDATE domains SET deployment_status = $1, last_deployed_at = NOW() WHERE id = $2',
    ['deploying', domain.id]
  );

  // Perform deployment asynchronously to the domain's subdomain directory
  setImmediate(() => {
    performDeployment(server, gitUrl, repoName, deploymentId, domain.linked_subdomain)
      .then(async () => {
        // Mark domain deploy as success
        await pool.query(
          'UPDATE domains SET deployment_status = $1 WHERE id = $2',
          ['success', domain.id]
        );
      })
      .catch(async (err) => {
        console.error(`[DOMAIN-AUTO-DEPLOY] Deployment #${deploymentId} failed:`, err);
        try {
          await pool.query(
            'UPDATE deployments SET status = $1, output = $2, deployed_at = NOW() WHERE id = $3',
            ['failed', `❌ Auto-deploy to ${domain.domain} failed: ${err.message}`, deploymentId]
          );
          await pool.query(
            'UPDATE domains SET deployment_status = $1 WHERE id = $2',
            ['failed', domain.id]
          );
        } catch (dbErr) {
          console.error(`[DOMAIN-AUTO-DEPLOY] Failed to update status:`, dbErr);
        }
      });
  });

  return { deploymentId };
};

/**
 * POST /enable-domain-autodeploy
 * Enable auto-deploy for a specific domain and generate webhook secret
 */
exports.enableDomainAutoDeploy = async (req, res) => {
  try {
    const { domainId } = req.body;
    const userId = req.session.userId;
    
    if (!domainId) {
      return res.json({ success: false, error: 'Domain ID required' });
    }
    
    // Verify domain belongs to user and has linked_subdomain
    const domainResult = await pool.query(
      `SELECT d.*, s.id as server_id 
       FROM domains d 
       JOIN servers s ON d.server_id = s.id 
       WHERE d.id = $1 AND d.user_id = $2`,
      [domainId, userId]
    );
    
    if (domainResult.rows.length === 0) {
      return res.json({ success: false, error: 'Domain not found' });
    }
    
    const domain = domainResult.rows[0];
    
    if (!domain.linked_subdomain) {
      return res.json({ success: false, error: 'Domain must be linked to a deployment first' });
    }
    
    // Generate webhook secret
    const crypto = require('crypto');
    const webhookSecret = crypto.randomBytes(32).toString('hex');
    
    // Enable auto-deploy for this domain
    await pool.query(
      `UPDATE domains 
       SET auto_deploy_enabled = true, webhook_secret = $1 
       WHERE id = $2`,
      [webhookSecret, domainId]
    );
    
    // Construct webhook URL
    const webhookUrl = `https://cloudedbasement.ca/webhook/github/${domain.server_id}/${domainId}`;
    
    console.log(`[AUTO-DEPLOY] Enabled for domain ${domain.domain} (ID: ${domainId})`);
    
    return res.json({ 
      success: true, 
      webhookUrl,
      webhookSecret,
      message: 'Add this webhook URL to your GitHub repository settings'
    });
    
  } catch (error) {
    console.error('[AUTO-DEPLOY] Enable domain error:', error);
    return res.json({ success: false, error: 'Failed to enable auto-deploy' });
  }
};

/**
 * POST /disable-domain-autodeploy
 * Disable auto-deploy for a specific domain
 */
exports.disableDomainAutoDeploy = async (req, res) => {
  try {
    const { domainId } = req.body;
    const userId = req.session.userId;
    
    // Verify ownership
    const result = await pool.query(
      'SELECT id FROM domains WHERE id = $1 AND user_id = $2',
      [domainId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.json({ success: false, error: 'Domain not found' });
    }
    
    await pool.query(
      'UPDATE domains SET auto_deploy_enabled = false WHERE id = $1',
      [domainId]
    );
    
    console.log(`[AUTO-DEPLOY] Disabled for domain ID: ${domainId}`);
    
    return res.json({ success: true });
    
  } catch (error) {
    console.error('[AUTO-DEPLOY] Disable domain error:', error);
    return res.json({ success: false, error: 'Failed to disable auto-deploy' });
  }
};


/**
 * POST /start-trial
 * Provision a Basic server for 3 days without payment.
 * Guards: email confirmation, daily cap, per-user, per-IP, per-fingerprint.
 */
exports.startTrial = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!req.session.emailConfirmed) {
      return res.redirect('/dashboard?error=Please confirm your email before starting a trial');
    }

    // Global daily trial cap — prevent mass abuse (50 trials/day max)
    const dailyTrialCount = await pool.query(
      `SELECT COUNT(*) as count FROM servers
       WHERE is_trial = true AND created_at > NOW() - INTERVAL '24 hours'`
    );
    if (parseInt(dailyTrialCount.rows[0].count) >= 50) {
      console.log(`[TRIAL] Daily trial cap reached (50/day). Rejecting user ${userId}`);
      return res.redirect('/dashboard?error=Trial signups temporarily limited. Please try again tomorrow or subscribe now.');
    }

    const userResult = await pool.query(
      'SELECT trial_used, email, browser_fingerprint FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.redirect('/dashboard?error=User not found');
    }

    if (userResult.rows[0].trial_used) {
      return res.redirect('/dashboard?error=You have already used your free trial. Please subscribe to continue.');
    }

    const serverCheck = await pool.query(
      "SELECT * FROM servers WHERE user_id = $1 AND status NOT IN ('deleted', 'failed')",
      [userId]
    );

    if (serverCheck.rows.length > 0) {
      return res.redirect('/dashboard?error=You already have a server');
    }

    // IP abuse check — one trial per IP per 90 days
    const clientIp = req.ip || req.socket.remoteAddress;
    const recentTrialCheck = await pool.query(
      `SELECT id FROM users
       WHERE signup_ip = $1
       AND trial_used = true
       AND trial_used_at > NOW() - INTERVAL '90 days'
       AND id != $2`,
      [clientIp, userId]
    );

    if (recentTrialCheck.rows.length > 0) {
      return res.redirect('/dashboard?error=A trial was recently used from this network. Please subscribe to continue.');
    }

    const userFingerprint = userResult.rows[0].browser_fingerprint;

    if (!userFingerprint) {
      return res.redirect('/dashboard?error=Browser verification required. Please enable JavaScript and try again.');
    }

    // Fingerprint abuse check — one trial per device per 90 days
    const fingerprintTrialCheck = await pool.query(
      `SELECT id FROM users
       WHERE browser_fingerprint = $1
       AND trial_used = true
       AND trial_used_at > NOW() - INTERVAL '90 days'
       AND id != $2`,
      [userFingerprint, userId]
    );

    if (fingerprintTrialCheck.rows.length > 0) {
      console.log(`[TRIAL] Blocked trial for user ${userId} - device fingerprint already used`);
      return res.redirect('/dashboard?error=A trial was recently used from this device. Please subscribe to continue.');
    }

    console.log(`[TRIAL] Starting free trial for user ${userId}`);

    // Pass null for stripeChargeId to signal trial mode inside createRealServer
    await createRealServer(userId, 'basic', null, 'monthly', null);

    res.redirect('/dashboard?success=Your 3-day free trial has started! Your server is being provisioned.&provisioning=true');
  } catch (err) {
    console.error('[TRIAL] Start trial error:', err);
    res.redirect('/dashboard?error=Failed to start trial. Please try again or contact support.');
  }
};

// Stream live logs for a deployment via Server-Sent Events
exports.streamLogs = async (req, res) => {
  const userId = req.session.userId;
  const { deploymentId } = req.query;

  if (!deploymentId || !/^\d+$/.test(deploymentId)) {
    return res.status(400).json({ error: 'Invalid deployment ID' });
  }

  // Ownership check — two queries to avoid column name collisions on SELECT *
  let depResult, dep, serverResult, server, sshPassword;
  try {
    depResult = await pool.query(
      'SELECT id, git_url, user_id, server_id FROM deployments WHERE id = $1 AND user_id = $2',
      [deploymentId, userId]
    );
    if (depResult.rows.length === 0) return res.status(404).json({ error: 'Deployment not found' });

    dep = depResult.rows[0];
    serverResult = await pool.query(
      'SELECT ip_address, ssh_password, ssh_password_iv FROM servers WHERE id = $1 AND user_id = $2',
      [dep.server_id, userId]
    );
    if (serverResult.rows.length === 0) return res.status(404).json({ error: 'Server not found' });

    server = serverResult.rows[0];
    sshPassword = decryptSshPassword(server.ssh_password, server.ssh_password_iv);
  } catch (err) {
    console.error('[streamLogs] DB error:', err);
    return res.status(500).json({ error: 'Database error' });
  }

  // Service name is deterministic — same logic used at deploy time
  const repoName = dep.git_url.split('/').pop().replace(/\.git$/, '').replace(/[^a-zA-Z0-9_-]/g, '');
  if (!repoName) return res.status(400).json({ error: 'Cannot derive service name' });
  const serviceName = `${repoName}.service`;

  // SSE headers — X-Accel-Buffering disables nginx proxy buffering
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const send = (type, text) => {
    res.write(`data: ${JSON.stringify({ type, text })}\n\n`);
  };

  const conn = new Client();
  let logStream = null;

  const cleanup = () => {
    try { logStream?.close(); } catch (_) {}
    try { conn.destroy(); } catch (_) {}
  };

  // When the browser closes the tab / navigates away, kill the SSH connection
  req.on('close', cleanup);

  try {
    await new Promise((resolve, reject) => {
      conn.on('ready', resolve);
      conn.on('error', reject);
      conn.connect({ host: server.ip_address, port: 22, username: 'root', password: sshPassword, readyTimeout: 15000 });
    });

    send('info', `Connected — streaming ${serviceName}`);

    await new Promise((resolve, reject) => {
      conn.exec(`journalctl -u ${serviceName} -n 200 -f --no-pager --output=short-iso`, (err, stream) => {
        if (err) return reject(err);
        logStream = stream;
        const pipe = (data) => data.toString().split('\n').filter(Boolean).forEach(line => send('log', line));
        stream.on('data', pipe);
        stream.stderr.on('data', pipe);
        stream.on('close', resolve);
      });
    });
  } catch (err) {
    send('error', `Connection failed: ${err.message}`);
  } finally {
    cleanup();
    res.end();
  }
};

module.exports = {
  serverAction: exports.serverAction,
  deleteServer: exports.deleteServer,
  deploy: exports.deploy,
  apiDeploy: exports.apiDeploy,
  rollback: exports.rollback,
  addDomain: exports.addDomain,
  deleteDomain: exports.deleteDomain,
  enableSSL: exports.enableSSL,
  setupDatabase: exports.setupDatabase,
  deleteDeployment: exports.deleteDeployment,
  // Auto-deploy exports
  triggerAutoDeploy: exports.triggerAutoDeploy,
  triggerDomainAutoDeploy: exports.triggerDomainAutoDeploy,
  enableDomainAutoDeploy: exports.enableDomainAutoDeploy,
  disableDomainAutoDeploy: exports.disableDomainAutoDeploy,
  // Server provisioning
  startTrial: exports.startTrial,
  // Preview deployments
  triggerPreviewDeploy: exports.triggerPreviewDeploy,
  // Log streaming
  streamLogs: exports.streamLogs,
};
