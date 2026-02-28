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
const { encrypt }             = require('../src/utils/encryption');
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
    await pool.query(
      `INSERT INTO wordpress_sites
         (user_id, server_id, site_title, admin_user, admin_email,
          encrypted_admin_password, encrypted_admin_password_iv,
          db_name, db_user,
          encrypted_db_password, encrypted_db_password_iv,
          status)
       VALUES ($1, $2, $3, 'wpadmin', $4, $5, $6, $7, $8, $9, $10, 'provisioning')`,
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
    console.log(`[WP] wordpress_sites record created (server ${serverRow.id})`);

    // ── Start IP polling ──────────────────────────────────────────────────
    // pollDropletStatus updates servers.ip_address + status to 'running'
    // once the droplet becomes active. WordPress installation (Step 2) waits
    // for status = 'running' before SSHing in.
    pollDropletStatus(droplet.id, serverRow.id);

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

// ── Exports ───────────────────────────────────────────────────────────────────
module.exports = {
  generateSecurePassword,
  getWordPressUserData,
  createWordPressServer,
};
