'use strict';

// migrations/026-add-wordpress-sites.js
// Adds the wordpress_sites table and a server_type discriminator on servers.
//
// wordpress_sites — one row per WordPress deployment.
//   - Stores WP admin credentials, MySQL credentials, status, and install log.
//   - server_id FK → servers(id): the DigitalOcean droplet running this site.
//   - Credentials are stored the same way as ssh_password in the servers table
//     (plain text, transport protected by HTTPS).
//
// servers.server_type — 'nodejs' (default) or 'wordpress'.
//   - Lets the dashboard render different UI per server type without a JOIN.

const pool = require('../db');

exports.up = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ── 1. Add server_type discriminator to servers ───────────────────────────
    // Safe to run twice: ADD COLUMN IF NOT EXISTS is idempotent.
    await client.query(`
      ALTER TABLE servers
        ADD COLUMN IF NOT EXISTS server_type VARCHAR(20) DEFAULT 'nodejs'
          CHECK (server_type IN ('nodejs', 'wordpress'))
    `);
    console.log('[MIGRATION 026] ✓ servers.server_type added');

    // ── 2. Create wordpress_sites ─────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS wordpress_sites (
        id          SERIAL PRIMARY KEY,

        -- Ownership
        user_id     INTEGER NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
        server_id   INTEGER NOT NULL REFERENCES servers(id) ON DELETE CASCADE,

        -- Domain (null until user assigns one or we provision a temp subdomain)
        domain      VARCHAR(255),

        -- WordPress application
        site_title      VARCHAR(255) NOT NULL,
        admin_user      VARCHAR(100) NOT NULL DEFAULT 'wpadmin',
        admin_email     VARCHAR(255) NOT NULL,
        admin_password  VARCHAR(255) NOT NULL,

        -- MySQL credentials (for the WP database on this droplet)
        db_name     VARCHAR(100) NOT NULL,
        db_user     VARCHAR(100) NOT NULL,
        db_password VARCHAR(255) NOT NULL,

        -- Lifecycle status
        -- provisioning : droplet is being created (user-data script running)
        -- installing   : droplet is up, wp-cli is installing WordPress
        -- configuring  : setting Nginx vhost + SSL
        -- live         : site is publicly reachable
        -- error        : something failed — see status_message / install_log
        status         VARCHAR(20) NOT NULL DEFAULT 'provisioning'
          CHECK (status IN ('provisioning', 'installing', 'configuring', 'live', 'error')),
        status_message TEXT,    -- short human-readable description of current step
        install_log    TEXT,    -- cumulative output from provisioning + wp-cli

        -- SSL
        ssl_enabled    BOOLEAN   DEFAULT FALSE,
        ssl_expires_at TIMESTAMP,

        -- Metadata set after WordPress is installed
        wp_version  VARCHAR(20),

        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('[MIGRATION 026] ✓ wordpress_sites table created');

    // ── 3. Indexes ────────────────────────────────────────────────────────────
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_wordpress_sites_user_id
        ON wordpress_sites(user_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_wordpress_sites_server_id
        ON wordpress_sites(server_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_wordpress_sites_status
        ON wordpress_sites(status)
    `);
    console.log('[MIGRATION 026] ✓ Indexes created');

    await client.query('COMMIT');
    console.log('[MIGRATION 026] ✓ Complete');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[MIGRATION 026] ✗ Failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

exports.down = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query('DROP TABLE IF EXISTS wordpress_sites CASCADE');
    console.log('[MIGRATION 026] ✓ wordpress_sites dropped');

    await client.query(`
      ALTER TABLE servers DROP COLUMN IF EXISTS server_type
    `);
    console.log('[MIGRATION 026] ✓ servers.server_type dropped');

    await client.query('COMMIT');
    console.log('[MIGRATION 026] ✓ Rollback complete');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[MIGRATION 026] ✗ Rollback failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
};
