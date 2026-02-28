'use strict';

// services/wordpress.js
// WordPress provisioning service.
// This file owns:
//   1. The user-data cloud-init script (getWordPressUserData)
//   2. Droplet creation for WordPress servers (createWordPressServer)
//
// Intentionally separate from digitalocean.js so WordPress provisioning
// logic doesn't pollute the core droplet management code.

const crypto = require('crypto');
const axios  = require('axios');
const pool   = require('../db');
const { Client }              = require('ssh2');
const { encrypt, decrypt }    = require('../src/utils/encryption');
const { pollDropletStatus }   = require('./digitalocean');

// ── Credential helpers ────────────────────────────────────────────────────────

/**
 * Generate a cryptographically secure alphanumeric password.
 * Strips base64 padding/symbols so the result is safe for shell scripts,
 * MySQL IDENTIFIED BY clauses, and wp-cli arguments without quoting issues.
 *
 * @param {number} length - Desired length. Default 24.
 * @returns {string}
 */
function generateSecurePassword(length = 24) {
  return crypto.randomBytes(length)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, length);
}

// ── User-data script ──────────────────────────────────────────────────────────

/**
 * Build the DigitalOcean user_data cloud-init bash script for a WordPress droplet.
 *
 * This script runs ONCE on first boot and installs:
 *   - Nginx 1.x  (web server)
 *   - PHP 8.3-FPM + WordPress-required extensions (from ondrej/php PPA)
 *   - MySQL 8.0  (database server — empty, no WP database yet)
 *   - WP-CLI     (command-line WordPress manager)
 *   - Certbot    (Let's Encrypt SSL — reuses existing platform flow)
 *   - UFW        (firewall — HTTP/HTTPS/SSH only)
 *
 * Database creation and WordPress installation are NOT done here.
 * They happen in later steps via SSH after the droplet is reachable,
 * matching the pattern the platform already uses for git deployments.
 *
 * Progress is logged to /root/wp-setup.log on the droplet.
 * The last line written is "SETUP_DONE" — poll for this to confirm completion.
 *
 * @param {string} rootPassword - Root SSH password to inject into the droplet.
 * @returns {string} Bash script suitable for the DigitalOcean user_data field.
 */
function getWordPressUserData(rootPassword) {
  // NOTE: Variables wrapped in ${...} below are JavaScript interpolations.
  // Everything else (nginx $uri, mysql @variables, etc.) is left as plain $
  // because the heredocs inside this script use single-quoted delimiters
  // (<<'EOF'), which prevents bash from expanding them at runtime.
  return `#!/bin/bash
exec >> /root/wp-setup.log 2>&1
set -euo pipefail

echo "[$(date '+%Y-%m-%d %H:%M:%S')] === WordPress droplet provisioning started ==="

# ── 1. Root password & SSH ────────────────────────────────────────────────────
echo "root:${rootPassword}" | chpasswd

sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config
sed -i 's/^#*PermitRootLogin.*/PermitRootLogin yes/'               /etc/ssh/sshd_config
systemctl restart sshd

echo "[$(date '+%Y-%m-%d %H:%M:%S')] SSH configured"

# ── 2. System update ──────────────────────────────────────────────────────────
export DEBIAN_FRONTEND=noninteractive
apt-get update  -y
apt-get upgrade -y

echo "[$(date '+%Y-%m-%d %H:%M:%S')] System updated"

# ── 3. Nginx ──────────────────────────────────────────────────────────────────
apt-get install -y nginx
systemctl enable nginx
systemctl start  nginx

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Nginx installed"

# ── 4. PHP 8.3-FPM + WordPress extensions ────────────────────────────────────
# The ondrej/php PPA is the standard Ubuntu source for PHP 8.x.
apt-get install -y software-properties-common
add-apt-repository -y ppa:ondrej/php
apt-get update -y

apt-get install -y \\
  php8.3        \\
  php8.3-fpm    \\
  php8.3-mysql  \\
  php8.3-curl   \\
  php8.3-gd     \\
  php8.3-zip    \\
  php8.3-xml    \\
  php8.3-mbstring \\
  php8.3-bcmath \\
  php8.3-intl   \\
  php8.3-soap

# php8.3-imagick (image processing) — best-effort; not required for WordPress core
apt-get install -y php8.3-imagick || echo "[$(date '+%Y-%m-%d %H:%M:%S')] imagick unavailable, skipping"

systemctl enable php8.3-fpm
systemctl start  php8.3-fpm

echo "[$(date '+%Y-%m-%d %H:%M:%S')] PHP 8.3-FPM installed"

# ── 5. MySQL 8.0 ──────────────────────────────────────────────────────────────
# Install MySQL. No databases are created here — that happens in Step 2
# once the droplet is reachable and we have the site's credentials ready.
apt-get install -y mysql-server
systemctl enable mysql
systemctl start  mysql

echo "[$(date '+%Y-%m-%d %H:%M:%S')] MySQL 8.0 installed"

# ── 6. WP-CLI ─────────────────────────────────────────────────────────────────
# Install globally at /usr/local/bin/wp so it is available to all users.
curl -sO https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
chmod +x wp-cli.phar
mv wp-cli.phar /usr/local/bin/wp

echo "[$(date '+%Y-%m-%d %H:%M:%S')] WP-CLI installed: $(wp --version --allow-root)"

# ── 7. Certbot ────────────────────────────────────────────────────────────────
apt-get install -y certbot python3-certbot-nginx

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Certbot installed"

# ── 8. UFW firewall ───────────────────────────────────────────────────────────
ufw allow OpenSSH
ufw allow 'Nginx Full'
echo "y" | ufw enable

echo "[$(date '+%Y-%m-%d %H:%M:%S')] UFW configured"

# ── 9. Default Nginx config (placeholder until a WP site is configured) ───────
# Uses PHP 8.3-FPM socket. Per-site configs will be added in Step 3.
cat > /etc/nginx/sites-available/default << 'NGINX_EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root  /var/www/html;
    index index.php index.html;

    server_name _;

    location / {
        try_files $uri $uri/ =404;
    }

    location ~ \\.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
    }

    # Block access to hidden files (.htaccess, .git, etc.)
    location ~ /\\. {
        deny all;
    }
}
NGINX_EOF

nginx -t && systemctl reload nginx

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Nginx default config applied"

# ── Done ──────────────────────────────────────────────────────────────────────
echo "[$(date '+%Y-%m-%d %H:%M:%S')] === WordPress provisioning COMPLETE ==="
echo "SETUP_DONE"
`;
}

// ── Droplet provisioning ──────────────────────────────────────────────────────

// Plan specs — must stay in sync with digitalocean.js
const WP_SPECS = {
  basic:   { ram: '1 GB',  cpu: '1 vCPU',  storage: '25 GB NVMe SSD', bandwidth: '1 TB', slug: 's-1vcpu-1gb'  },
  pro:     { ram: '2 GB',  cpu: '2 vCPUs', storage: '60 GB NVMe SSD', bandwidth: '3 TB', slug: 's-2vcpu-2gb'  },
  premium: { ram: '4 GB',  cpu: '2 vCPUs', storage: '80 GB NVMe SSD', bandwidth: '4 TB', slug: 's-2vcpu-4gb'  },
};

/**
 * Provision a WordPress-ready DigitalOcean droplet for a user.
 *
 * Flow:
 *  1. Guard against duplicate servers (same race-condition pattern as createRealServer).
 *  2. Generate all credentials (root SSH, WP admin, MySQL DB + user + password).
 *  3. Encrypt WP admin + MySQL passwords before writing to the DB.
 *  4. Create the droplet via DO API with the WordPress user-data script.
 *  5. Insert into `servers` (server_type = 'wordpress') and `wordpress_sites`.
 *  6. Kick off IP polling (reuses pollDropletStatus from digitalocean.js).
 *
 * Database creation and WordPress installation happen AFTER the droplet is
 * reachable — those are Step 2 and Step 3 of the roadmap.
 *
 * @param {number} userId
 * @param {string} plan         - 'basic' | 'pro' | 'premium'
 * @param {string} siteTitle    - Used as the WordPress site title
 * @param {string} adminEmail   - WordPress admin account email
 * @returns {Promise<object>}   - The new row from the `servers` table
 */
async function createWordPressServer(userId, plan, siteTitle, adminEmail) {
  const selectedSpec = WP_SPECS[plan] || WP_SPECS.basic;

  // ── Generate credentials ──────────────────────────────────────────────────
  const rootPassword  = generateSecurePassword(20); // SSH root login
  const adminPassword = generateSecurePassword(20); // WordPress /wp-admin
  const dbPassword    = generateSecurePassword(20); // MySQL WP user
  // Prefix with wp_ / wpuser_ so they're identifiable on the droplet
  const dbName = `wp_${crypto.randomBytes(4).toString('hex')}`;
  const dbUser = `wpuser_${crypto.randomBytes(3).toString('hex')}`;

  // Encrypt before any DB write — only ciphertext + IV are persisted
  const encAdmin = encrypt(adminPassword);
  const encDb    = encrypt(dbPassword);
  const encRoot  = encrypt(rootPassword);

  const dropletName = `wp-basement-${userId}-${Date.now()}`;
  const enableBackups = plan === 'pro' || plan === 'premium';

  try {
    // ── Guard: one active server per user ─────────────────────────────────
    // Mirrors the same check in createRealServer(). Revisit if we want to
    // allow users to run both a Node.js server and a WordPress server.
    const existing = await pool.query(
      `SELECT id, status FROM servers
       WHERE user_id = $1 AND status NOT IN ('deleted', 'failed')`,
      [userId]
    );
    if (existing.rows.length > 0) {
      console.log(`[WP] User ${userId} already has active server (${existing.rows[0].id}), skipping`);
      return existing.rows[0];
    }

    // ── Create DigitalOcean droplet ───────────────────────────────────────
    const response = await axios.post(
      'https://api.digitalocean.com/v2/droplets',
      {
        name:       dropletName,
        region:     'nyc3',
        size:       selectedSpec.slug,
        image:      'ubuntu-22-04-x64',
        ssh_keys:   null,
        backups:    enableBackups,
        ipv6:       true,
        user_data:  getWordPressUserData(rootPassword),
        monitoring: true,
        tags:       ['basement-server', 'wordpress'],
      },
      {
        headers: {
          Authorization:  `Bearer ${process.env.DIGITALOCEAN_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const droplet = response.data.droplet;
    console.log(`[WP] Droplet created: ${droplet.id} for user ${userId}`);

    // ── Insert into servers ───────────────────────────────────────────────
    let serverRow;
    try {
      const serverResult = await pool.query(
        `INSERT INTO servers
           (user_id, plan, status, ip_address, ssh_username, ssh_password, ssh_password_iv,
            specs, droplet_id, droplet_name, server_type, site_limit, payment_interval)
         VALUES ($1, $2, 'provisioning', 'pending', 'root', $3, $4,
                 $5, $6, $7, 'wordpress', 1, 'monthly')
         RETURNING *`,
        [
          userId,
          plan,
          encRoot.encrypted,
          encRoot.iv,
          JSON.stringify(selectedSpec),
          String(droplet.id),
          dropletName,
        ]
      );
      serverRow = serverResult.rows[0];
    } catch (insertError) {
      // 23505 = unique_violation — race condition, another process won
      if (insertError.code === '23505') {
        console.log(`[WP] Race condition for user ${userId}. Destroying orphaned droplet ${droplet.id}`);
        await axios
          .delete(`https://api.digitalocean.com/v2/droplets/${droplet.id}`, {
            headers: { Authorization: `Bearer ${process.env.DIGITALOCEAN_TOKEN}` },
          })
          .catch(e => console.error(`[WP] Failed to destroy orphaned droplet:`, e.message));

        let winner;
        let retries = 3;
        while (retries > 0) {
          winner = await pool.query(
            `SELECT * FROM servers
             WHERE user_id = $1 AND status NOT IN ('deleted', 'failed') LIMIT 1`,
            [userId]
          );
          if (winner.rows.length > 0) {
            return winner.rows[0];
          }
          retries--;
          if (retries > 0) {
            await new Promise(res => setTimeout(res, 200));
          }
        }
        throw new Error('No available server after race condition');
      }
      throw insertError;
    }

    // ── Insert into wordpress_sites ───────────────────────────────────────
    // Passwords are stored as encrypted BYTEA — never plaintext.
    const wpSiteResult = await pool.query(
      `INSERT INTO wordpress_sites
         (user_id, server_id, site_title, admin_user, admin_email,
          encrypted_admin_password, encrypted_admin_password_iv,
          db_name, db_user,
          encrypted_db_password, encrypted_db_password_iv,
          status)
       VALUES ($1, $2, $3, 'wpadmin', $4, $5, $6, $7, $8, $9, $10, 'provisioning')
       RETURNING id`,
      [
        userId,
        serverRow.id,
        siteTitle,
        adminEmail,
        encAdmin.encrypted, // Buffer → PostgreSQL BYTEA
        encAdmin.iv,
        dbName,
        dbUser,
        encDb.encrypted,
        encDb.iv,
      ]
    );
    const wpSiteId = wpSiteResult.rows[0].id;
    console.log(`[WP] wordpress_sites record created (server ${serverRow.id}, site ${wpSiteId})`);

    // ── Start IP polling + provisioning pipeline ──────────────────────────
    // pollDropletStatus sets servers.status → 'running' once the IP is live.
    // watchForServerRunning then fires the DB → install → Nginx chain.
    pollDropletStatus(droplet.id, serverRow.id);
    watchForServerRunning(serverRow.id, wpSiteId);

    return serverRow;

  } catch (error) {
    console.error('[WP] Provisioning failed:', error.response?.data || error.message);

    // Attempt to destroy orphaned droplet if it was created
    if (typeof droplet !== 'undefined' && droplet && droplet.id) {
      try {
        await axios.delete(`https://api.digitalocean.com/v2/droplets/${droplet.id}`,
          { headers: { Authorization: `Bearer ${process.env.DIGITALOCEAN_TOKEN}` } });
        console.log(`[WP] Destroyed orphaned droplet ${droplet.id}`);
      } catch (cleanupErr) {
        console.error(`[WP] Failed to destroy orphaned droplet:`, cleanupErr.message);
      }
    }

    // Record the failure so it appears in the dashboard rather than disappearing
    await pool.query(
      `INSERT INTO servers
         (user_id, plan, status, ip_address, ssh_username, ssh_password,
          specs, droplet_id, server_type, site_limit)
       VALUES ($1, $2, 'failed', 'N/A', 'root', 'N/A', $3, NULL, 'wordpress', 1)`,
      [userId, plan, JSON.stringify(selectedSpec)]
    ).catch(e => console.error('[WP] Failed to record failed server:', e.message));

    throw error;
  }
}

// ── Step 3: WordPress installation ───────────────────────────────────────────

/**
 * Install WordPress on a provisioned, database-ready droplet.
 *
 * Call this once `wordpress_sites.status = 'installing'` (after setupWordPressDatabase).
 * On success, advances status → 'configuring' so the Nginx + SSL step can proceed.
 *
 * Security notes:
 *  - wp-config.php is generated in Node.js and piped via stdin — dbPassword is never
 *    a CLI argument and never appears in ps aux.
 *  - wp core install uses a disposable temp password. The real admin password is
 *    applied in the next step via a root-only PHP file (chmod 600), then shred-deleted.
 *  - siteTitle is sanitized (metacharacter strip) before shell use.
 *  - adminEmail and ip_address are validated by regex before any use.
 *  - Temp files are shredded on both success and error paths.
 *
 * @param {number} wpSiteId - `wordpress_sites.id`
 */
async function installWordPress(wpSiteId) {
  // ── Fetch records ────────────────────────────────────────────────────────────
  const result = await pool.query(
    `SELECT ws.id, ws.site_title, ws.admin_user, ws.admin_email,
            ws.encrypted_admin_password, ws.encrypted_admin_password_iv,
            ws.db_name, ws.db_user,
            ws.encrypted_db_password, ws.encrypted_db_password_iv,
            s.ip_address, s.ssh_password, s.ssh_password_iv
     FROM wordpress_sites ws
     JOIN servers s ON s.id = ws.server_id
     WHERE ws.id = $1`,
    [wpSiteId]
  );

  if (!result.rows.length) {
    throw new Error(`[WP-INSTALL] Site not found: ${wpSiteId}`);
  }
  const wp = result.rows[0];

  // ── Input validation ─────────────────────────────────────────────────────────
  if (!/^wp_[a-f0-9]{8}$/.test(wp.db_name)) {
    throw new Error('[WP-INSTALL] Refusing — invalid db_name format');
  }
  if (!/^wpuser_[a-f0-9]{6}$/.test(wp.db_user)) {
    throw new Error('[WP-INSTALL] Refusing — invalid db_user format');
  }
  // Strict IPv4 check — prevents SSRF if ip_address is ever tampered
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(wp.ip_address)) {
    throw new Error('[WP-INSTALL] Refusing — invalid IP address format');
  }
  // Validate email before embedding in wp-cli command
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(wp.admin_email)) {
    throw new Error('[WP-INSTALL] Refusing — invalid admin email format');
  }

  // Sanitize site title: allow alphanumeric, spaces, hyphens, underscores, periods, commas.
  // Anything else is stripped so the value is safe inside single-quoted shell arguments.
  const siteTitle = (wp.site_title || '')
    .replace(/[^\w\s\-.,]/g, '')
    .slice(0, 100)
    .trim() || 'WordPress Site';

  // ── Decrypt credentials (in-memory only, never logged) ───────────────────────
  const rootPassword  = decrypt(wp.ssh_password,              wp.ssh_password_iv);
  const dbPassword    = decrypt(wp.encrypted_db_password,     wp.encrypted_db_password_iv);
  const adminPassword = decrypt(wp.encrypted_admin_password,  wp.encrypted_admin_password_iv);

  const wpPath     = '/var/www/wordpress';
  const phpTmpPath = `/tmp/wp_pw_${wpSiteId}.php`; // shredded after use

  // Disposable password for wp core install — replaced by adminPassword in the next step.
  // Real adminPassword is never passed as a CLI argument.
  const tempAdminPassword = generateSecurePassword(20);

  let conn;
  try {
    conn = await sshConnect(wp.ip_address, rootPassword);
    console.log(`[WP-INSTALL] SSH connected to ${wp.ip_address} for site ${wpSiteId}`);

    // ── 1. Wait for cloud-init to finish ──────────────────────────────────────
    // The user-data script ends with `echo "SETUP_DONE"`. We must wait before
    // running wp-cli, which requires PHP + MySQL to be installed first.
    await waitForSetupDone(conn, wpSiteId);

    // ── 2. Create WordPress web root ──────────────────────────────────────────
    await execSSH(conn, `mkdir -p ${wpPath}`);

    // ── 3. Download WordPress core ────────────────────────────────────────────
    console.log('[WP-INSTALL] Downloading WordPress core...');
    await execSSH(conn, `wp core download --path=${wpPath} --allow-root`, 120000);

    // ── 4. Write wp-config.php via stdin ─────────────────────────────────────
    // dbPassword lives only in the file content — never a shell argument.
    // `cat >` is used instead of `tee` to avoid echoing credentials back in stdout.
    console.log('[WP-INSTALL] Writing wp-config.php...');
    const wpConfigContent = generateWpConfig(wp.db_name, wp.db_user, dbPassword);
    await execSSHWithInput(conn, `cat > ${wpPath}/wp-config.php`, wpConfigContent);
    // Root-owned, group-readable by www-data; not world-readable
    await execSSH(conn, `chown root:www-data ${wpPath}/wp-config.php && chmod 640 ${wpPath}/wp-config.php`);

    // ── 5. File permissions ───────────────────────────────────────────────────
    await execSSH(conn, [
      `chown -R www-data:www-data ${wpPath}`,
      `find ${wpPath} -type d -exec chmod 755 {} +`,
      `find ${wpPath} -type f -exec chmod 644 {} +`,
      // Re-lock config after chown sweep
      `chown root:www-data ${wpPath}/wp-config.php && chmod 640 ${wpPath}/wp-config.php`,
    ].join(' && '));

    // ── 6. wp core install (temp password) ───────────────────────────────────
    // tempAdminPassword appears in ps briefly (~ms) but is discarded immediately.
    // The real adminPassword is applied in step 7 and never touches the CLI.
    console.log('[WP-INSTALL] Running wp core install...');
    await execSSH(conn,
      `wp core install` +
      ` --url='http://${wp.ip_address}'` +
      ` --title='${siteTitle}'` +
      ` --admin_user='${wp.admin_user}'` +
      ` --admin_password='${tempAdminPassword}'` +
      ` --admin_email='${wp.admin_email}'` +
      ` --skip-email` +
      ` --path=${wpPath}` +
      ` --allow-root`,
      120000
    );

    // ── 7. Set real admin password via PHP file ───────────────────────────────
    // Written via stdin (not CLI), chmod 600 root-only, executed, then shredded.
    // adminPassword is [a-zA-Z0-9] — no PHP string escaping required.
    console.log('[WP-INSTALL] Updating admin password...');
    const phpScript =
      `<?php\n` +
      `require '${wpPath}/wp-load.php';\n` +
      `$u = get_user_by('login', '${wp.admin_user}');\n` +
      `if (!$u) { fwrite(STDERR, "User not found\\n"); exit(1); }\n` +
      `wp_set_password('${adminPassword}', $u->ID);\n` +
      `echo "Password updated\\n";\n`;

    await execSSHWithInput(conn, `cat > ${phpTmpPath}`, phpScript);
    await execSSH(conn, `chmod 600 ${phpTmpPath}`);
    await execSSH(conn, `php ${phpTmpPath}`);
    await execSSH(conn, `shred -u ${phpTmpPath}`);

    // ── 8. Verify + record wp version ────────────────────────────────────────
    const wpVersion = (await execSSH(conn,
      `wp core version --path=${wpPath} --allow-root`
    )).trim();
    console.log(`[WP-INSTALL] WordPress ${wpVersion} installed for site ${wpSiteId}`);

    // ── 9. Advance status ─────────────────────────────────────────────────────
    await pool.query(
      `UPDATE wordpress_sites
          SET status         = 'configuring',
              wp_version     = $1,
              status_message = 'WordPress installed. Configuring web server and SSL.',
              install_log    = COALESCE(install_log, '') || $2,
              updated_at     = NOW()
        WHERE id = $3`,
      [
        wpVersion,
        `[${new Date().toISOString()}] WordPress ${wpVersion} installed successfully.\n`,
        wpSiteId,
      ]
    );

  } catch (err) {
    // Error message only — credentials are never logged
    console.error(`[WP-INSTALL] Failed for site ${wpSiteId}:`, err.message);

    // Best-effort cleanup of temp PHP file on error path
    if (conn) {
      await execSSH(conn, `test -f ${phpTmpPath} && shred -u ${phpTmpPath} || true`)
        .catch(() => {});
    }

    await pool.query(
      `UPDATE wordpress_sites
          SET status         = 'error',
              status_message = $1,
              updated_at     = NOW()
        WHERE id = $2`,
      [`Installation failed: ${err.message}`, wpSiteId]
    );
    throw err;

  } finally {
    if (conn) conn.end();
  }
}

// ── SSH helpers ───────────────────────────────────────────────────────────────

/**
 * Execute a remote command, return stdout.
 * For commands that need stdin input, use execSSHWithInput instead.
 *
 * @param {Client} conn
 * @param {string} command
 * @param {number} timeoutMs
 * @returns {Promise<string>} stdout
 */
function execSSH(conn, command, timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`SSH command timed out after ${timeoutMs / 1000}s`));
    }, timeoutMs);

    conn.exec(command, (err, stream) => {
      if (err) { clearTimeout(timer); return reject(err); }

      let stdout = '';
      let stderr = '';

      stream.on('close', (code) => {
        clearTimeout(timer);
        if (code === 0) resolve(stdout);
        else reject(new Error(`Command exited ${code}: ${stderr || stdout}`));
      });
      stream.on('data',        (d) => { stdout += d; });
      stream.stderr.on('data', (d) => { stderr += d; });
    });
  });
}

/**
 * Generate wp-config.php content in Node.js so dbPassword is written
 * directly to the file and never appears as a CLI argument.
 * Auth keys are freshly generated (64-char alphanumeric each).
 *
 * @param {string} dbName
 * @param {string} dbUser
 * @param {string} dbPassword
 * @returns {string} full wp-config.php content
 */
function generateWpConfig(dbName, dbUser, dbPassword) {
  const salt = () => generateSecurePassword(64);
  return (
    `<?php\n` +
    `/** Auto-generated by Clouded Basement — do not edit manually. */\n\n` +
    `define('DB_NAME',     '${dbName}');\n` +
    `define('DB_USER',     '${dbUser}');\n` +
    `define('DB_PASSWORD', '${dbPassword}');\n` +
    `define('DB_HOST',     'localhost');\n` +
    `define('DB_CHARSET',  'utf8mb4');\n` +
    `define('DB_COLLATE',  '');\n\n` +
    `define('AUTH_KEY',         '${salt()}');\n` +
    `define('SECURE_AUTH_KEY',  '${salt()}');\n` +
    `define('LOGGED_IN_KEY',    '${salt()}');\n` +
    `define('NONCE_KEY',        '${salt()}');\n` +
    `define('AUTH_SALT',        '${salt()}');\n` +
    `define('SECURE_AUTH_SALT', '${salt()}');\n` +
    `define('LOGGED_IN_SALT',   '${salt()}');\n` +
    `define('NONCE_SALT',       '${salt()}');\n\n` +
    `$table_prefix = 'wp_';\n\n` +
    `define('WP_DEBUG', false);\n` +
    `define('WP_AUTO_UPDATE_CORE', 'minor');\n\n` +
    `if (!defined('ABSPATH')) { define('ABSPATH', __DIR__ . '/'); }\n` +
    `require_once ABSPATH . 'wp-settings.php';\n`
  );
}

/**
 * Poll /root/wp-setup.log on the droplet until the last line is "SETUP_DONE".
 * The cloud-init user-data script writes this sentinel after all packages are
 * installed (PHP, MySQL, wp-cli). We must wait before running wp-cli.
 *
 * @param {Client} conn
 * @param {number} wpSiteId      - used only for log context
 * @param {number} maxAttempts   - default 30 (15 min total at 30 s intervals)
 * @param {number} intervalMs    - default 30000 ms
 */
async function waitForSetupDone(conn, wpSiteId, maxAttempts = 30, intervalMs = 30000) {
  for (let i = 1; i <= maxAttempts; i++) {
    try {
      const lastLine = await execSSH(
        conn,
        'tail -1 /root/wp-setup.log 2>/dev/null || echo ""',
        10000
      );
      if (lastLine.trim() === 'SETUP_DONE') {
        console.log(`[WP-INSTALL] Provisioning complete (site ${wpSiteId}, attempt ${i})`);
        return;
      }
    } catch (e) {
      // SSH can briefly fail if sshd is still starting — not fatal
      console.log(`[WP-INSTALL] Log check failed on attempt ${i}: ${e.message}`);
    }
    console.log(`[WP-INSTALL] Waiting for cloud-init... attempt ${i}/${maxAttempts}`);
    if (i < maxAttempts) await new Promise(r => setTimeout(r, intervalMs));
  }
  throw new Error(
    `[WP-INSTALL] Cloud-init did not complete after ${(maxAttempts * intervalMs) / 60000} minutes`
  );
}

/**
 * Open an SSH connection and return the connected Client.
 * Always call conn.end() in a finally block after use.
 *
 * @param {string} host
 * @param {string} password - decrypted root password (never logged)
 * @returns {Promise<Client>}
 */
function sshConnect(host, password) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn.on('ready', () => resolve(conn));
    conn.on('error', reject);
    conn.connect({
      host,
      port:         22,
      username:     'root',
      password,
      readyTimeout: 30000, // 30 s — enough for a warm droplet
    });
  });
}

/**
 * Execute a remote command and pipe `inputData` to its stdin.
 * The credential is NEVER part of the command string, so it won't
 * appear in the process list or shell history on the remote host.
 *
 * @param {Client} conn
 * @param {string} command  - shell command to run (e.g. 'mysql -u root')
 * @param {string} inputData - data written to the command's stdin
 * @param {number} timeoutMs
 * @returns {Promise<string>} stdout
 */
function execSSHWithInput(conn, command, inputData, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`SSH command timed out after ${timeoutMs / 1000}s`));
    }, timeoutMs);

    conn.exec(command, (err, stream) => {
      if (err) {
        clearTimeout(timer);
        return reject(err);
      }

      let stdout = '';
      let stderr = '';

      stream.on('close', (code) => {
        clearTimeout(timer);
        if (code === 0) {
          resolve(stdout);
        } else {
          // Never include inputData in the error — it may contain credentials
          reject(new Error(`Command exited ${code}: ${stderr || stdout}`));
        }
      });

      stream.on('data',        (d) => { stdout += d; });
      stream.stderr.on('data', (d) => { stderr += d; });

      // Write SQL to stdin and close — this is the only place the credential travels
      stream.stdin.write(inputData);
      stream.stdin.end();
    });
  });
}

// ── Step 2: MySQL database + user setup ───────────────────────────────────────

/**
 * Create the MySQL database and WordPress user on a provisioned droplet.
 *
 * Call this once `servers.status = 'running'` (IP polling done).
 * On success, advances `wordpress_sites.status` → 'installing' so the
 * WordPress installation step (Step 3) knows it can proceed.
 *
 * Security notes:
 *  - Root SSH password and DB password are decrypted in-memory, never logged.
 *  - SQL is piped to mysql's stdin — credentials are never CLI arguments.
 *  - Binary logging is disabled for the CREATE USER statement so the password
 *    doesn't land in MySQL's binary log on the remote server.
 *  - dbName and dbUser are regex-validated before interpolation (defence in depth;
 *    they were generated by us, but validate regardless).
 *
 * @param {number} wpSiteId - `wordpress_sites.id`
 */
async function setupWordPressDatabase(wpSiteId) {
  // ── Fetch records ───────────────────────────────────────────────────────────
  const result = await pool.query(
    `SELECT ws.id, ws.db_name, ws.db_user,
            ws.encrypted_db_password, ws.encrypted_db_password_iv,
            s.ip_address, s.ssh_password, s.ssh_password_iv
     FROM wordpress_sites ws
     JOIN servers s ON s.id = ws.server_id
     WHERE ws.id = $1`,
    [wpSiteId]
  );

  if (!result.rows.length) {
    throw new Error(`[WP-DB] wordpress_sites record not found: ${wpSiteId}`);
  }

  const wp = result.rows[0];

  // ── Validate IP address before SSH or decryption ───────────────────────────
  const net = require('net');
  if (!wp.ip_address || net.isIP(wp.ip_address) === 0) {
    throw new Error(`[WP-DB] Refusing to proceed — invalid or missing ip_address: ${wp.ip_address}`);
  }

  // ── Validate identifiers before SQL interpolation ───────────────────────────
  // These were generated by us (wp_<8 hex chars>, wpuser_<6 hex chars>) but
  // validate strictly to prevent injection if a record is ever tampered with.
  if (!/^wp_[a-f0-9]{8}$/.test(wp.db_name)) {
    throw new Error(`[WP-DB] Refusing to proceed — unexpected db_name format`);
  }
  if (!/^wpuser_[a-f0-9]{6}$/.test(wp.db_user)) {
    throw new Error(`[WP-DB] Refusing to proceed — unexpected db_user format`);
  }

  // ── Decrypt credentials (in-memory only, never logged) ─────────────────────
  const rootPassword = decrypt(wp.ssh_password,             wp.ssh_password_iv);
  const dbPassword   = decrypt(wp.encrypted_db_password,    wp.encrypted_db_password_iv);

  // ── Build SQL — password injected here, not on the CLI ─────────────────────
  // Single-quoted MySQL string is safe: generateSecurePassword() is [a-zA-Z0-9]
  // so no single-quote escaping is needed. Backtick-quoted identifiers are
  // injection-safe given the regex validation above.
  const sql = [
    'SET sql_log_bin = 0;', // keep password out of MySQL binary log
    `CREATE DATABASE IF NOT EXISTS \`${wp.db_name}\``,
    `  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
    `CREATE USER IF NOT EXISTS '${wp.db_user}'@'localhost' IDENTIFIED BY '${dbPassword}';`,
    `GRANT ALL PRIVILEGES ON \`${wp.db_name}\`.* TO '${wp.db_user}'@'localhost';`,
    'FLUSH PRIVILEGES;',
    'SET sql_log_bin = 1;',
  ].join('\n');

  // ── Connect + execute ───────────────────────────────────────────────────────
  let conn;
  try {
    conn = await sshConnect(wp.ip_address, rootPassword);
    console.log(`[WP-DB] SSH connected to ${wp.ip_address} for site ${wpSiteId}`);

    // MySQL root uses auth_socket on Ubuntu 22.04 — no -p flag needed
    await execSSHWithInput(conn, 'mysql -u root', sql);
    console.log(`[WP-DB] Database and user created for site ${wpSiteId}`);

    // Advance status so Step 3 (WordPress installation) can begin
    await pool.query(
      `UPDATE wordpress_sites
          SET status = 'installing',
              status_message = 'Database ready. Starting WordPress installation.',
              updated_at = NOW()
        WHERE id = $1`,
      [wpSiteId]
    );

  } catch (err) {
    // Log the error message only — never log rootPassword or dbPassword
    console.error(`[WP-DB] Database setup failed for site ${wpSiteId}:`, err.message);

    await pool.query(
      `UPDATE wordpress_sites
          SET status = 'error',
              status_message = $1,
              updated_at = NOW()
        WHERE id = $2`,
      [`Database setup failed: ${err.message}`, wpSiteId]
    );

    throw err;
  } finally {
    if (conn) conn.end();
  }
}

// ── Step 3 Part 2: Nginx virtual host + SSL ───────────────────────────────────

/**
 * Generate a hardened Nginx virtual host config for a WordPress site.
 *
 * Security notes:
 *  - wp-config.php, xmlrpc.php, readme, license all blocked with `deny all`.
 *  - PHP execution inside wp-content/uploads is blocked (prevents webshell upload).
 *  - Hidden files (.htaccess, .git, etc.) denied.
 *  - Security response headers added.
 *
 * @param {string} serverName - validated IPv4 address or domain (e.g. 'example.com')
 * @returns {string} nginx config file content
 */
function generateNginxWpConfig(serverName) {
  // Build without template literals for the nginx $variable portions —
  // avoids any risk of JS interpolating $uri, $args, $request_uri, etc.
  return (
    'server {\n' +
    '    listen 80;\n' +
    `    server_name ${serverName};\n\n` +
    '    root  /var/www/wordpress;\n' +
    '    index index.php;\n\n' +
    '    # WordPress pretty permalinks\n' +
    '    location / {\n' +
    '        try_files $uri $uri/ /index.php?$args;\n' +
    '    }\n\n' +
    '    # PHP via FPM\n' +
    '    location ~ \\.php$ {\n' +
    '        include snippets/fastcgi-php.conf;\n' +
    '        fastcgi_pass unix:/run/php/php8.3-fpm.sock;\n' +
    '        fastcgi_read_timeout 300;\n' +
    '    }\n\n' +
    '    # ── Security blocks ──────────────────────────────────────\n' +
    '    location = /wp-config.php                    { deny all; }\n' +
    '    location = /xmlrpc.php                       { deny all; }\n' +
    '    location = /readme.html                      { deny all; }\n' +
    '    location = /license.txt                      { deny all; }\n' +
    '    location ~ /\\.                               { deny all; }\n' +
    '    # Block PHP execution inside uploads (webshell prevention)\n' +
    '    location ~* ^/wp-content/uploads/.*\\.php$   { deny all; }\n\n' +
    '    # ── Security headers ─────────────────────────────────────\n' +
    '    add_header X-Frame-Options       SAMEORIGIN;\n' +
    '    add_header X-Content-Type-Options nosniff;\n' +
    '    add_header Referrer-Policy       strict-origin-when-cross-origin;\n' +
    '}\n'
  );
}

/**
 * Write the Nginx virtual host, enable it, reload Nginx, and mark the site live.
 *
 * If `wordpress_sites.domain` is already set, it is used as server_name.
 * Otherwise the server's IP address is used and can be replaced later when
 * the user adds a custom domain.
 *
 * @param {number} wpSiteId
 */
async function configureWordPressNginx(wpSiteId) {
  const result = await pool.query(
    `SELECT ws.id, ws.domain,
            s.ip_address, s.ssh_password, s.ssh_password_iv
     FROM wordpress_sites ws
     JOIN servers s ON s.id = ws.server_id
     WHERE ws.id = $1`,
    [wpSiteId]
  );

  if (!result.rows.length) {
    throw new Error(`[WP-NGINX] Site not found: ${wpSiteId}`);
  }
  const wp = result.rows[0];

  // Determine server_name: prefer domain if set, else fall back to IP
  const net = require('net');
  let serverName;
  if (wp.domain) {
    // Validate domain format before embedding in config
    if (!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(wp.domain)) {
      throw new Error(`[WP-NGINX] Refusing — invalid domain format: ${wp.domain}`);
    }
    serverName = wp.domain;
  } else {
    if (net.isIP(wp.ip_address) === 0) {
      throw new Error(`[WP-NGINX] Refusing — invalid IP address: ${wp.ip_address}`);
    }
    serverName = wp.ip_address;
  }

  const rootPassword = decrypt(wp.ssh_password, wp.ssh_password_iv);
  const nginxConfig  = generateNginxWpConfig(serverName);
  const confPath     = '/etc/nginx/sites-available/wordpress';

  let conn;
  try {
    conn = await sshConnect(wp.ip_address, rootPassword);
    console.log(`[WP-NGINX] SSH connected to ${wp.ip_address} for site ${wpSiteId}`);

    // Write config via stdin — serverName is validated above, never a raw user string
    await execSSHWithInput(conn, `cat > ${confPath}`, nginxConfig);

    // Enable site, remove default placeholder, test, reload
    await execSSH(conn, [
      `ln -sf ${confPath} /etc/nginx/sites-enabled/wordpress`,
      'rm -f /etc/nginx/sites-enabled/default',
      'nginx -t',                 // aborts pipeline if config is invalid
      'systemctl reload nginx',
    ].join(' && '));

    console.log(`[WP-NGINX] Nginx configured with server_name: ${serverName}`);

    // Mark site live
    await pool.query(
      `UPDATE wordpress_sites
          SET status         = 'live',
              domain         = COALESCE(domain, $1),
              status_message = 'Site is live at http://' || $1,
              ssl_enabled    = false,
              updated_at     = NOW()
        WHERE id = $2`,
      [serverName, wpSiteId]
    );

    console.log(`[WP-NGINX] Site ${wpSiteId} is LIVE at http://${serverName}`);

  } catch (err) {
    console.error(`[WP-NGINX] Failed for site ${wpSiteId}:`, err.message);
    await pool.query(
      `UPDATE wordpress_sites
          SET status = 'error', status_message = $1, updated_at = NOW()
        WHERE id = $2`,
      [`Nginx configuration failed: ${err.message}`, wpSiteId]
    );
    throw err;
  } finally {
    if (conn) conn.end();
  }
}

// ── Provisioning orchestrator ─────────────────────────────────────────────────

/**
 * Run the full post-droplet provisioning pipeline in sequence:
 *   setupWordPressDatabase → installWordPress → configureWordPressNginx
 *
 * Called by watchForServerRunning once servers.status = 'running'.
 * Each step updates wordpress_sites.status so progress is visible in the UI.
 *
 * @param {number} wpSiteId
 */
async function provisionWordPressSite(wpSiteId) {
  console.log(`[WP-PROVISION] Starting full pipeline for site ${wpSiteId}`);
  try {
    await setupWordPressDatabase(wpSiteId);
    await installWordPress(wpSiteId);
    await configureWordPressNginx(wpSiteId);
    console.log(`[WP-PROVISION] Pipeline complete — site ${wpSiteId} is live`);
  } catch (err) {
    // Each step already wrote 'error' status — just log here for traceability
    console.error(`[WP-PROVISION] Pipeline failed for site ${wpSiteId}:`, err.message);
  }
}

/**
 * Poll the servers table until status = 'running', then fire provisionWordPressSite.
 *
 * This bridges the gap between pollDropletStatus (which only knows about the
 * servers table) and the WordPress provisioning pipeline (which needs the IP
 * to be live before SSHing in).
 *
 * Runs in the background — never awaited by the caller.
 *
 * @param {number} serverId
 * @param {number} wpSiteId
 */
async function watchForServerRunning(serverId, wpSiteId) {
  const maxAttempts = 40;   // ~40 × 15 s = 10 min ceiling
  const intervalMs  = 15000;

  for (let i = 1; i <= maxAttempts; i++) {
    try {
      const { rows } = await pool.query(
        `SELECT status FROM servers WHERE id = $1`,
        [serverId]
      );

      if (!rows.length) {
        console.error(`[WP-WATCH] Server ${serverId} not found — aborting watch`);
        return;
      }

      const { status } = rows[0];

      if (status === 'running') {
        console.log(`[WP-WATCH] Server ${serverId} is running — starting WP pipeline`);
        // Fire-and-forget: do not await, let the provisioning run in the background
        provisionWordPressSite(wpSiteId).catch(() => {});
        return;
      }

      if (status === 'failed' || status === 'deleted') {
        console.log(`[WP-WATCH] Server ${serverId} status=${status} — aborting watch`);
        await pool.query(
          `UPDATE wordpress_sites
              SET status = 'error', status_message = 'Droplet provisioning failed', updated_at = NOW()
            WHERE id = $1`,
          [wpSiteId]
        );
        return;
      }

      console.log(`[WP-WATCH] Server ${serverId} status=${status}, attempt ${i}/${maxAttempts}`);
    } catch (e) {
      console.error(`[WP-WATCH] Poll error on attempt ${i}:`, e.message);
    }

    if (i < maxAttempts) await new Promise(r => setTimeout(r, intervalMs));
  }

  console.error(`[WP-WATCH] Timed out waiting for server ${serverId} to reach 'running'`);
  await pool.query(
    `UPDATE wordpress_sites
        SET status = 'error', status_message = 'Timed out waiting for droplet', updated_at = NOW()
      WHERE id = $1`,
    [wpSiteId]
  ).catch(() => {});
}

// ── Exports ───────────────────────────────────────────────────────────────────
module.exports = {
  generateSecurePassword,
  getWordPressUserData,
  createWordPressServer,
  setupWordPressDatabase,
  installWordPress,
  configureWordPressNginx,
  provisionWordPressSite,
};
