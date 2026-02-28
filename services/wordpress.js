'use strict';

// services/wordpress.js
// WordPress provisioning service.
// This file owns the user-data cloud-init script that turns a raw Ubuntu 22.04
// droplet into a WordPress-ready server (Nginx + PHP 8.3-FPM + MySQL 8.0 + wp-cli).
//
// Intentionally separate from digitalocean.js so WordPress provisioning
// logic doesn't pollute the core droplet management code.

const crypto = require('crypto');

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

// ── Exports ───────────────────────────────────────────────────────────────────
module.exports = {
  generateSecurePassword,
  getWordPressUserData,
};
