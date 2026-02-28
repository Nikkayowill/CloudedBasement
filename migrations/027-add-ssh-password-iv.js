// migrations/027-add-ssh-password-iv.js
// Adds ssh_password_iv column to servers table for encrypted SSH password IV storage.

'use strict';

const pool = require('../db');

exports.up = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      ALTER TABLE servers
      ADD COLUMN IF NOT EXISTS ssh_password_iv BYTEA
    `);
    await client.query('COMMIT');
    console.log('[MIGRATION 027] ✓ servers.ssh_password_iv added');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[MIGRATION 027] ✗ Failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

exports.down = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('ALTER TABLE servers DROP COLUMN IF EXISTS ssh_password_iv');
    await client.query('COMMIT');
    console.log('[MIGRATION 027] ✓ servers.ssh_password_iv dropped');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[MIGRATION 027] ✗ Rollback failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
};
