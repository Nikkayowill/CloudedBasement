const pool = require('../db');
const { getDashboardHead, getFooter, getScripts, getResponsiveNav, escapeHtml, getDashboardLayoutStart, getDashboardLayoutEnd } = require('../src/utils/helpers');
const { getUserServer, hasSuccessfulPayment } = require('../src/utils/db-helpers');
const { isTrialAvailable } = require('../src/utils/db-helpers');
const { decryptSshPassword } = require('../src/utils/sshCrypto');
const { PAYMENT_STATUS, SERVER_STATUS } = require('../src/utils/constants');
const serverUpdates = require('../services/serverUpdates');
const { sendEmail } = require('../services/email');
const { getNonce } = require('../src/utils/nonce');
const { getUptimeStatusForUser } = require('../services/uptimeMonitor');

// Dashboard navigation items - centralized for consistency
const DASHBOARD_NAV_ITEMS = [
  {
    id: 'overview',
    label: 'Overview',
    icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-1a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5z"/></svg>'
  },
  {
    id: 'sites',
    label: 'Sites',
    icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>'
  },
  {
    id: 'deploy',
    label: 'Deploy',
    icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>'
  },
  {
    id: 'dev-tools',
    label: 'Dev Tools',
    icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>'
  }
];

// GET /dashboard
exports.showDashboard = async (req, res) => {
    try {
        const userId = req.session.userId;
        
        // Get flash messages from session or query params
        const sessionFlash = req.session.flashMessage || '';
        delete req.session.flashMessage; // Clear after reading
        
        const flashSuccess = escapeHtml(req.query.success || sessionFlash || '');
        const flashError = escapeHtml(req.query.error || '');
        const emailConfirmed = !!req.session.emailConfirmed;
        
        // Check if coming from payment (show provisioning UI even if server not created yet)
        const isProvisioning = req.query.provisioning === 'true';
        
        // Demo mode: admin-only, renders dashboard with fake server data for content creation
        const isDemoMode = req.query.demo === 'true' && req.session.userRole === 'admin';
        const isDemoProvisioning = isDemoMode && req.query.state === 'provisioning';

        // Check if user has paid
        const hasPaid = isDemoMode ? true : await hasSuccessfulPayment(userId);

        // Get user's server info (using helper)
        const server = isDemoMode ? null : await getUserServer(userId);
        // In demo provisioning state, pretend there's no server yet so provisioning UI shows
        const hasServer = isDemoMode ? !isDemoProvisioning : !!server;

        // If this is a WordPress server, fetch the wordpress_sites row for the status card
        let wpSite = null;
        if (!isDemoMode && server?.server_type === 'wordpress') {
            const wpResult = await pool.query(
                'SELECT * FROM wordpress_sites WHERE server_id = $1 AND user_id = $2 LIMIT 1',
                [server.id, userId]
            );
            wpSite = wpResult.rows[0] || null;
        }
        
        // Demo mode: generate realistic mock data
        const demoServer = isDemoMode ? {
            id: 999,
            status: isDemoProvisioning ? 'provisioning' : 'running',
            hostname: 'basement-core',
            plan: req.query.demoPlan || 'pro',
            ip_address: '143.198.167.42',
            ipv6_address: '2604:a880:800:c1::1a9:d001',
            ssh_username: 'root',
            ssh_password: 'demo-password-hidden',
            droplet_name: `basement-${userId}-1738900000000`,
            site_limit: 5,
            postgres_installed: true,
            postgres_db_name: 'app_db',
            postgres_db_user: 'basement_user',
            postgres_db_password: 'demo-pg-pass',
            mongodb_installed: false,
            auto_deploy_enabled: true,
            github_webhook_secret: 'whsec_demo1234567890',
            created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000) // 12 days ago
        } : null;
        
        const activeServer = isDemoMode ? demoServer : server;
        
        // Explicit boolean check - if column doesn't exist, treats as false (safe default)
        const postgresInstalled = activeServer?.postgres_installed === true;
        const mongodbInstalled = activeServer?.mongodb_installed === true;
        
        // Extract database credentials if they exist
        const postgresCredentials = postgresInstalled ? {
            dbName: activeServer?.postgres_db_name || 'app_db',
            dbUser: activeServer?.postgres_db_user || 'basement_user',
            dbPassword: activeServer?.postgres_db_password || '',
            host: activeServer?.ip_address || 'localhost',
            port: '5432'
        } : null;
        
        const mongodbCredentials = mongodbInstalled ? {
            dbName: activeServer?.mongodb_db_name || 'app_db',
            dbUser: activeServer?.mongodb_db_user || 'basement_user',
            dbPassword: activeServer?.mongodb_db_password || '',
            host: activeServer?.ip_address || 'localhost',
            port: '27017',
            // URL-encoded versions for connection strings
            dbUserEncoded: encodeURIComponent(activeServer?.mongodb_db_user || 'basement_user'),
            dbPasswordEncoded: encodeURIComponent(activeServer?.mongodb_db_password || '')
        } : null;

        // Get payment details to determine plan
        const paymentResult = (hasPaid && !isDemoMode) ? await pool.query(
            'SELECT plan FROM payments WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT 1',
            [userId, PAYMENT_STATUS.SUCCEEDED]
        ) : { rows: [] };
        const paidPlan = isDemoMode ? (demoServer.plan) : (paymentResult.rows[0]?.plan || 'basic');

        // Get deployments
        const deploymentsResult = isDemoMode ? { rows: [] } : await pool.query(
            'SELECT * FROM deployments WHERE user_id = $1 ORDER BY deployed_at DESC NULLS LAST, created_at DESC',
            [userId]
        );
        
        // Demo mode: realistic deployment history
        const demoDeployments = isDemoMode ? [
            { id: 101, git_url: 'https://github.com/demo-user/my-saas-app', branch: 'main', status: 'success', subdomain: 'my-saas-app', deployed_at: new Date(Date.now() - 2 * 60 * 60 * 1000), created_at: new Date(Date.now() - 2 * 60 * 60 * 1000), deployment_type: 'github' },
            { id: 100, git_url: 'https://github.com/demo-user/landing-page', branch: 'main', status: 'success', subdomain: 'landing-page', deployed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), deployment_type: 'github' },
            { id: 99, git_url: 'https://github.com/demo-user/api-backend', branch: 'production', status: 'success', subdomain: 'api-backend', deployed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), deployment_type: 'github' }
        ] : [];

        // Count unique sites for this server (distinct git_urls)
        const siteCountResult = (hasServer && !isDemoMode) ? await pool.query(
            'SELECT COUNT(DISTINCT git_url) as count FROM deployments WHERE server_id = $1',
            [server.id]
        ) : { rows: [{ count: isDemoMode ? 3 : 0 }] };
        
        const siteCount = isDemoMode ? 3 : parseInt(siteCountResult.rows[0]?.count || 0);
        const siteLimit = activeServer?.site_limit || 2;

        // Get domains
        const domainsResult = isDemoMode ? { rows: [] } : await pool.query(
            'SELECT * FROM domains WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        
        // Demo mode: realistic domains
        const demoDomains = isDemoMode ? [
            { id: 201, domain: 'myapp.com', ssl_enabled: true, verified: true, created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
            { id: 202, domain: 'api.myapp.com', ssl_enabled: true, verified: true, created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) }
        ] : [];

        // Get support tickets
        const ticketsResult = isDemoMode ? { rows: [] } : await pool.query(
            'SELECT * FROM support_tickets WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        
        // Demo mode: realistic tickets
        const demoTickets = isDemoMode ? [
            { id: 301, subject: 'Help with custom Nginx config', priority: 'normal', status: 'resolved', created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) }
        ] : [];

        // Get pending server updates (if user has a server)
        let pendingUpdates = [];
        let updateHistory = [];
        if (server?.id && !isDemoMode) {
            pendingUpdates = await serverUpdates.getPendingUpdates(server.id);
            updateHistory = await serverUpdates.getUpdateHistory(server.id);
        }

        // Check if user is eligible for free trial (comprehensive check to match /start-trial endpoint)
        let trialAvailable = false;
        if (!isDemoMode) {
            const trialCheckResult = await pool.query(
                'SELECT trial_used, browser_fingerprint FROM users WHERE id = $1',
                [userId]
            );
            
            trialAvailable = !trialCheckResult.rows[0]?.trial_used && !hasServer && !hasPaid;
            
            // Additional checks to match /start-trial endpoint validation
            if (trialAvailable) {
                // Must have fingerprint (JS enabled)
                const userFingerprint = trialCheckResult.rows[0]?.browser_fingerprint;
                if (!userFingerprint) {
                    trialAvailable = false;
                } else {
                    // Check if IP or fingerprint already used trial within 90 days
                    const clientIp = req.ip || req.socket.remoteAddress;
                    
                    const ipTrialCheck = await pool.query(
                        `SELECT id FROM users 
                         WHERE signup_ip = $1 
                         AND trial_used = true 
                         AND trial_used_at > NOW() - INTERVAL '90 days'
                         AND id != $2`,
                        [clientIp, userId]
                    );
                    
                    const fpTrialCheck = await pool.query(
                        `SELECT id FROM users 
                         WHERE browser_fingerprint = $1 
                         AND trial_used = true 
                         AND trial_used_at > NOW() - INTERVAL '90 days'
                         AND id != $2`,
                        [userFingerprint, userId]
                    );
                    
                    if (ipTrialCheck.rows.length > 0 || fpTrialCheck.rows.length > 0) {
                        trialAvailable = false;
                    }
                }
            }
        }

        const csrfToken = typeof req.csrfToken === 'function' ? req.csrfToken() : '';
        
        // Show provisioning UI if: coming from payment OR server exists with provisioning status OR demo provisioning
        const showProvisioningUI = isProvisioning || isDemoProvisioning || (hasServer && activeServer?.status === 'provisioning');

        // Compute live site URL: prefer SSL domain > any domain > IP
        const domains = isDemoMode ? demoDomains : (domainsResult.rows || []);
        const sslDomain = domains.find(d => d.ssl_enabled);
        const liveSiteUrl = sslDomain 
            ? `https://${sslDomain.domain}` 
            : (domains.length > 0 ? `http://${domains[0].domain}` : `http://${activeServer?.ip_address || ''}`);

        const dashboardHTML = buildDashboardTemplate({
            flashSuccess,
            flashError,
            emailConfirmed,
            serverStatus: activeServer?.status || (isProvisioning || isDemoProvisioning ? 'provisioning' : 'unknown'),
            serverName: activeServer?.hostname || 'basement-core',
            plan: (activeServer?.plan || paidPlan || 'basic').toString(),
            ipAddress: activeServer?.ip_address || '',
            ipv6Address: activeServer?.ipv6_address || '',
            serverIp: activeServer?.ip_address || '',
            sshUsername: activeServer?.ssh_username || 'root',
            sshPassword: activeServer ? decryptSshPassword(activeServer.ssh_password, activeServer.ssh_password_iv) : '',
            dropletName: activeServer?.droplet_name || `basement-${userId}-unknown`,
            userId: userId,
            serverId: activeServer?.id || null,
            csrfToken,
            deployments: isDemoMode ? demoDeployments : (deploymentsResult.rows || []),
            domains: domains,
            tickets: isDemoMode ? demoTickets : (ticketsResult.rows || []),
            liveSiteUrl,
            userEmail: req.session.userEmail,
            userRole: req.session.userRole,
            hasPaid,
            hasServer,
            isProvisioning: showProvisioningUI,
            isDemoProvisioning,
            isDemoMode,
            dismissedNextSteps: isDemoMode ? true : (req.session.dismissedNextSteps || false),
            postgresInstalled,
            mongodbInstalled,
            postgresCredentials,
            mongodbCredentials,
            siteCount,
            siteLimit,
            trialAvailable,
            // Auto-deploy fields
            autoDeployEnabled: activeServer?.auto_deploy_enabled === true,
            githubWebhookSecret: activeServer?.github_webhook_secret || null,
            // Server updates
            pendingUpdates,
            updateHistory,
            // WordPress site (null for Node.js servers)
            wpSite: wpSite || null
        });

        res.send(`
${getDashboardHead('Dashboard - Basement')}
    
        ${getResponsiveNav(req)}
    
        ${dashboardHTML}
    
        ${getFooter()}
    
        ${getScripts('nav.js', 'dashboard.js')}
        `);
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).send('An error occurred loading your dashboard');
    }
};

// POST /submit-ticket - Customer submits new support ticket
const submitSupportTicket = async (req, res) => {
  try {
    const { subject, description, priority } = req.body;
    const userId = req.session.userId;

    if (!subject || !description || !priority) {
      return res.status(400).json({ success: false, error: 'All fields required' });
    }

    if (!['normal', 'high', 'urgent'].includes(priority)) {
      return res.status(400).json({ success: false, error: 'Invalid priority' });
    }

    // Insert new ticket
    const result = await pool.query(
      'INSERT INTO support_tickets (user_id, subject, description, priority, status, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id',
      [userId, subject.trim(), description.trim(), priority, 'open']
    );

    const ticketId = result.rows[0].id;

    // Log audit event
    console.log(`[TICKET] New ticket #${ticketId} submitted by user ${userId}`);

    // Send email notification to business email
    try {
      const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
      const userEmail = userResult.rows[0]?.email || 'unknown';

      const html = `
        <h2>New Support Ticket #${ticketId}</h2>
        <p><strong>From:</strong> ${escapeHtml(userEmail)} (User ID: ${userId})</p>
        <p><strong>Priority:</strong> ${priority.toUpperCase()}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject.trim())}</p>
        <hr style="border: 1px solid #ddd; margin: 20px 0;">
        <p><strong>Description:</strong></p>
        <p style="white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 5px;">${escapeHtml(description.trim())}</p>
      `;
      const text = `New Support Ticket #${ticketId}\nFrom: ${userEmail} (User ID: ${userId})\nPriority: ${priority}\nSubject: ${subject.trim()}\n\nDescription:\n${description.trim()}`;

      await sendEmail('support@cloudedbasement.ca', `[Ticket #${ticketId}] ${subject.trim()}`, html, text);
      console.log(`[TICKET] Email notification sent for ticket #${ticketId}`);
    } catch (emailErr) {
      console.error(`[TICKET] Failed to send email notification for ticket #${ticketId}:`, emailErr.message);
      // Don't fail the ticket submission if email fails
    }

    res.json({ success: true, message: 'Ticket submitted', ticketId });
  } catch (error) {
    console.error('[TICKET] Submit error:', error);
    res.status(500).json({ success: false, error: 'Failed to submit ticket' });
  }
};

// POST /change-password - Change user password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.session.userId;
    const userEmail = req.session.userEmail;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Current and new passwords required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters' });
    }

    // Get user from database
    const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Verify current password
    const bcrypt = require('bcrypt');
    const passwordMatch = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, userId]);

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('[DASHBOARD] Change password error:', error);
    res.status(500).json({ success: false, error: 'Failed to change password' });
  }
};

// POST /apply-updates - Apply all pending updates to user's server
const applyUpdates = async (req, res) => {
  try {
    const userId = req.session.userId;
    
    // Get user's server (getUserServer imported at top of file)
    const server = await getUserServer(userId);
    
    if (!server) {
      return res.redirect('/dashboard?error=No server found');
    }
    
    // Verify server is in a state where updates can be applied
    if (server.status !== 'running') {
      return res.redirect('/dashboard?error=Server is not running. Updates can only be applied to running servers.');
    }
    
    if (!server.ip_address || !server.ssh_password) {
      return res.redirect('/dashboard?error=Server is missing connection details. Please contact support.');
    }
    
    // Get pending updates for this server
    const pending = await serverUpdates.getPendingUpdates(server.id);
    
    if (pending.length === 0) {
      return res.redirect('/dashboard?success=Server already up to date');
    }
    
    // Apply all pending updates — pass real userId so the audit log records who triggered it
    const results = await serverUpdates.applyAllPendingUpdates(server, userId);
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    if (failCount > 0) {
    return res.redirect(`/dashboard?error=${encodeURIComponent(failCount + ' update(s) failed. ' + successCount + ' succeeded.')}`);
    }

    // Post-apply health check — ping the server's live URL to confirm it's still up
    let healthWarning = null;
    const domains = await pool.query('SELECT domain, ssl_enabled FROM domains WHERE user_id = $1 ORDER BY ssl_enabled DESC LIMIT 1', [userId]);
    const healthUrl = domains.rows[0]
      ? `${domains.rows[0].ssl_enabled ? 'https' : 'http'}://${domains.rows[0].domain}`
      : `http://${server.ip_address}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const healthRes = await fetch(healthUrl, { signal: controller.signal, redirect: 'follow' });
      clearTimeout(timeoutId);
      if (!healthRes.ok && healthRes.status >= 500) {
        healthWarning = `Updates applied but server returned HTTP ${healthRes.status}. Verify your app is running.`;
      }
    } catch (healthErr) {
      healthWarning = `Updates applied but health check failed (${healthErr.message}). Verify your app is running.`;
      console.warn('[DASHBOARD] Post-update health check failed for user', userId, ':', healthErr.message);
    }

    if (healthWarning) {
      return res.redirect(`/dashboard?warning=${encodeURIComponent(healthWarning)}`);
    }
    return res.redirect(`/dashboard?success=${encodeURIComponent(successCount + ' update(s) applied successfully')}`);
  } catch (error) {
    console.error('[DASHBOARD] Apply updates error:', error);
    res.redirect('/dashboard?error=Failed to apply updates. Please try again or contact support.');
  }
};

// GET /api/credentials - Fetch sensitive credentials on demand (not embedded in HTML)
const getCredentials = async (req, res) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Get user's server
    const server = await getUserServer(userId);
    
    if (!server) {
      return res.status(404).json({ error: 'No server found' });
    }
    
        const credentialType = req.query.type; // 'ssh', 'postgres', 'mongodb', 'webhook', or 'all'
        const response = {};
        if (credentialType === 'webhook') {
            // Audit log for webhook credential access
            try {
                const { logAdminAction } = require('../services/auditLog');
                await logAdminAction(
                  req.session.userId,
                  req.session.userEmail || '',
                  'accessed_webhook_secret',
                  '',
                  '',
                  ''
                );
            } catch (auditErr) {
                console.error('[AUDIT] Failed to log webhook credential access:', auditErr);
            }
            // Return the GitHub webhook secret
            if (server.github_webhook_secret) {
                return res.json({ secret: server.github_webhook_secret });
            } else {
                return res.status(404).json({ error: 'Webhook secret not found' });
            }
        }
        if (credentialType === 'ssh' || credentialType === 'all') {
      response.ssh = {
        username: server.ssh_username || 'root',
        password: decryptSshPassword(server.ssh_password, server.ssh_password_iv) || '',
        ip: server.ip_address || '',
        command: `ssh ${server.ssh_username || 'root'}@${server.ip_address || ''}`
      };
    }
    
    if (credentialType === 'postgres' || credentialType === 'all') {
      if (server.postgres_installed && server.postgres_db_password) {
        response.postgres = {
             host: server.ip_address || 'localhost',
             port: '5432',
             database: server.postgres_db_name || 'app_db',
             username: server.postgres_db_user || 'basement_user',
             password: server.postgres_db_password || '',
             connectionString: `postgresql://${encodeURIComponent(server.postgres_db_user || 'basement_user')}:${encodeURIComponent(server.postgres_db_password || '')}@${server.ip_address || 'localhost'}:5432/${encodeURIComponent(server.postgres_db_name || 'app_db')}`
        };
      }
    }
    
    if (credentialType === 'mongodb' || credentialType === 'all') {
      if (server.mongodb_installed && server.mongodb_db_password) {
        const userEncoded = encodeURIComponent(server.mongodb_db_user || 'basement_user');
        const passEncoded = encodeURIComponent(server.mongodb_db_password || '');
        response.mongodb = {
          host: server.ip_address || 'localhost',
          port: '27017',
          database: server.mongodb_db_name || 'app_db',
          username: server.mongodb_db_user || 'basement_user',
          password: server.mongodb_db_password || '',
          connectionString: `mongodb://${userEncoded}:${passEncoded}@${server.ip_address || 'localhost'}:27017/${server.mongodb_db_name || 'app_db'}`
        };
      }
    }
    
    // Log credential access for audit
    console.log(`[CREDENTIALS] User ${userId} accessed ${credentialType} credentials`);
    
    res.json(response);
  } catch (error) {
    console.error('[CREDENTIALS] Error:', error);
    res.status(500).json({ error: 'Failed to retrieve credentials' });
  }
};

// GET /api/dashboard — JSON data for the React dashboard
const getDashboardData = async (req, res) => {
    try {
        const userId = req.session.userId;

        // Admin-only demo mode: return realistic fake data, skip all DB queries
        const isDemoMode = req.query.demo === 'true' && req.session.userRole === 'admin';
        if (isDemoMode) {
            const demoPlan = req.query.demoPlan || 'pro';
            const now = Date.now();
            return res.json({
                // Identity
                userEmail:        req.session.userEmail,
                userRole:         req.session.userRole,
                isDemo:           true,
                emailConfirmed:   true,
                // Plan / payment
                plan:             demoPlan,
                hasPaid:          true,
                trialAvailable:   false,
                paymentInterval:  'monthly',
                // Server
                hasServer:        true,
                isProvisioning:   false,
                serverStatus:     'running',
                serverName:       'basement-demo',
                serverId:         999,
                ipAddress:        '143.198.167.42',
                ipv6Address:      '2604:a880:800:c1::1a9:d001',
                sshUsername:      'root',
                postgresInstalled: true,
                mongodbInstalled:  false,
                siteCount:        3,
                siteLimit:        5,
                // Deployments
                deployments: [
                    { id: 101, git_url: 'https://github.com/demo-user/my-saas-app',   branch: 'main',       status: 'success', subdomain: 'my-saas-app',   commit_sha: 'a1b2c3d', is_preview: false, deployed_at: new Date(now - 2 * 3600 * 1000),   created_at: new Date(now - 2 * 3600 * 1000),   deployment_type: 'github' },
                    { id: 100, git_url: 'https://github.com/demo-user/landing-page',  branch: 'main',       status: 'success', subdomain: 'landing-page',  commit_sha: 'e4f5a6b', is_preview: false, deployed_at: new Date(now - 3 * 86400 * 1000), created_at: new Date(now - 3 * 86400 * 1000), deployment_type: 'github' },
                    { id: 99,  git_url: 'https://github.com/demo-user/api-backend',   branch: 'production', status: 'success', subdomain: 'api-backend',   commit_sha: 'c7d8e9f', is_preview: false, deployed_at: new Date(now - 5 * 86400 * 1000), created_at: new Date(now - 5 * 86400 * 1000), deployment_type: 'github' },
                    { id: 98,  git_url: 'https://github.com/demo-user/preview-branch', branch: 'feat/auth', status: 'success', subdomain: 'preview-auth',  commit_sha: '1a2b3c4', is_preview: true,  deployed_at: new Date(now - 1 * 86400 * 1000), created_at: new Date(now - 1 * 86400 * 1000), deployment_type: 'github' },
                ],
                // Domains
                domains: [
                    { id: 201, domain: 'myapp.com',     ssl_enabled: true,  verified: true,  created_at: new Date(now - 10 * 86400 * 1000) },
                    { id: 202, domain: 'api.myapp.com', ssl_enabled: true,  verified: true,  created_at: new Date(now -  8 * 86400 * 1000) },
                    { id: 203, domain: 'staging.myapp.com', ssl_enabled: false, verified: false, created_at: new Date(now - 2 * 86400 * 1000) },
                ],
                liveSiteUrl: 'https://myapp.com',
                // Uptime monitoring
                uptimeStatus: {
                    'https://myapp.com':     { status: 'up',   latency: 142, checked_at: new Date(now - 60 * 1000) },
                    'https://api.myapp.com': { status: 'up',   latency: 89,  checked_at: new Date(now - 60 * 1000) },
                },
                // API keys
                apiKeys: [
                    { id: 1, name: 'CI/CD Pipeline',   key_prefix: 'cb_live_Kx9m', scopes: ['deploy'], last_used_at: new Date(now - 2 * 3600 * 1000),   expires_at: null, created_at: new Date(now - 30 * 86400 * 1000) },
                    { id: 2, name: 'Monitoring Agent', key_prefix: 'cb_live_Rp4n', scopes: ['read'],   last_used_at: new Date(now - 5 * 60 * 1000),     expires_at: null, created_at: new Date(now - 14 * 86400 * 1000) },
                ],
                // Server updates
                pendingUpdates: [
                    { id: 10, title: 'Node.js 20 LTS security patch',  description: 'Patches CVE-2024-1234', type: 'security', version: '20.15.1', is_critical: true,  status: 'released', created_at: new Date(now - 2 * 86400 * 1000) },
                    { id: 11, title: 'Nginx performance tuning',        description: 'Increases worker connections', type: 'performance', version: '1.26.1', is_critical: false, status: 'released', created_at: new Date(now - 4 * 86400 * 1000) },
                ],
                updateHistory: [
                    { id: 50, update_id: 8, title: 'SSL certificate renewal', type: 'maintenance', version: null,     is_critical: false, status: 'success', applied_at: new Date(now - 7 * 86400 * 1000),  execution_time_ms: 4200 },
                    { id: 49, update_id: 7, title: 'Fail2ban rule update',     type: 'security',   version: '1.0.2',  is_critical: false, status: 'success', applied_at: new Date(now - 14 * 86400 * 1000), execution_time_ms: 8100 },
                    { id: 48, update_id: 6, title: 'Disk cleanup script',      type: 'maintenance', version: null,    is_critical: false, status: 'success', applied_at: new Date(now - 21 * 86400 * 1000), execution_time_ms: 12500 },
                ],
                csrfToken: typeof req.csrfToken === 'function' ? req.csrfToken() : '',
            });
        }

        const hasPaid = await hasSuccessfulPayment(userId);
        const server  = await getUserServer(userId);
        const hasServer = !!server;

        const paymentResult = hasPaid ? await pool.query(
            'SELECT plan FROM payments WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT 1',
            [userId, PAYMENT_STATUS.SUCCEEDED]
        ) : { rows: [] };
        const plan = paymentResult.rows[0]?.plan || server?.plan || 'basic';

        const deploymentsResult = await pool.query(
            'SELECT * FROM deployments WHERE user_id = $1 ORDER BY deployed_at DESC NULLS LAST, created_at DESC',
            [userId]
        );

        const domainsResult = await pool.query(
            'SELECT * FROM domains WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );

        const siteCountResult = hasServer ? await pool.query(
            'SELECT COUNT(DISTINCT git_url) as count FROM deployments WHERE server_id = $1',
            [server.id]
        ) : { rows: [{ count: 0 }] };

        // Trial eligibility (shared logic)
        let trialAvailable = false;
        if (!hasServer && !hasPaid) {
            trialAvailable = await isTrialAvailable(userId, req.ip, pool);
        }

        const isProvisioning = server?.status === 'provisioning';

        const domains = domainsResult.rows || [];
        const sslDomain = domains.find(d => d.ssl_enabled);
        const liveSiteUrl = sslDomain
            ? `https://${sslDomain.domain}`
            : domains.length > 0 ? `http://${domains[0].domain}` : `http://${server?.ip_address || ''}`;

        const uptimeStatus = await getUptimeStatusForUser(userId);

        const apiKeysResult = await pool.query(
            `SELECT id, name, key_prefix, scopes, last_used_at, expires_at, created_at
             FROM api_keys
             WHERE user_id = $1 AND is_active = TRUE
             ORDER BY created_at DESC`,
            [userId]
        );

        const [pendingUpdates, updateHistory] = hasServer
            ? await Promise.all([
                serverUpdates.getPendingUpdates(server.id),
                serverUpdates.getUpdateHistory(server.id),
              ])
            : [[], []];

        res.json({
            userEmail:      req.session.userEmail,
            userRole:       req.session.userRole,
            plan:           plan.toString(),
            hasPaid,
            hasServer,
            isProvisioning,
            emailConfirmed: !!req.session.emailConfirmed,
            trialAvailable,
            serverStatus: server?.status || (isProvisioning ? 'provisioning' : 'unknown'),
            serverName:   server?.hostname || 'basement-core',
            serverId:     server?.id || null,
            ipAddress:    server?.ip_address || '',
            ipv6Address:  server?.ipv6_address || '',
            sshUsername:       server?.ssh_username || 'root',
            postgresInstalled: server?.postgres_installed === true,
            mongodbInstalled:  server?.mongodb_installed === true,
            siteCount:       parseInt(siteCountResult.rows[0]?.count || 0),
            siteLimit:       server?.site_limit || 2,
            paymentInterval: server?.payment_interval || 'monthly',
            deployments:     deploymentsResult.rows || [],
            domains,
            liveSiteUrl,
            uptimeStatus,
            apiKeys:        apiKeysResult.rows || [],
            pendingUpdates,
            updateHistory,
            csrfToken:      typeof req.csrfToken === 'function' ? req.csrfToken() : '',
        });
    } catch (error) {
        console.error('[API] /api/dashboard error:', error);
        res.status(500).json({ error: 'Failed to load dashboard data' });
    }
};

// GET /api/env-vars — list env vars for the user's server
const getEnvVars = async (req, res) => {
    try {
        const server = await getUserServer(req.session.userId);
        if (!server) return res.json({ envVars: [] });
        const result = await pool.query(
            'SELECT id, key, value, created_at FROM environment_variables WHERE server_id = $1 ORDER BY key ASC',
            [server.id]
        );
        res.json({ envVars: result.rows });
    } catch (err) {
        console.error('[ENV] getEnvVars error:', err);
        res.status(500).json({ error: 'Failed to fetch environment variables' });
    }
};

// POST /api/env-vars — create or update an env var
const createEnvVar = async (req, res) => {
    try {
        const { key, value } = req.body;
        if (!key || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
            return res.status(400).json({ error: 'Key must start with a letter or underscore and contain only letters, numbers, and underscores' });
        }
        if (value === undefined || value === null) {
            return res.status(400).json({ error: 'Value is required' });
        }
        const server = await getUserServer(req.session.userId);
        if (!server) return res.status(400).json({ error: 'No server found' });

        await pool.query(
            `INSERT INTO environment_variables (server_id, key, value, updated_at)
             VALUES ($1, $2, $3, NOW())
             ON CONFLICT (server_id, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
            [server.id, key.toUpperCase(), value]
        );
        const result = await pool.query(
            'SELECT id, key, value, created_at FROM environment_variables WHERE server_id = $1 AND key = $2',
            [server.id, key.toUpperCase()]
        );
        res.json({ envVar: result.rows[0] });
    } catch (err) {
        console.error('[ENV] createEnvVar error:', err);
        res.status(500).json({ error: 'Failed to save environment variable' });
    }
};

// DELETE /api/env-vars/:id — delete an env var
const deleteEnvVar = async (req, res) => {
    try {
        const server = await getUserServer(req.session.userId);
        if (!server) return res.status(400).json({ error: 'No server found' });
        const result = await pool.query(
            'DELETE FROM environment_variables WHERE id = $1 AND server_id = $2 RETURNING id',
            [req.params.id, server.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ success: true });
    } catch (err) {
        console.error('[ENV] deleteEnvVar error:', err);
        res.status(500).json({ error: 'Failed to delete environment variable' });
    }
};

/**
 * GET /api/deployment-status/:id
 * Polling endpoint — returns status/output for a single deployment.
 * Returns 403 (not 404) on ownership failure to prevent enumeration.
 */
const getDeploymentStatus = async (req, res) => {
  try {
    const deploymentId = parseInt(req.params.id);
    const result = await pool.query(
      'SELECT status, output, deployed_at, ai_diagnosis FROM deployments WHERE id = $1 AND user_id = $2',
      [deploymentId, req.session.userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching deployment status:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── VPS Metrics ───────────────────────────────────────────────────────────────
// 30-second in-memory cache per droplet — avoids hammering the DO API.
const _metricsCache = new Map();

const getMetrics = async (req, res) => {
  try {
    const userId = req.session.userId;

    // Security: only the authenticated user's own running server
    const result = await pool.query(
      `SELECT droplet_id, created_at
         FROM servers
        WHERE user_id = $1 AND status = 'running'
        ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    const row = result.rows[0];
    if (!row?.droplet_id) return res.json({ available: false });

    const { droplet_id, created_at } = row;
    const cacheKey = `m_${droplet_id}`;
    const cached = _metricsCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < 30_000) return res.json(cached.data);

    const now   = Math.floor(Date.now() / 1000);
    const start = now - 600; // last 10 minutes — enough for a stable reading
    const headers = { Authorization: `Bearer ${process.env.DIGITAL_OCEAN_TOKEN}` };

    // Fire all three requests in parallel; if one fails it returns null
    const hit = (type) =>
      require('axios').get(
        `https://api.digitalocean.com/v2/monitoring/metrics/droplet/${type}`,
        { params: { host_id: String(droplet_id), start, end: now }, headers, timeout: 8000 }
      ).catch(() => null);

    const [cpuRes, memRes, diskRes] = await Promise.all([
      hit('cpu'),
      hit('memory_utilization_percent'),
      hit('filesystem_utilization'),
    ]);

    // Pick the last data-point from a time-series result
    const latest = (res) => {
      const values = res?.data?.data?.result?.[0]?.values;
      if (!values?.length) return null;
      const v = parseFloat(values[values.length - 1][1]);
      return isNaN(v) ? null : Math.round(v);
    };

    // Uptime is simple: VPS servers are always-on, so time since provisioning is accurate
    const ms   = Date.now() - new Date(created_at).getTime();
    const days = Math.floor(ms / 86_400_000);
    const hrs  = Math.floor((ms % 86_400_000) / 3_600_000);
    const uptime = days > 0 ? `${days}d ${hrs}h` : `${hrs}h`;

    const data = {
      available: true,
      cpu:    latest(cpuRes),
      memory: latest(memRes),
      disk:   latest(diskRes),
      uptime,
    };

    _metricsCache.set(cacheKey, { data, ts: Date.now() });
    res.json(data);
  } catch (err) {
    console.error('[metrics]', err.message);
    res.json({ available: false });
  }
};

module.exports = { showDashboard: exports.showDashboard, getDashboardData, submitSupportTicket, changePassword, applyUpdates, getCredentials, getEnvVars, createEnvVar, deleteEnvVar, getDeploymentStatus, getMetrics };

/**
 * Dashboard Template Builder - Tech-View Design
 * Advanced glassmorphic dashboard with resource monitoring
 * Uses centralized layout helpers for consistency
 */
const buildDashboardTemplate = (data) => {
  // Layout options for the dashboard wrapper
  const layoutOptions = {
    userEmail: data.userEmail || 'User',
    plan: data.plan || 'basic',
    navItems: DASHBOARD_NAV_ITEMS,
    pageTitle: 'Overview'
  };
  
  return `
${getDashboardLayoutStart(layoutOptions)}

    ${!data.emailConfirmed ? `
    <!-- Email Verification Top Bar -->
    <div class="bg-gradient-to-r from-yellow-600 to-orange-500 border-b border-yellow-700 shadow-lg rounded-lg mb-6">
      <div class="px-4 py-3">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
            </svg>
            <p class="text-white text-sm font-medium">
              <span class="font-bold">Verify your email</span> · Code sent to ${data.userEmail || 'your email'}
            </p>
          </div>
          <form id="verifyForm" action="/verify-email" method="POST" class="flex items-center gap-2">
            <input type="text" name="code" maxlength="6" pattern="[0-9]{6}" required
              placeholder="000000"
              class="w-24 px-3 py-1.5 bg-white bg-opacity-20 backdrop-blur border border-white border-opacity-30 rounded text-white font-mono text-center text-sm tracking-wider placeholder-white placeholder-opacity-50 focus:bg-opacity-30 focus:border-white focus:outline-none">
            <button type="submit" class="px-4 py-1.5 bg-white text-orange-600 font-bold text-sm rounded hover:bg-opacity-90 transition-colors whitespace-nowrap">
              Verify
            </button>
            <button type="button" id="resendCodeBtn" class="text-white hover:text-yellow-100 text-xs underline whitespace-nowrap">
              Resend
            </button>
          </form>
        </div>
      </div>
    </div>
    <script nonce="${getNonce()}">
      document.getElementById('resendCodeBtn')?.addEventListener('click', async function() {
        this.textContent = 'Sending...';
        this.disabled = true;
        try {
          const res = await fetch('/resend-code', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
          const data = await res.json();
          if (data.success) {
            this.textContent = 'Sent!';
            setTimeout(() => { this.textContent = 'Resend'; this.disabled = false; }, 3000);
          } else {
            this.textContent = 'Failed';
            this.disabled = false;
          }
        } catch (err) {
          this.textContent = 'Error';
          this.disabled = false;
        }
      });
    </script>
    ` : ''}


    <!-- Alerts -->
    ${data.flashSuccess ? `<div class="bg-green-500/10 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg mb-6 flex items-center gap-3 text-sm"><svg class="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg><span class="flex-1">${data.flashSuccess}</span><button onclick="this.parentElement.remove()" class="text-green-300 hover:text-green-100 font-bold text-xl">&times;</button></div>` : ''}
    ${data.flashError ? `<div class="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6 flex items-center gap-3 text-sm"><svg class="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg><span class="flex-1">${data.flashError}</span><button onclick="this.parentElement.remove()" class="text-red-300 hover:text-red-100 font-bold text-xl">&times;</button></div>` : ''}
    
    ${data.hasServer && !data.dismissedNextSteps ? `
    <!-- Next Steps Banner -->
    <div id="nextStepsBanner" class="bg-gradient-to-r from-brand to-cyan-600 rounded-lg p-4 md:p-6 mb-6 border border-brand shadow-lg" data-csrf="${data.csrfToken}">
        <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
                <h3 class="text-lg font-bold text-white mb-3">🚀 Server Online - Ready to Deploy!</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div class="bg-black bg-opacity-30 rounded-lg p-3 border border-white border-opacity-10">
                        <div class="text-white font-bold mb-1 text-sm">1. Deploy with Git</div>
                        <p class="text-white text-opacity-70 text-xs">Paste your repo URL below for automatic setup</p>
                    </div>
                    <div class="bg-black bg-opacity-30 rounded-lg p-3 border border-white border-opacity-10">
                        <div class="text-white font-bold mb-1 text-sm">2. Connect via SSH</div>
                        <p class="text-white text-opacity-70 text-xs">See SSH Access section for credentials</p>
                    </div>
                    <div class="bg-black bg-opacity-30 rounded-lg p-3 border border-white border-opacity-10">
                        <div class="text-white font-bold mb-1 text-sm">3. Add Domain + SSL</div>
                        <p class="text-white text-opacity-70 text-xs">Point DNS → one-click free SSL certificate</p>
                    </div>
                </div>
            </div>
            <button onclick="dismissNextSteps()" class="text-white hover:text-white hover:bg-black hover:bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold shrink-0 transition-colors" title="Dismiss">&times;</button>
        </div>
    </div>
    ` : ''}

    <!-- Content Sections -->
    <div class="sections-container">
        <!-- OVERVIEW SECTION -->
        <section id="section-overview" class="dash-section active">
        ${data.wpSite ? `

        <!-- ── WordPress Site Card ────────────────────────────────────────── -->
        ${(() => {
          const ws = data.wpSite;
          const isLive         = ws.status === 'live';
          const isError        = ws.status === 'error';
          const inProgress     = !isLive && !isError;
          const step1Done      = ws.status !== 'provisioning';
          const step2Done      = ws.status === 'configuring' || ws.status === 'live';
          const step3Done      = ws.status === 'live';
          const siteUrl        = ws.domain
            ? 'https://' + escapeHtml(ws.domain)
            : 'http://' + escapeHtml(data.ipAddress || '');
          const statusColour   = isLive ? 'text-[var(--dash-success)]' : isError ? 'text-[var(--dash-danger)]' : 'text-[var(--dash-warning)]';
          const statusLabel    = isLive ? 'Live' : isError ? 'Error' : 'Setting up';

          return `
        <div class="dash-card" id="wp-site-card" data-wp-site-id="${ws.id}" data-wp-status="${escapeHtml(ws.status)}">
            <div class="dash-card-header">
                <div class="flex items-center gap-3">
                    <!-- WordPress logo mark -->
                    <svg class="w-5 h-5 text-[#21759b] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 1.543c2.34 0 4.484.849 6.141 2.247L4.79 18.141A8.432 8.432 0 013.543 12c0-4.666 3.791-8.457 8.457-8.457zm0 16.914a8.432 8.432 0 01-5.34-1.898l3.516-9.623.007-.017 3.613 9.904A8.43 8.43 0 0112 20.457zm3.507-.85l-2.61-7.143 2.553-7.387A8.46 8.46 0 0120.457 12a8.432 8.432 0 01-4.95 7.607z"/>
                    </svg>
                    <span class="text-sm font-medium ${statusColour}" id="wp-status-label">${statusLabel}</span>
                </div>
                <h3 class="dash-card-title">${escapeHtml(ws.site_title || 'WordPress Site')}</h3>
            </div>

            ${inProgress ? `
            <!-- ── In-progress: step list + status message ── -->
            <div class="space-y-3 py-4">
                <div id="wp-step-1" class="flex items-center gap-3 text-sm ${step1Done ? 'text-[var(--dash-success)]' : 'text-[var(--dash-text-muted)]'}">
                    ${step1Done
                      ? '<svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>'
                      : '<svg class="w-4 h-4 flex-shrink-0 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>'}
                    <span>Provisioning server</span>
                </div>
                <div id="wp-step-2" class="flex items-center gap-3 text-sm ${step2Done ? 'text-[var(--dash-success)]' : step1Done ? 'text-[var(--dash-text-muted)]' : 'text-[var(--dash-text-muted)] opacity-40'}">
                    ${step2Done
                      ? '<svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>'
                      : step1Done
                        ? '<svg class="w-4 h-4 flex-shrink-0 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>'
                        : '<span class="w-4 h-4 flex-shrink-0 rounded-full border border-current inline-block"></span>'}
                    <span>Installing WordPress</span>
                </div>
                <div id="wp-step-3" class="flex items-center gap-3 text-sm ${step3Done ? 'text-[var(--dash-success)]' : step2Done ? 'text-[var(--dash-text-muted)]' : 'text-[var(--dash-text-muted)] opacity-40'}">
                    ${step3Done
                      ? '<svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>'
                      : step2Done
                        ? '<svg class="w-4 h-4 flex-shrink-0 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>'
                        : '<span class="w-4 h-4 flex-shrink-0 rounded-full border border-current inline-block"></span>'}
                    <span>Configuring Nginx &amp; DNS</span>
                </div>
            </div>
            ${ws.status_message ? `<p id="wp-status-msg" class="text-xs text-[var(--dash-text-muted)] mt-2">${escapeHtml(ws.status_message)}</p>` : `<p id="wp-status-msg" class="text-xs text-[var(--dash-text-muted)] mt-2">This usually takes 5-10 minutes.</p>`}
            ` : isError ? `
            <!-- ── Error state ── -->
            <div class="py-4">
                <p class="text-sm text-[var(--dash-danger)] mb-2">${escapeHtml(ws.status_message || 'Provisioning failed.')}</p>
                <p class="text-xs text-[var(--dash-text-muted)]">Please <a href="mailto:support@cloudedbasement.ca" class="underline hover:text-[var(--dash-text-primary)]">contact support</a> and include your server ID: <code class="text-[var(--dash-accent)]">${data.serverId}</code></p>
            </div>
            ` : `
            <!-- ── Live state ── -->
            <div class="space-y-0 mb-6">
                <div class="dash-data-row">
                    <span class="dash-data-label">Site URL</span>
                    <a href="${siteUrl}" target="_blank" rel="noopener noreferrer" class="dash-data-value text-[var(--dash-accent)] hover:underline truncate max-w-[200px]">${siteUrl}</a>
                </div>
                <div class="dash-data-row">
                    <span class="dash-data-label">wp-admin</span>
                    <a href="${siteUrl}/wp-admin" target="_blank" rel="noopener noreferrer" class="dash-data-value text-[var(--dash-text-secondary)] hover:text-[var(--dash-accent)] text-sm">${siteUrl}/wp-admin</a>
                </div>
                <div class="dash-data-row">
                    <span class="dash-data-label">Admin user</span>
                    <span class="dash-data-value font-mono text-sm">${escapeHtml(ws.admin_user || 'wpadmin')}</span>
                </div>
                <div class="dash-data-row">
                    <span class="dash-data-label">Admin email</span>
                    <span class="dash-data-value text-sm">${escapeHtml(ws.admin_email || '')}</span>
                </div>
                <div class="dash-data-row">
                    <span class="dash-data-label">IPv4</span>
                    <span class="dash-data-value text-[var(--dash-accent)]">${escapeHtml(data.ipAddress)}</span>
                </div>
                <div class="dash-data-row">
                    <span class="dash-data-label">Plan</span>
                    <span class="dash-data-value">${escapeHtml(data.plan.toUpperCase())} WordPress</span>
                </div>
            </div>
            <!-- Credentials actions -->
            <div class="flex flex-col sm:flex-row gap-3">
                <button type="button" id="wp-copy-pass" data-site-id="${ws.id}" class="dash-btn dash-btn-secondary flex-1">
                    Copy Admin Password
                </button>
                <form id="terminate-form" action="/delete-server" method="POST" class="sm:flex-initial">
                    <input type="hidden" name="_csrf" value="${data.csrfToken}">
                    <button type="button" onclick="openTerminateModal()" class="dash-btn dash-btn-danger w-full sm:w-auto">Cancel Plan</button>
                </form>
            </div>
            `}
        </div>

        ${inProgress ? `
        <script nonce="${getNonce()}">
        (function () {
          var card = document.getElementById('wp-site-card');
          if (!card) return;
          var siteId = card.dataset.wpSiteId;
          if (!siteId) return;

          var intervalId = setInterval(function () {
            fetch('/wordpress/status/' + siteId, {
              credentials: 'same-origin',
              headers: { 'Accept': 'application/json' }
            })
              .then(function (r) { return r.json(); })
              .then(function (d) {
                if (d.wpStatus === 'live' || d.wpStatus === 'error') {
                  clearInterval(intervalId);
                  location.reload();
                  return;
                }
                // Update status message
                var msgEl = document.getElementById('wp-status-msg');
                if (msgEl && d.statusMessage) {
                  msgEl.textContent = d.statusMessage;
                }
                // Update step indicators
                var s = d.wpStatus;
                var step1Done = s !== 'provisioning';
                var step2Done = s === 'configuring' || s === 'live';
                var checkSvg  = '<svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>';
                var spinSvg   = '<svg class="w-4 h-4 flex-shrink-0 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>';
                var dotSvg    = '<span class="w-4 h-4 flex-shrink-0 rounded-full border border-current inline-block"></span>';
                function setStep(id, done, active) {
                  var el = document.getElementById(id);
                  if (!el) return;
                  var icon = done ? checkSvg : active ? spinSvg : dotSvg;
                  el.className = 'flex items-center gap-3 text-sm ' + (done ? 'text-[var(--dash-success)]' : active ? 'text-[var(--dash-text-muted)]' : 'text-[var(--dash-text-muted)] opacity-40');
                  el.innerHTML = icon + '<span>' + el.querySelector('span').textContent + '</span>';
                }
                setStep('wp-step-1', step1Done, !step1Done);
                setStep('wp-step-2', step2Done, step1Done && !step2Done);
                setStep('wp-step-3', false,      step2Done);
              })
              .catch(function () { /* silent — retry next tick */ });
          }, 5000);
        })();
        </script>
        ` : isLive ? `
        <script nonce="${getNonce()}">
        document.getElementById('wp-copy-pass')?.addEventListener('click', function () {
          var btn = this;
          var siteId = btn.dataset.siteId;
          btn.textContent = 'Fetching\u2026';
          btn.disabled = true;
          fetch('/api/wordpress/credentials/' + siteId, { credentials: 'same-origin' })
            .then(function (r) { return r.json(); })
            .then(function (d) {
              if (d.adminPassword && navigator.clipboard) {
                navigator.clipboard.writeText(d.adminPassword)
                  .then(function () {
                    btn.textContent = 'Copied!';
                    setTimeout(function () { btn.textContent = 'Copy Admin Password'; btn.disabled = false; }, 2500);
                  })
                  .catch(function () { btn.textContent = 'Copy failed'; btn.disabled = false; });
              } else {
                btn.textContent = 'Unavailable';
                btn.disabled = false;
              }
            })
            .catch(function () { btn.textContent = 'Error'; btn.disabled = false; });
        });
        </script>
        ` : ''}
          `;
        })()}

        ` : (data.hasServer || data.isProvisioning) ? `
        <!-- ── Node.js Server Card (unchanged) ───────────────────────────── -->
        <div class="dash-card" data-server-status="${data.serverStatus}" ${data.isDemoProvisioning ? 'data-demo-provisioning="true"' : ''}>
            <div class="dash-card-header">
                <div class="flex items-center gap-3">
                    <span class="dash-status">
                        <span class="dash-status-dot ${data.serverStatus}"></span>
                        ${data.serverStatus === 'running' ? 'Online' : data.serverStatus === 'provisioning' ? 'Provisioning' : 'Offline'}
                    </span>
                </div>
                <h3 class="dash-card-title">${escapeHtml(data.serverName)}</h3>
            </div>

            ${data.isProvisioning && !data.hasServer ? `
            <!-- Provisioning State -->
            <div class="text-center py-8">
                <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--dash-accent)] bg-opacity-10 mb-4">
                    <svg class="animate-spin h-6 w-6 text-[var(--dash-accent)]" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
                <h3 class="text-lg font-semibold text-[var(--dash-text-primary)] mb-2">Setting up your server...</h3>
                <p class="text-sm text-[var(--dash-text-secondary)]">This usually takes 2-3 minutes. Page will refresh automatically.</p>
            </div>
            ` : `
            <!-- Server Details -->
            <div class="space-y-0 mb-8">
                <div class="dash-data-row">
                    <span class="dash-data-label">IPv4</span>
                    <span class="dash-data-value text-[var(--dash-accent)]">${escapeHtml(data.ipAddress)}</span>
                </div>
                ${data.ipv6Address ? `
                <div class="dash-data-row">
                    <span class="dash-data-label">IPv6</span>
                    <span class="dash-data-value text-[var(--dash-text-secondary)] text-xs">${escapeHtml(data.ipv6Address)}</span>
                </div>
                ` : ''}
                <div class="dash-data-row">
                    <span class="dash-data-label">Plan</span>
                    <span class="dash-data-value">${escapeHtml(data.plan.toUpperCase())}</span>
                </div>
                <div class="dash-data-row">
                    <span class="dash-data-label">Sites</span>
                    <span class="dash-data-value ${data.siteCount >= data.siteLimit ? 'text-[var(--dash-danger)]' : ''}">${data.siteCount} / ${data.siteLimit}</span>
                </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-col sm:flex-row gap-3">
                <form action="/server-action" method="POST" class="flex-1">
                    <input type="hidden" name="_csrf" value="${data.csrfToken}">
                    <input type="hidden" name="action" value="restart">
                    <button type="submit" class="dash-btn dash-btn-secondary w-full">Restart</button>
                </form>
                <form id="terminate-form" action="/delete-server" method="POST" class="sm:flex-initial">
                    <input type="hidden" name="_csrf" value="${data.csrfToken}">
                    <button type="button" onclick="openTerminateModal()" class="dash-btn dash-btn-danger w-full sm:w-auto">Cancel Plan</button>
                </form>
            </div>
            `}
        </div>

        ` : `
        <!-- ── No Server State ────────────────────────────────────────────── -->
        <div class="dash-card text-center py-12">
            <h3 class="text-lg font-semibold text-[var(--dash-text-secondary)] mb-2">No Server</h3>
            <p class="text-sm text-[var(--dash-text-muted)]">${data.hasPaid ? 'Waiting for server setup (contact support if delayed)' : data.trialAvailable ? 'Start your free trial below to get a server' : 'Purchase a plan to see your server details here'}</p>
        </div>

        ${data.hasPaid && !data.hasServer ? `
        <!-- WordPress creation option (shown alongside Node.js provisioning) -->
        <div class="dash-card mt-4">
            <div class="dash-card-header">
                <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-[#21759b]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 1.543c2.34 0 4.484.849 6.141 2.247L4.79 18.141A8.432 8.432 0 013.543 12c0-4.666 3.791-8.457 8.457-8.457zm0 16.914a8.432 8.432 0 01-5.34-1.898l3.516-9.623.007-.017 3.613 9.904A8.43 8.43 0 0112 20.457zm3.507-.85l-2.61-7.143 2.553-7.387A8.46 8.46 0 0120.457 12a8.432 8.432 0 01-4.95 7.607z"/>
                    </svg>
                    <h3 class="dash-card-title">Launch a WordPress Site</h3>
                </div>
            </div>
            <p class="text-sm text-[var(--dash-text-muted)] mb-5">Get a managed WordPress installation on a fresh VPS — MySQL, Nginx, wp-cli, and Certbot pre-configured.</p>
            <form id="wp-create-form" action="/wordpress/create" method="POST" class="space-y-4">
                <input type="hidden" name="_csrf" value="${data.csrfToken}">
                <!-- Plan -->
                <div>
                    <label class="block text-xs text-[var(--dash-text-secondary)] mb-1" for="wp-plan">Plan</label>
                    <select id="wp-plan" name="plan" required class="dash-input w-full">
                        <option value="basic">Basic — 1 vCPU / 1 GB RAM</option>
                        <option value="pro" selected>Pro — 2 vCPU / 2 GB RAM</option>
                        <option value="premium">Premium — 2 vCPU / 4 GB RAM</option>
                    </select>
                </div>
                <!-- Site title -->
                <div>
                    <label class="block text-xs text-[var(--dash-text-secondary)] mb-1" for="wp-title">Site title</label>
                    <input type="text" id="wp-title" name="siteTitle" required maxlength="100" placeholder="My Awesome Blog" class="dash-input w-full">
                </div>
                <!-- Admin email -->
                <div>
                    <label class="block text-xs text-[var(--dash-text-secondary)] mb-1" for="wp-email">Admin email</label>
                    <input type="email" id="wp-email" name="adminEmail" required placeholder="you@example.com" class="dash-input w-full">
                </div>
                <button type="submit" class="dash-btn dash-btn-primary w-full">Create WordPress Site</button>
                <p class="text-xs text-[var(--dash-text-muted)] text-center">Provisioning takes 5-10 minutes. Credentials are generated and encrypted automatically.</p>
            </form>
        </div>
        <script nonce="${getNonce()}">
        document.getElementById('wp-create-form')?.addEventListener('submit', function (e) {
          var btn = this.querySelector('button[type="submit"]');
          if (btn) { btn.disabled = true; btn.textContent = 'Launching\u2026'; }
        });
        </script>
        ` : ''}
        `}
        </section>


        <!-- SITES SECTION (Domains + SSL) -->
        <section id="section-sites" class="dash-section">
        <div class="dash-card">
            <div class="dash-card-header">
                <h3 class="dash-card-title">Your Sites</h3>
            </div>
            ${data.domains.length > 0 ? `
            <div class="space-y-3 mb-6">
                ${data.domains.map(d => `
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg" style="background: var(--dash-bg)">
                    <div class="flex items-center gap-3 min-w-0">
                        <span class="${d.ssl_enabled ? 'text-green-400' : 'text-yellow-400'} flex-shrink-0">${d.ssl_enabled ? '🔒' : '⚠️'}</span>
                        <div class="min-w-0">
                            <a href="${d.ssl_enabled ? 'https' : 'http'}://${d.domain}" target="_blank" class="text-sm font-medium text-[var(--dash-text-primary)] hover:text-[var(--dash-accent)] block truncate">${escapeHtml(d.domain)}</a>
                            <p class="text-xs text-[var(--dash-text-muted)]">${d.ssl_enabled ? 'SSL active' : 'Waiting for SSL'}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                        ${!d.ssl_enabled && data.hasServer ? `
                        <form action="/enable-ssl" method="POST">
                            <input type="hidden" name="_csrf" value="${data.csrfToken}">
                            <input type="hidden" name="domain" value="${escapeHtml(d.domain)}">
                            <button type="submit" class="dash-btn dash-btn-secondary text-xs">Enable SSL</button>
                        </form>
                        ` : ''}
                        <form action="/delete-domain" method="POST" onsubmit="return confirm('Remove this domain?')">
                            <input type="hidden" name="_csrf" value="${data.csrfToken}">
                            <input type="hidden" name="domain_id" value="${d.id}">
                            <button type="submit" class="dash-btn dash-btn-danger text-xs">Remove</button>
                        </form>
                    </div>
                </div>
                `).join('')}
            </div>
            ` : `
            <div class="text-center py-8 text-[var(--dash-text-muted)]">
                <p class="text-sm">No domains configured yet</p>
            </div>
            `}
            
            ${data.hasServer ? `
            <form action="/add-domain" method="POST" class="pt-4" style="border-top: 1px solid var(--dash-card-border)" ${data.isDemoMode ? 'onsubmit="return addDemoDomain(event)"' : ''}>
                <input type="hidden" name="_csrf" value="${data.csrfToken}">
                <div class="flex flex-col sm:flex-row gap-3">
                    <input type="text" name="domain" placeholder="yourdomain.com" ${data.isDemoMode ? 'value="demo.cloudedbasement.ca"' : ''} required class="flex-1 dash-input">
                    <button type="submit" class="dash-btn dash-btn-primary w-full sm:w-auto">Add Domain</button>
                </div>
                <p class="text-xs text-[var(--dash-text-muted)] mt-3">${data.isDemoMode ? '<span class="text-yellow-400">(Demo mode)</span> ' : ''}Point your domain's A record to <code class="text-[var(--dash-accent)]">${escapeHtml(data.ipAddress)}</code> first.</p>
            </form>
            ` : ''}
        </div>
        </section>

        <!-- DEPLOY SECTION -->
        <section id="section-deploy" class="dash-section">
        <div class="dash-card">
            <div class="dash-card-header">
                <h3 class="dash-card-title">Deploy from Git</h3>
            </div>
            ${data.hasServer ? `
            <form action="/deploy" method="POST" ${data.isDemoMode ? 'onsubmit="return startDemoDeploy(event)"' : ''}>
                <input type="hidden" name="_csrf" value="${data.csrfToken}">
                <div class="flex flex-col sm:flex-row gap-3">
                    <input type="text" name="git_url" placeholder="https://github.com/username/repo.git" ${data.isDemoMode ? 'value="https://github.com/demo-user/new-project"' : ''} required class="flex-1 px-4 py-3 bg-[var(--dash-bg)] border border-[var(--dash-card-border)] rounded-lg text-white text-sm focus:border-[var(--dash-accent)] focus:outline-none">
                    <button type="submit" class="dash-btn dash-btn-primary w-full sm:w-auto">Deploy</button>
                </div>
                <p class="text-xs text-[var(--dash-text-muted)] mt-3">${data.isDemoMode ? '<span class="text-yellow-400">(Demo mode)</span> Click Deploy to see the animation' : 'Paste your GitHub repository URL to deploy automatically.'}</p>
            </form>
            
            <!-- Demo Deploy Progress (hidden by default) -->
            <div id="demo-deploy-progress" class="hidden mt-6 p-4 rounded-lg" style="background: var(--dash-bg); border: 1px solid var(--dash-card-border)">
                <div class="flex items-center gap-3 mb-3">
                    <div id="demo-deploy-spinner" class="w-5 h-5">
                        <svg class="animate-spin h-5 w-5 text-[var(--dash-accent)]" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <span id="demo-deploy-status" class="text-sm font-medium text-[var(--dash-text-primary)]">Cloning repository...</span>
                </div>
                <div id="demo-deploy-log" class="font-mono text-xs text-[var(--dash-text-muted)] space-y-1">
                    <p>> git clone https://github.com/demo-user/new-project</p>
                </div>
            </div>
            ` : data.trialAvailable ? `
            <div class="text-center py-6">
                <div class="text-4xl mb-4">🚀</div>
                <h3 class="text-lg font-semibold text-[var(--dash-text-primary)] mb-2">Start Your Free Trial</h3>
                <p class="text-sm text-[var(--dash-text-secondary)] mb-6">Get a fully-functional server for 3 days — no credit card required.</p>
                <form action="/start-trial" method="POST" class="inline-block" id="trialForm">
                    <input type="hidden" name="_csrf" value="${data.csrfToken}">
                    <button type="button" onclick="showTrialModal()" class="dash-btn dash-btn-primary">Start 3-Day Free Trial</button>
                </form>
                <p class="text-xs text-[var(--dash-text-muted)] mt-4">1 GB RAM · 1 vCPU · 25 GB SSD · Full SSH access</p>
            </div>
            
            <!-- Trial Confirmation Modal -->
            <div id="trialModal" class="fixed inset-0 bg-black bg-opacity-80 hidden items-center justify-center z-50">
                <div class="dash-card max-w-md mx-4 text-center">
                    <div class="text-5xl mb-4">🖥️</div>
                    <h3 class="text-xl font-semibold text-[var(--dash-text-primary)] mb-3">Create your server</h3>
                    <p class="text-sm text-[var(--dash-text-secondary)] mb-6">This will provision a real Ubuntu server with full SSH access. Takes about 2-5 minutes.</p>
                    <div class="flex gap-3 justify-center">
                        <button onclick="hideTrialModal()" class="dash-btn dash-btn-secondary">Cancel</button>
                        <button onclick="submitTrial()" class="dash-btn dash-btn-primary">Proceed</button>
                    </div>
                </div>
            </div>
            
            <script nonce="${getNonce()}">
                function showTrialModal() {
                    document.getElementById('trialModal').classList.remove('hidden');
                    document.getElementById('trialModal').classList.add('flex');
                }
                function hideTrialModal() {
                    document.getElementById('trialModal').classList.add('hidden');
                    document.getElementById('trialModal').classList.remove('flex');
                }
                function submitTrial() {
                    document.getElementById('trialForm').submit();
                }
                document.getElementById('trialModal')?.addEventListener('click', function(e) {
                    if (e.target === this) hideTrialModal();
                });
            </script>
            <div class="mt-6 text-center">
                <span class="text-[var(--dash-text-muted)] text-sm">or</span>
                <a href="/pricing" class="text-[var(--dash-accent)] hover:underline text-sm ml-2">View paid plans →</a>
            </div>
            ` : `
            <div class="text-center py-6">
                <p class="text-[var(--dash-text-secondary)] mb-4">No active server. Purchase a plan to deploy applications.</p>
                <a href="/pricing" class="dash-btn dash-btn-primary">View Plans</a>
            </div>
            `}
        </div>

        <!-- AUTO-DEPLOY SECTION -->
        ${data.hasServer ? `
        <div id="auto-deploy" class="dash-card scroll-mt-24">
            <div class="dash-card-header">
                <h3 class="dash-card-title">Auto-Deploy</h3>
                ${data.autoDeployEnabled ? 
                    `<span class="text-xs font-medium text-[var(--dash-success)]">● Enabled</span>` : 
                    `<span class="text-xs font-medium text-[var(--dash-text-muted)]">○ Disabled</span>`
                }
            </div>
            
            ${data.autoDeployEnabled ? `
            <p class="text-sm text-[var(--dash-text-secondary)] mb-4">Add this webhook to your GitHub repository:</p>
            <div class="space-y-4">
                <div>
                    <label class="block text-xs text-[var(--dash-text-muted)] mb-2">Webhook URL</label>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <code class="flex-1 px-3 py-2 bg-[var(--dash-bg)] border border-[var(--dash-card-border)] rounded-lg text-[var(--dash-accent)] text-xs font-mono overflow-x-auto break-all">https://cloudedbasement.ca/webhook/github/${data.serverId}</code>
                        <button onclick="navigator.clipboard.writeText('https://cloudedbasement.ca/webhook/github/${data.serverId}')" class="dash-btn dash-btn-primary px-3 w-full sm:w-auto">Copy</button>
                    </div>
                </div>
                <div>
                    <label class="block text-xs text-[var(--dash-text-muted)] mb-2">Secret</label>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <code id="webhookSecret" class="flex-1 px-3 py-2 bg-[var(--dash-bg)] border border-[var(--dash-card-border)] rounded-lg text-[var(--dash-accent)] text-xs font-mono">••••••••••••••••</code>
                        <div class="flex gap-2">
                            <button onclick="fetchWebhookSecret()" class="dash-btn dash-btn-secondary px-3 flex-1 sm:flex-initial">Show</button>
                            <button onclick="copyWebhookSecret()" class="dash-btn dash-btn-primary px-3 flex-1 sm:flex-initial">Copy</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="mt-6 p-4 bg-[var(--dash-bg)] border border-[var(--dash-card-border)] rounded-lg">
                <p class="text-xs text-[var(--dash-text-secondary)] font-medium mb-2">Setup Instructions:</p>
                <ol class="text-xs text-[var(--dash-text-muted)] space-y-1 list-decimal list-inside">
                    <li>GitHub repo → Settings → Webhooks → Add webhook</li>
                    <li>Paste the Webhook URL</li>
                    <li>Content type: <code class="text-[var(--dash-accent)]">application/json</code></li>
                    <li>Paste the Secret</li>
                    <li>Select "Just the push event"</li>
                </ol>
            </div>
            <form action="/disable-auto-deploy" method="POST" class="mt-6">
                <input type="hidden" name="_csrf" value="${data.csrfToken}">
                <button type="submit" class="dash-btn dash-btn-danger">Disable Auto-Deploy</button>
            </form>
            <script nonce="${getNonce()}">
                async function fetchWebhookSecret() {
                    const el = document.getElementById('webhookSecret');
                    if (!el.textContent.includes('•')) {
                        el.textContent = '••••••••••••••••';
                        return;
                    }
                    try {
                        const resp = await fetch('/api/credentials?type=webhook', { credentials: 'include' });
                        const data = await resp.json();
                        if (data.secret) {
                            el.textContent = data.secret;
                        } else {
                            el.textContent = 'Error';
                        }
                    } catch (e) {
                        el.textContent = 'Error';
                    }
                }
                async function copyWebhookSecret() {
                    try {
                        const resp = await fetch('/api/credentials?type=webhook', { credentials: 'include' });
                        const data = await resp.json();
                        if (data.secret) {
                            await navigator.clipboard.writeText(data.secret);
                        }
                    } catch (e) {}
                }
            </script>
            ` : `
            <p class="text-sm text-[var(--dash-text-secondary)] mb-4">Automatically redeploy when you push to main/master.</p>
            <ul class="text-xs text-[var(--dash-text-muted)] space-y-1 mb-6">
                <li>✓ No manual clicking "Redeploy"</li>
                <li>✓ Deploys in seconds after push</li>
                <li>✓ Secure webhook signature verification</li>
            </ul>
            
            <form action="/enable-auto-deploy" method="POST">
                <input type="hidden" name="_csrf" value="${data.csrfToken}">
                <button type="submit" class="dash-btn dash-btn-primary">Enable Auto-Deploy</button>
            </form>
            `}
        </div>
        ` : ''}
        
        <!-- Deployment History (within Deploy section) -->
        ${data.deployments.length > 0 ? `
        <div class="dash-card mt-6">
            <div class="dash-card-header">
                <h3 class="dash-card-title">Recent Deployments</h3>
            </div>
            <div class="space-y-3">
                ${data.deployments.slice(0, 5).map(dep => `
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg" style="background: var(--dash-bg)">
                    <div class="flex items-center gap-3 min-w-0">
                        <span class="${dep.status === 'success' ? 'text-green-400' : dep.status === 'failed' ? 'text-red-400' : 'text-yellow-400'} flex-shrink-0">
                            ${dep.status === 'success' ? '●' : dep.status === 'failed' ? '●' : '○'}
                        </span>
                        <div class="min-w-0">
                            <p class="text-sm text-[var(--dash-text-primary)] truncate">${escapeHtml(dep.git_url.split('/').pop() || 'repo')}</p>
                            <p class="text-xs text-[var(--dash-text-muted)]">${new Date(dep.deployed_at || dep.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                    ${dep.status === 'success' ? `
                    <form method="POST" action="/deploy" class="flex-shrink-0 self-end sm:self-center">
                        <input type="hidden" name="_csrf" value="${data.csrfToken}">
                        <input type="hidden" name="git_url" value="${escapeHtml(dep.git_url)}">
                        <button type="submit" class="dash-btn dash-btn-secondary text-xs">Redeploy</button>
                    </form>
                    ` : ''}
                </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        </section>

        <!-- DEV TOOLS SECTION -->
        <section id="section-dev-tools" class="dash-section">
        <!-- DEVELOPER TOOLS SECTION -->
        <div class="dash-card">
            <div class="dash-card-header">
                <h3 class="dash-card-title">Developer Tools</h3>
            </div>
            
            ${data.hasServer ? `
            <!-- SSH Access -->
            <div class="mb-8">
                <h5 class="text-sm font-semibold mb-4" style="color: var(--dash-text-primary)">SSH Access</h5>
                <div class="grid grid-cols-1 gap-4">
                    <div>
                        <label class="block text-xs mb-2" style="color: var(--dash-text-muted)">Username</label>
                        <div class="flex flex-col sm:flex-row gap-2">
                            <input type="password" id="sshUsername" value="••••••••" readonly data-credential="ssh" data-field="username" class="flex-1 px-3 py-2 rounded-lg text-white font-mono text-sm" style="background: var(--dash-bg); border: 1px solid var(--dash-card-border)">
                            <button onclick="fetchAndShowCredential('ssh', 'username', 'sshUsername', this)" class="dash-btn dash-btn-secondary text-xs w-full sm:w-auto">Show</button>
                        </div>
                    </div>
                    <div>
                        <label class="block text-xs mb-2" style="color: var(--dash-text-muted)">Password</label>
                        <div class="flex flex-col sm:flex-row gap-2">
                            <input type="password" id="sshPassword" value="••••••••" readonly data-credential="ssh" data-field="password" class="flex-1 px-3 py-2 rounded-lg text-white font-mono text-sm" style="background: var(--dash-bg); border: 1px solid var(--dash-card-border)">
                            <button onclick="fetchAndShowCredential('ssh', 'password', 'sshPassword', this)" class="dash-btn dash-btn-secondary text-xs w-full sm:w-auto">Show</button>
                        </div>
                    </div>
                    <div>
                        <label class="block text-xs mb-2" style="color: var(--dash-text-muted)">Connection Command</label>
                        <div class="flex flex-col sm:flex-row gap-2">
                            <input type="password" id="sshCommand" value="ssh ••••@••••" readonly data-credential="ssh" data-field="command" class="flex-1 px-3 py-2 rounded-lg text-white font-mono text-sm" style="background: var(--dash-bg); border: 1px solid var(--dash-card-border)">
                            <button onclick="fetchAndCopyCredential('ssh', 'command')" class="dash-btn dash-btn-primary text-xs w-full sm:w-auto">Copy</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Databases -->
            <div class="pt-6" style="border-top: 1px solid var(--dash-card-border)">
                <h5 class="text-sm font-semibold mb-4" style="color: var(--dash-text-primary)">Databases</h5>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- PostgreSQL -->
                <div class="p-4 rounded-lg" style="background: rgba(0,0,0,0.3); border: 1px solid var(--dash-card-border)">
                    <div class="flex items-center justify-between mb-3">
                        <p class="text-xs uppercase font-bold" style="color: var(--dash-text-secondary)">PostgreSQL</p>
                        ${data.postgresInstalled ? 
                          '<span class="px-2 py-1 text-xs font-bold uppercase rounded bg-green-900/50 text-green-400 flex items-center gap-1"><svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg> Installed</span>' : 
                          '<span class="px-2 py-1 text-xs font-bold uppercase rounded bg-yellow-900/50 text-yellow-400">Not Installed</span>'}
                    </div>
                    
                    ${data.postgresInstalled && data.postgresCredentials ? `
                    <!-- PostgreSQL Credentials -->
                    <div class="rounded-lg p-3 mb-4" style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3)">
                        <p class="text-green-400 text-xs font-bold mb-1">✓ PostgreSQL Ready</p>
                        <p class="text-xs leading-relaxed" style="color: var(--dash-text-secondary)">Click Show/Copy to reveal credentials (loaded securely on-demand).</p>
                    </div>
                    <div class="space-y-4">
                        <div>
                            <p class="text-xs mb-2" style="color: var(--dash-text-muted)">Connection String</p>
                            <div class="flex flex-col sm:flex-row gap-2">
                                <input type="password" readonly value="postgresql://••••:••••@••••:5432/••••" class="flex-1 text-white text-xs px-3 py-2 rounded-lg font-mono truncate" style="background: var(--dash-bg); border: 1px solid var(--dash-card-border)" id="postgres-connection-string" data-credential="postgres" data-field="connectionString">
                                <button onclick="fetchAndCopyCredential('postgres', 'connectionString')" class="dash-btn dash-btn-primary text-xs w-full sm:w-auto">Copy</button>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <p class="text-xs mb-2" style="color: var(--dash-text-muted)">Host</p>
                                <div class="flex gap-2">
                                    <input type="password" readonly value="••••••••" class="flex-1 text-white text-xs px-3 py-2 rounded-lg font-mono" style="background: var(--dash-bg); border: 1px solid var(--dash-card-border)" id="postgres-host" data-credential="postgres" data-field="host">
                                    <button onclick="fetchAndCopyCredential('postgres', 'host')" class="dash-btn dash-btn-secondary text-xs">Copy</button>
                                </div>
                            </div>
                            <div>
                                <p class="text-xs mb-2" style="color: var(--dash-text-muted)">Port</p>
                                <input type="text" readonly value="5432" class="w-full text-white text-xs px-3 py-2 rounded-lg font-mono" style="background: var(--dash-bg); border: 1px solid var(--dash-card-border)">
                            </div>
                        </div>
                        <div>
                            <p class="text-xs mb-2" style="color: var(--dash-text-muted)">Database</p>
                            <div class="flex flex-col sm:flex-row gap-2">
                                <input type="password" readonly value="••••••••" class="flex-1 text-white text-xs px-3 py-2 rounded-lg font-mono" style="background: var(--dash-bg); border: 1px solid var(--dash-card-border)" id="postgres-dbname" data-credential="postgres" data-field="database">
                                <button onclick="fetchAndCopyCredential('postgres', 'database')" class="dash-btn dash-btn-secondary text-xs w-full sm:w-auto">Copy</button>
                            </div>
                        </div>
                        <div>
                            <p class="text-xs mb-2" style="color: var(--dash-text-muted)">Username</p>
                            <div class="flex flex-col sm:flex-row gap-2">
                                <input type="password" readonly value="••••••••" class="flex-1 text-white text-xs px-3 py-2 rounded-lg font-mono" style="background: var(--dash-bg); border: 1px solid var(--dash-card-border)" id="postgres-user" data-credential="postgres" data-field="username">
                                <button onclick="fetchAndCopyCredential('postgres', 'username')" class="dash-btn dash-btn-secondary text-xs w-full sm:w-auto">Copy</button>
                            </div>
                        </div>
                        <div>
                            <p class="text-xs mb-2" style="color: var(--dash-text-muted)">Password</p>
                            <div class="flex flex-col sm:flex-row gap-2">
                                <input type="password" readonly value="••••••••" class="flex-1 text-white text-xs px-3 py-2 rounded-lg font-mono" style="background: var(--dash-bg); border: 1px solid var(--dash-card-border)" id="postgres-password" data-credential="postgres" data-field="password">
                                <div class="flex gap-2">
                                    <button onclick="fetchAndShowCredential('postgres', 'password', 'postgres-password', this)" class="dash-btn dash-btn-secondary text-xs flex-1 sm:flex-initial" id="postgres-password-toggle">Show</button>
                                    <button onclick="fetchAndCopyCredential('postgres', 'password')" class="dash-btn dash-btn-secondary text-xs flex-1 sm:flex-initial">Copy</button>
                                </div>
                            </div>
                        </div>
                        <details class="mt-4">
                            <summary class="text-xs cursor-pointer transition-colors" style="color: var(--dash-accent)">Show Code Examples</summary>
                            <div class="mt-3 p-4 rounded-lg" style="background: var(--dash-bg); border: 1px solid var(--dash-card-border)">
                                <p class="text-xs mb-3" style="color: var(--dash-text-primary)"><strong>Quick Start:</strong> Click Copy on Connection String above, then paste into your .env</p>
                                <p class="text-xs mb-2" style="color: var(--dash-text-muted)"><strong>Node.js:</strong> <code style="color: var(--dash-text-secondary)">npm install pg</code></p>
                                <pre class="text-xs p-3 rounded-lg overflow-x-auto mb-3 font-mono" style="background: rgba(0,0,0,0.4); color: var(--dash-text-secondary)"><code>const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL  // Paste connection string in .env
});</code></pre>
                                <p class="text-xs mb-2" style="color: var(--dash-text-muted)"><strong>Python:</strong> <code style="color: var(--dash-text-secondary)">pip install psycopg2-binary</code></p>
                                <pre class="text-xs p-3 rounded-lg overflow-x-auto font-mono" style="background: rgba(0,0,0,0.4); color: var(--dash-text-secondary)"><code>import os
import psycopg2
conn = psycopg2.connect(os.environ['DATABASE_URL'])</code></pre>
                            </div>
                        </details>
                    </div>
                    ` : `
                    <p class="text-sm mt-4 mb-4" style="color: var(--dash-text-muted)">Install PostgreSQL to view credentials.</p>
                    <form action="/setup-database" method="POST">
                        <input type="hidden" name="_csrf" value="${data.csrfToken}">
                        <input type="hidden" name="database_type" value="postgres">
                        <button type="submit" class="dash-btn dash-btn-primary w-full">Install PostgreSQL</button>
                    </form>
                    `}
                </div>
                
                <!-- MongoDB -->
                <div class="p-4 rounded-lg" style="background: rgba(0,0,0,0.3); border: 1px solid var(--dash-card-border)">
                    <div class="flex items-center justify-between mb-3">
                        <p class="text-xs uppercase font-bold" style="color: var(--dash-text-secondary)">MongoDB</p>
                        ${data.mongodbInstalled ? 
                          '<span class="px-2 py-1 text-xs font-bold uppercase rounded bg-green-900/50 text-green-400 flex items-center gap-1"><svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg> Installed</span>' : 
                          '<span class="px-2 py-1 text-xs font-bold uppercase rounded bg-yellow-900/50 text-yellow-400">Not Installed</span>'}
                    </div>
                    
                    ${data.mongodbInstalled && data.mongodbCredentials ? `
                    <!-- MongoDB Credentials -->
                    <div class="rounded-lg p-3 mb-4" style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3)">
                        <p class="text-green-400 text-xs font-bold mb-1">✓ MongoDB Ready</p>
                        <p class="text-xs leading-relaxed" style="color: var(--dash-text-secondary)">Click Show/Copy to reveal credentials (loaded securely on-demand).</p>
                    </div>
                    <div class="space-y-4">
                        <div>
                            <p class="text-xs mb-2" style="color: var(--dash-text-muted)">Connection String</p>
                            <div class="flex flex-col sm:flex-row gap-2">
                                <input type="password" readonly value="mongodb://••••:••••@••••:27017/••••" class="flex-1 text-white text-xs px-3 py-2 rounded-lg font-mono truncate" style="background: var(--dash-bg); border: 1px solid var(--dash-card-border)" id="mongodb-connection-string" data-credential="mongodb" data-field="connectionString">
                                <button onclick="fetchAndCopyCredential('mongodb', 'connectionString')" class="dash-btn dash-btn-primary text-xs w-full sm:w-auto">Copy</button>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <p class="text-xs mb-2" style="color: var(--dash-text-muted)">Host</p>
                                <div class="flex gap-2">
                                    <input type="password" readonly value="••••••••" class="flex-1 text-white text-xs px-3 py-2 rounded-lg font-mono" style="background: var(--dash-bg); border: 1px solid var(--dash-card-border)" id="mongodb-host" data-credential="mongodb" data-field="host">
                                    <button onclick="fetchAndCopyCredential('mongodb', 'host')" class="dash-btn dash-btn-secondary text-xs">Copy</button>
                                </div>
                            </div>
                            <div>
                                <p class="text-xs mb-2" style="color: var(--dash-text-muted)">Port</p>
                                <input type="text" readonly value="27017" class="w-full text-white text-xs px-3 py-2 rounded-lg font-mono" style="background: var(--dash-bg); border: 1px solid var(--dash-card-border)">
                            </div>
                        </div>
                        <div>
                            <p class="text-xs mb-2" style="color: var(--dash-text-muted)">Database</p>
                            <div class="flex flex-col sm:flex-row gap-2">
                                <input type="password" readonly value="••••••••" class="flex-1 text-white text-xs px-3 py-2 rounded-lg font-mono" style="background: var(--dash-bg); border: 1px solid var(--dash-card-border)" id="mongodb-dbname" data-credential="mongodb" data-field="database">
                                <button onclick="fetchAndCopyCredential('mongodb', 'database')" class="dash-btn dash-btn-secondary text-xs w-full sm:w-auto">Copy</button>
                            </div>
                        </div>
                        <div>
                            <p class="text-xs mb-2" style="color: var(--dash-text-muted)">Username</p>
                            <div class="flex flex-col sm:flex-row gap-2">
                                <input type="password" readonly value="••••••••" class="flex-1 text-white text-xs px-3 py-2 rounded-lg font-mono" style="background: var(--dash-bg); border: 1px solid var(--dash-card-border)" id="mongodb-user" data-credential="mongodb" data-field="username">
                                <button onclick="fetchAndCopyCredential('mongodb', 'username')" class="dash-btn dash-btn-secondary text-xs w-full sm:w-auto">Copy</button>
                            </div>
                        </div>
                        <div>
                            <p class="text-xs mb-2" style="color: var(--dash-text-muted)">Password</p>
                            <div class="flex flex-col sm:flex-row gap-2">
                                <input type="password" readonly value="••••••••" class="flex-1 text-white text-xs px-3 py-2 rounded-lg font-mono" style="background: var(--dash-bg); border: 1px solid var(--dash-card-border)" id="mongodb-password" data-credential="mongodb" data-field="password">
                                <div class="flex gap-2">
                                    <button onclick="fetchAndShowCredential('mongodb', 'password', 'mongodb-password', this)" class="dash-btn dash-btn-secondary text-xs flex-1 sm:flex-initial" id="mongodb-password-toggle">Show</button>
                                    <button onclick="fetchAndCopyCredential('mongodb', 'password')" class="dash-btn dash-btn-secondary text-xs flex-1 sm:flex-initial">Copy</button>
                                </div>
                            </div>
                        </div>
                        <details class="mt-4">
                            <summary class="text-xs cursor-pointer transition-colors" style="color: var(--dash-accent)">Show Code Examples</summary>
                            <div class="mt-3 p-4 rounded-lg" style="background: var(--dash-bg); border: 1px solid var(--dash-card-border)">
                                <p class="text-xs mb-3" style="color: var(--dash-text-primary)"><strong>Quick Start:</strong> Click Copy on Connection String above, then paste into your .env</p>
                                <p class="text-xs mb-2" style="color: var(--dash-text-muted)"><strong>Node.js:</strong> <code style="color: var(--dash-text-secondary)">npm install mongodb</code></p>
                                <pre class="text-xs p-3 rounded-lg overflow-x-auto mb-3 font-mono" style="background: rgba(0,0,0,0.4); color: var(--dash-text-secondary)"><code>const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URL);  // Paste connection string in .env
await client.connect();</code></pre>
                                <p class="text-xs mb-2" style="color: var(--dash-text-muted)"><strong>Python:</strong> <code style="color: var(--dash-text-secondary)">pip install pymongo</code></p>
                                <pre class="text-xs p-3 rounded-lg overflow-x-auto font-mono" style="background: rgba(0,0,0,0.4); color: var(--dash-text-secondary)"><code>import os
from pymongo import MongoClient
client = MongoClient(os.environ['MONGODB_URL'])</code></pre>
                            </div>
                        </details>
                    </div>
                    ` : `
                    <p class="text-sm mt-4 mb-4" style="color: var(--dash-text-muted)">Install MongoDB to view credentials.</p>
                    <form action="/setup-database" method="POST">
                        <input type="hidden" name="_csrf" value="${data.csrfToken}">
                        <input type="hidden" name="database_type" value="mongodb">
                        <button type="submit" class="dash-btn dash-btn-primary w-full">Install MongoDB</button>
                    </form>
                    `}
                </div>
            </div>
            ` : '<p class="text-sm" style="color: var(--dash-text-muted)">Provision a server to enable databases.</p>'}
            </div>
        </div>
        </section>

        <!-- SETTINGS SECTION -->
        <section id="section-settings" class="dash-section">
        
        <!-- Server Updates Card -->
        ${data.hasServer ? `
        <div class="dash-card mb-6">
            <div class="dash-card-header">
                <h4 class="dash-card-title">Server Updates</h4>
                ${data.pendingUpdates.length > 0 ? `
                <span class="px-2 py-1 text-xs font-bold uppercase rounded bg-orange-900/50 text-orange-400">${data.pendingUpdates.length} available</span>
                ` : `
                <span class="px-2 py-1 text-xs font-bold uppercase rounded bg-green-900/50 text-green-400">✓ Up to date</span>
                `}
            </div>
            
            ${data.pendingUpdates.length > 0 ? `
            <div class="space-y-3 mb-4">
                <p class="text-xs text-gray-500 mb-2">Review what will be installed before applying:</p>
                ${data.pendingUpdates.map(update => `
                <div class="bg-black bg-opacity-30 border border-gray-700/50 rounded-lg p-4">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <span class="text-white font-medium">${escapeHtml(update.title)}</span>
                            ${update.is_critical ? '<span class="ml-2 text-xs text-red-400">⚠️ Critical</span>' : ''}
                        </div>
                        <span class="inline-flex items-center gap-1.5 text-xs font-medium ${
                          update.type === 'security' ? 'text-red-400' :
                          update.type === 'config' ? 'text-yellow-400' :
                          update.type === 'feature' ? 'text-blue-400' : 'text-purple-400'
                        }">
                            <span class="w-2 h-2 rounded-full ${
                              update.type === 'security' ? 'bg-red-500' :
                              update.type === 'config' ? 'bg-yellow-500' :
                              update.type === 'feature' ? 'bg-blue-500' : 'bg-purple-500'
                            }"></span>
                            ${update.type}
                        </span>
                    </div>
                    ${update.description ? `<p class="text-gray-400 text-sm mb-3">${escapeHtml(update.description)}</p>` : ''}
                    ${update.version ? `<p class="text-gray-500 text-xs">Version: ${escapeHtml(update.version)}</p>` : ''}
                </div>
                `).join('')}
            </div>
            
            <form method="POST" action="/apply-updates" class="flex justify-end">
                <input type="hidden" name="_csrf" value="${data.csrfToken}">
                <button type="submit" class="dash-btn dash-btn-primary" onclick="return confirm('Apply ${data.pendingUpdates.length} update(s) to your server?')">
                    Apply All Updates
                </button>
            </form>
            ` : `
            <p class="text-sm" style="color: var(--dash-text-muted)">Your server is running the latest patches and configurations.</p>
            `}
            
            <!-- Update History (Transparency) -->
            ${data.updateHistory && data.updateHistory.length > 0 ? `
            <div class="mt-6 pt-4 border-t border-gray-700">
                <h5 class="text-xs font-bold uppercase text-gray-400 mb-3">Update History</h5>
                <div class="space-y-2 max-h-48 overflow-y-auto">
                    ${data.updateHistory.slice(0, 10).map(log => `
                    <div class="flex items-center justify-between text-xs py-2 border-b border-gray-800">
                        <div>
                            <span class="text-white">${escapeHtml(log.title)}</span>
                            ${log.version ? `<span class="text-gray-500 ml-1">v${escapeHtml(log.version)}</span>` : ''}
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="${log.status === 'success' ? 'text-green-400' : 'text-red-400'}">
                                ${log.status === 'success' ? '✓' : '✗'} ${escapeHtml(log.status)}
                            </span>
                            <span class="text-gray-500">${new Date(log.applied_at).toLocaleDateString()}</span>
                            <span class="text-gray-600">${log.trigger_type === 'customer' ? 'by you' : 'auto'}</span>
                        </div>
                    </div>
                    `).join('')}
                </div>
                ${data.updateHistory.length > 10 ? `<p class="text-xs text-gray-500 mt-2">+ ${data.updateHistory.length - 10} more</p>` : ''}
            </div>
            ` : ''}
        </div>
        ` : ''}
        
        <!-- Support Card -->
        <div class="dash-card mb-6">
            <div class="dash-card-header">
                <h4 class="dash-card-title">Support</h4>
                <button onclick="openSubmitTicketModal()" class="dash-btn dash-btn-primary text-xs">+ New Ticket</button>
            </div>
            ${data.tickets.length > 0 ? `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${data.tickets.slice(0, 4).map(ticket => `
                    <div class="bg-black bg-opacity-30 border border-gray-700/50 rounded-lg p-4">
                        <div class="flex justify-between items-center mb-3">
                            <span class="text-xs" style="color: var(--dash-text-muted)">Ticket #${ticket.id}</span>
                            <span class="px-2 py-1 text-xs font-bold uppercase rounded ${ticket.status === 'resolved' ? 'bg-green-900/50 text-green-400' : 'bg-blue-900/50 text-blue-400'}">
                                ${escapeHtml(ticket.status)}
                            </span>
                        </div>
                        <p class="text-sm text-white font-medium mb-3">${escapeHtml(ticket.subject)}</p>
                        <span class="px-2 py-1 text-xs font-bold uppercase rounded ${ticket.priority === 'urgent' ? 'bg-red-900/50 text-red-400' : ticket.priority === 'high' ? 'bg-yellow-900/50 text-yellow-400' : 'bg-gray-700/50 text-gray-400'}">
                            ${escapeHtml(ticket.priority)}
                        </span>
                    </div>
                    `).join('')}
                </div>
            ` : '<p style="color: var(--dash-text-muted)" class="text-sm">No support tickets. Click "New Ticket" to create one.</p>'}
        </div>

        <!-- Account Settings Card -->
        <div class="dash-card">
            <div class="dash-card-header">
                <h3 class="dash-card-title">Account</h3>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                    <p class="text-xs uppercase font-semibold mb-2" style="color: var(--dash-text-muted)">Email</p>
                    <p class="px-4 py-3 rounded-lg text-white text-sm font-mono" style="background: rgba(0,0,0,0.3); border: 1px solid var(--dash-card-border)">${data.userEmail}</p>
                </div>
                <div>
                    <p class="text-xs uppercase font-semibold mb-2" style="color: var(--dash-text-muted)">Role</p>
                    <p class="px-4 py-3 rounded-lg text-white text-sm" style="background: rgba(0,0,0,0.3); border: 1px solid var(--dash-card-border)">${data.userRole === 'admin' ? 'Administrator' : 'User'}</p>
                </div>
            </div>
            
            <div class="pt-6 mb-8" style="border-top: 1px solid var(--dash-card-border)">
                <h5 class="text-xs font-bold uppercase tracking-wide mb-4" style="color: var(--dash-accent)">Change Password</h5>
                <form onsubmit="changePassword(event)" class="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-3">
                    <input type="password" id="currentPassword" placeholder="Current Password" required class="w-full px-4 py-3 rounded-lg text-white focus:outline-none focus:ring-2" style="background: var(--dash-bg); border: 1px solid var(--dash-card-border); --tw-ring-color: var(--dash-accent)">
                    <input type="password" id="newPassword" placeholder="New Password" required class="w-full px-4 py-3 rounded-lg text-white focus:outline-none focus:ring-2" style="background: var(--dash-bg); border: 1px solid var(--dash-card-border); --tw-ring-color: var(--dash-accent)">
                    <input type="password" id="confirmPassword" placeholder="Confirm Password" required class="w-full px-4 py-3 rounded-lg text-white focus:outline-none focus:ring-2" style="background: var(--dash-bg); border: 1px solid var(--dash-card-border); --tw-ring-color: var(--dash-accent)">
                    <button type="submit" class="dash-btn dash-btn-primary w-full">Update Password</button>
                </form>
            </div>

            <div class="pt-6" style="border-top: 1px solid var(--dash-card-border)">
                <a href="/logout" class="dash-btn dash-btn-danger inline-block">Logout</a>
            </div>

            <!-- 2FA Card -->
            <div class="pt-6" style="border-top: 1px solid var(--dash-card-border)">
                <h5 class="text-xs font-bold uppercase tracking-wide mb-4" style="color: var(--dash-accent)">Two-Factor Authentication (2FA)</h5>
                <div id="2fa-section">
                    ${data.twofaEnabled ? `
                        <div class="mb-4">
                            <span class="text-green-400 font-bold">2FA Enabled</span>
                            <button id="disable2faBtn" class="dash-btn dash-btn-danger ml-4">Disable 2FA</button>
                        </div>
                    ` : `
                        <button id="enable2faBtn" class="dash-btn dash-btn-primary">Enable 2FA</button>
                        <div id="2fa-setup" class="mt-4 hidden">
                            <div class="mb-2 text-sm text-gray-400">Scan the QR code with Google Authenticator or similar app, then enter the code below:</div>
                            <img id="2faQR" src="" alt="2FA QR" class="mb-3 w-40 h-40 mx-auto" style="display:none;" />
                            <input type="text" id="2faCode" maxlength="6" placeholder="Enter 6-digit code" class="w-full px-4 py-2 rounded-lg text-white bg-black border border-gray-700 mb-2 text-center font-mono" />
                            <button id="verify2faBtn" class="dash-btn dash-btn-primary w-full">Verify & Enable</button>
                            <div id="2faError" class="text-red-400 text-xs mt-2"></div>
                        </div>
                    `}
                </div>
            </div>

        </div>
        </div><!-- End sections-container -->

        <script nonce="${getNonce()}">
        // 2FA UI logic
        document.addEventListener('DOMContentLoaded', function() {
            const enableBtn = document.getElementById('enable2faBtn');
            const setupDiv = document.getElementById('2fa-setup');
            const qrImg = document.getElementById('2faQR');
            const verifyBtn = document.getElementById('verify2faBtn');
            const codeInput = document.getElementById('2faCode');
            const errorDiv = document.getElementById('2faError');
            const disableBtn = document.getElementById('disable2faBtn');

            if (enableBtn) {
                enableBtn.addEventListener('click', async () => {
                    setupDiv.classList.remove('hidden');
                    enableBtn.disabled = true;
                    // Fetch QR and secret
                    const res = await fetch('/auth/2fa/setup');
                    const data = await res.json();
                    qrImg.src = data.qr;
                    qrImg.style.display = 'block';
                });
            }
            if (verifyBtn) {
                verifyBtn.addEventListener('click', async () => {
                    errorDiv.textContent = '';
                    const code = codeInput.value.trim();
                    if (!code) { errorDiv.textContent = 'Enter code.'; return; }
                    const res = await fetch('/auth/2fa/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code })
                    });
                    const result = await res.json();
                    if (result.success) {
                        location.reload();
                    } else {
                        errorDiv.textContent = result.error || 'Invalid code.';
                    }
                });
            }
            if (disableBtn) {
                disableBtn.addEventListener('click', async () => {
                    if (!confirm('Disable 2FA?')) return;
                    const res = await fetch('/auth/2fa/disable', { method: 'POST' });
                    const result = await res.json();
                    if (result.success) location.reload();
                });
            }
        });
        </script>


        ${getDashboardLayoutEnd()}


<!-- Cancel Plan Confirmation Modal -->
<div id="terminate-modal" class="hidden fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center">
    <div class="bg-gray-900 border border-red-600 rounded-lg p-6 sm:p-8 max-w-lg w-11/12">
        <h2 class="text-xl sm:text-2xl font-bold text-red-500 mb-4">⚠️ Cancel Plan</h2>
        <p class="text-gray-300 mb-4 text-sm sm:text-base">This action will <span class="text-red-500 font-bold">CANCEL YOUR SUBSCRIPTION</span> and destroy your server and all data. There is no undo.</p>
        
        <div class="bg-black bg-opacity-40 border border-gray-700 rounded-lg p-3 sm:p-4 mb-4">
            <p class="text-xs text-gray-400 mb-2 uppercase font-bold">To confirm, type the server name below:</p>
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3">
                <code class="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-brand font-mono text-sm truncate" id="droplet-name-display">${escapeHtml(data.dropletName)}    </code>
                <button onclick="navigator.clipboard.writeText(dropletName)" class="dash-btn dash-btn-secondary text-xs">Copy</button>
            </div>
            <input type="text" id="confirm-input" oninput="validateTermination()" placeholder="Paste and remove trailing spaces" class="w-full px-4 py-3 bg-black border border-gray-600 rounded text-white font-mono focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:outline-none">
        </div>
        
        <div class="flex flex-col-reverse sm:flex-row gap-3">
            <button onclick="closeTerminateModal()" class="dash-btn dash-btn-secondary flex-1">Cancel</button>
            <button id="confirm-button" onclick="confirmTermination()" disabled class="dash-btn dash-btn-danger flex-1 opacity-50 cursor-not-allowed">Confirm Cancellation</button>
        </div>
    </div>
</div>

<!-- Submit Ticket Modal -->
<div id="submitTicketModal" class="hidden fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
    <div class="bg-gray-900 rounded-lg p-6 sm:p-8 max-w-md w-full max-h-[85vh] overflow-y-auto">
        <h2 class="text-lg font-bold text-white mb-6">Submit Support Ticket</h2>
        <form onsubmit="submitTicket(event)" class="space-y-4">
            <div>
                <label class="block text-xs text-gray-400 uppercase font-bold mb-2">Subject</label>
                <input type="text" id="ticketSubject" placeholder="Brief description" required maxlength="100" class="w-full px-4 py-3 bg-black bg-opacity-50 border border-gray-700 rounded-lg text-white focus:border-brand focus:ring-2 focus:ring-brand focus:outline-none">
            </div>
            <div>
                <label class="block text-xs text-gray-400 uppercase font-bold mb-2">Priority</label>
                <select id="ticketPriority" class="w-full px-4 py-3 bg-black bg-opacity-50 border border-gray-700 rounded-lg text-white focus:border-brand focus:ring-2 focus:ring-brand focus:outline-none">
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                </select>
            </div>
            <div>
                <label class="block text-xs text-gray-400 uppercase font-bold mb-2">Description</label>
                <textarea id="ticketDescription" placeholder="Details about your issue" required class="w-full px-4 py-3 bg-black bg-opacity-50 border border-gray-700 rounded-lg text-white focus:border-brand focus:ring-2 focus:ring-brand focus:outline-none h-32"></textarea>
            </div>
            <div class="flex flex-col-reverse sm:flex-row gap-3">
                <button type="button" class="dash-btn dash-btn-secondary flex-1" onclick="closeSubmitTicketModal()">Cancel</button>
                <button type="submit" class="dash-btn dash-btn-primary flex-1">Submit</button>
            </div>
        </form>
    </div>
</div>

<!-- Delete Domain Confirmation Modal -->
<div id="delete-domain-modal" class="hidden fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4">
    <div class="bg-gray-900 border border-red-600 rounded-lg p-5 sm:p-6 max-w-md w-full">
        <h2 class="text-xl font-bold text-red-400 mb-4">🗑️ Delete Domain</h2>
        <p class="text-gray-300 mb-2 text-sm sm:text-base">Are you sure you want to delete:</p>
        <p class="text-white font-mono bg-black px-3 py-2 rounded mb-4 text-sm break-all" id="delete-domain-name"></p>
        
        <div class="bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded p-3 mb-4">
            <p class="text-yellow-300 text-xs sm:text-sm">⚠️ This will remove the domain from your server's nginx configuration. If SSL was enabled, the certificate will remain but won't be renewed.</p>
        </div>
        
        <div class="flex flex-col-reverse sm:flex-row gap-3">
            <button onclick="closeDeleteDomainModal()" class="dash-btn dash-btn-secondary flex-1">Cancel</button>
            <button onclick="confirmDeleteDomain()" class="dash-btn dash-btn-danger flex-1">Delete Domain</button>
        </div>
    </div>
</div>

<script nonce="${getNonce()}">
function openSubmitTicketModal() { document.getElementById('submitTicketModal').classList.remove('hidden'); document.getElementById('submitTicketModal').classList.add('flex'); }
function closeSubmitTicketModal() { document.getElementById('submitTicketModal').classList.remove('flex'); document.getElementById('submitTicketModal').classList.add('hidden'); }
document.addEventListener('click', (e) => {
    if (e.target.id === 'submitTicketModal') closeSubmitTicketModal();
});

async function submitTicket(e) {
    e.preventDefault();
    const subject = document.getElementById('ticketSubject').value.trim();
    const description = document.getElementById('ticketDescription').value.trim();
    const priority = document.getElementById('ticketPriority').value;
    const res = await fetch('/submit-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'CSRF-Token': '${data.csrfToken}' },
        body: JSON.stringify({ subject, description, priority })
    });
    const result = await res.json();
    if (result.success) {
        alert('Ticket submitted!');
        closeSubmitTicketModal();
        window.location.reload();
    } else {
        alert('Error: ' + result.error);
    }
}

async function changePassword(e) {
    e.preventDefault();
    const current = document.getElementById('currentPassword').value;
    const newPwd = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmPassword').value;
    if (newPwd !== confirm) { alert('Passwords do not match'); return; }
    if (newPwd.length < 8) { alert('Min 8 characters'); return; }
    const res = await fetch('/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'CSRF-Token': '${data.csrfToken}' },
        body: JSON.stringify({ currentPassword: current, newPassword: newPwd })
    });
    const result = await res.json();
    if (result.success) {
        alert('Password updated!');
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    } else {
        alert('Error: ' + result.error);
    }
}

// Use global copyToClipboard from public/js/dashboard.js

// Password visibility toggle
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('sshPassword');
    const eyeIcon = document.getElementById('eyeIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>';
    } else {
        passwordInput.type = 'password';
        eyeIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>';
    }
}

// Update clock
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const elem = document.getElementById('clock');
    if (elem) elem.textContent = timeString;
}
setInterval(updateTime, 1000);
updateTime();

// Terminate modal logic
const dropletName = '${escapeHtml(data.dropletName)}    '; // Note trailing spaces for paste validation
const dropletNameTrimmed = dropletName.trim();

function openTerminateModal() {
    document.getElementById('terminate-modal').classList.remove('hidden');
    document.getElementById('confirm-input').value = '';
    document.getElementById('confirm-button').disabled = true;
}

function closeTerminateModal() {
    document.getElementById('terminate-modal').classList.add('hidden');
}

function validateTermination() {
    const input = document.getElementById('confirm-input').value;
    const button = document.getElementById('confirm-button');
    
    if (input === dropletNameTrimmed) {
        button.disabled = false;
        button.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
        button.disabled = true;
        button.classList.add('opacity-50', 'cursor-not-allowed');
    }
}

function confirmTermination() {
    document.getElementById('terminate-form').submit();
}

// Close modal on escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeTerminateModal();
});

// ==========================================
// HASH-BASED SECTION NAVIGATION
// ==========================================
console.log('[Dashboard] Hash navigation script loaded');
console.log('[Dashboard] Sections found:', document.querySelectorAll('.dash-section').length);
console.log('[Dashboard] Nav links found:', document.querySelectorAll('.sidebar-nav-link').length);

// Show/hide sections based on hash
function showSection(sectionId) {
    console.log('[Dashboard] showSection called with:', sectionId);
    
    // Hide all sections
    document.querySelectorAll('.dash-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById('section-' + sectionId);
    console.log('[Dashboard] Target section element:', targetSection);
    if (targetSection) {
        targetSection.classList.add('active');
        console.log('[Dashboard] Section activated:', sectionId);
    } else {
        console.warn('[Dashboard] Section not found: section-' + sectionId);
    }
    
    // Update sidebar active state
    document.querySelectorAll('.sidebar-nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        }
    });
    
    // Update section title
    const sectionTitle = document.getElementById('section-title');
    if (sectionTitle) {
        const titles = { overview: 'Overview', sites: 'Sites', deploy: 'Deploy', 'dev-tools': 'Dev Tools', settings: 'Settings' };
        sectionTitle.textContent = titles[sectionId] || 'Overview';
    }
}

// Handle hash changes
function handleHashChange() {
    const hash = window.location.hash.slice(1) || 'overview';
    console.log('[Dashboard] handleHashChange, hash:', hash);
    showSection(hash);
}

// Listen for hash changes
window.addEventListener('hashchange', handleHashChange);
console.log('[Dashboard] hashchange listener added');

// Initial section from hash
handleHashChange();

// Add click handlers to nav links
document.querySelectorAll('.sidebar-nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const sectionId = link.getAttribute('data-section');
        console.log('[Dashboard] Nav link clicked, data-section:', sectionId);
        if (sectionId) {
            e.preventDefault();
            window.location.hash = sectionId;
            console.log('[Dashboard] Hash set to:', sectionId);
        }
    });
});
console.log('[Dashboard] Click handlers attached to nav links');

// ==========================================
// DELETE DOMAIN MODAL
// ==========================================

let deleteDomainId = null;
let deleteDomainName = '';

function openDeleteDomainModal(domain, id) {
    deleteDomainId = id;
    deleteDomainName = domain;
    document.getElementById('delete-domain-name').textContent = domain;
    document.getElementById('delete-domain-modal').classList.remove('hidden');
    document.getElementById('delete-domain-modal').classList.add('flex');
}

function closeDeleteDomainModal() {
    document.getElementById('delete-domain-modal').classList.add('hidden');
    document.getElementById('delete-domain-modal').classList.remove('flex');
    deleteDomainId = null;
    deleteDomainName = '';
}

async function confirmDeleteDomain() {
    if (!deleteDomainId) return;
    
    const btn = document.querySelector('#delete-domain-modal button.dash-btn-danger');
    btn.disabled = true;
    btn.textContent = 'Deleting...';
    
    try {
        const res = await fetch('/delete-domain', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'CSRF-Token': '${data.csrfToken}' },
            body: JSON.stringify({ domainId: deleteDomainId })
        });
        const result = await res.json();
        if (result.success) {
            window.location.reload();
        } else {
            alert('Error: ' + result.error);
            btn.disabled = false;
            btn.textContent = 'Delete Domain';
        }
    } catch (err) {
        alert('Network error');
        btn.disabled = false;
        btn.textContent = 'Delete Domain';
    }
}

// Close on click outside
document.addEventListener('click', (e) => {
    if (e.target.id === 'delete-domain-modal') closeDeleteDomainModal();
});

</script>
    `;
};
