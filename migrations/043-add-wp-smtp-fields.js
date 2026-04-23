// migrations/043-add-wp-smtp-fields.js
// Adds SMTP configuration columns to wordpress_sites.
// These are populated by the /api/wordpress/configure-smtp/:siteId endpoint
// when a user configures outbound email for their WordPress site.

'use strict';

const pool = require('../db');

exports.up = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      ALTER TABLE wordpress_sites
        ADD COLUMN IF NOT EXISTS smtp_configured            BOOLEAN NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS smtp_host                  TEXT,
        ADD COLUMN IF NOT EXISTS smtp_port                  INTEGER,
        ADD COLUMN IF NOT EXISTS smtp_from                  TEXT,
        ADD COLUMN IF NOT EXISTS smtp_user                  TEXT,
        ADD COLUMN IF NOT EXISTS encrypted_smtp_password    BYTEA,
        ADD COLUMN IF NOT EXISTS encrypted_smtp_password_iv BYTEA
    `);
    await client.query('COMMIT');
    console.log('[Migration 043] wordpress_sites SMTP columns added');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

exports.down = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      ALTER TABLE wordpress_sites
        DROP COLUMN IF EXISTS smtp_configured,
        DROP COLUMN IF EXISTS smtp_host,
        DROP COLUMN IF EXISTS smtp_port,
        DROP COLUMN IF EXISTS smtp_from,
        DROP COLUMN IF EXISTS smtp_user,
        DROP COLUMN IF EXISTS encrypted_smtp_password,
        DROP COLUMN IF EXISTS encrypted_smtp_password_iv
    `);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
