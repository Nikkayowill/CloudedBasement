'use strict';

// migrations/029-add-branch-to-deployments.js
// Adds branch and is_preview columns to deployments for preview deployment support.

const pool = require('../db');

exports.up = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      ALTER TABLE deployments
        ADD COLUMN IF NOT EXISTS branch       VARCHAR(255),
        ADD COLUMN IF NOT EXISTS is_preview   BOOLEAN NOT NULL DEFAULT FALSE
    `);
    await client.query('COMMIT');
    console.log('[MIGRATION 029] ✓ deployments.branch + is_preview added');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[MIGRATION 029] ✗ Failed:', err.message);
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
        DROP COLUMN IF EXISTS branch,
        DROP COLUMN IF EXISTS is_preview
    `);
    await client.query('COMMIT');
    console.log('[MIGRATION 029] ✓ branch + is_preview dropped');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[MIGRATION 029] ✗ Rollback failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
};
