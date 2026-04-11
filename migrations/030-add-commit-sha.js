'use strict';

// migrations/030-add-commit-sha.js
// Adds commit_sha to deployments to enable true commit-level rollback.

const pool = require('../db');

exports.up = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      ALTER TABLE deployments
        ADD COLUMN IF NOT EXISTS commit_sha VARCHAR(40)
    `);
    await client.query('COMMIT');
    console.log('[MIGRATION 030] ✓ deployments.commit_sha added');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[MIGRATION 030] ✗ Failed:', err.message);
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
      ALTER TABLE deployments
        DROP COLUMN IF EXISTS commit_sha
    `);
    await client.query('COMMIT');
    console.log('[MIGRATION 030] ✓ commit_sha dropped');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[MIGRATION 030] ✗ Rollback failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
};
