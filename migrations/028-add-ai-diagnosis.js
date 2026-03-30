'use strict';

// migrations/028-add-ai-diagnosis.js
// Adds ai_diagnosis column to deployments table for AI-generated failure analysis.

const pool = require('../db');

exports.up = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      ALTER TABLE deployments
      ADD COLUMN IF NOT EXISTS ai_diagnosis TEXT
    `);
    await client.query('COMMIT');
    console.log('[MIGRATION 028] ✓ deployments.ai_diagnosis added');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[MIGRATION 028] ✗ Failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

exports.down = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('ALTER TABLE deployments DROP COLUMN IF EXISTS ai_diagnosis');
    await client.query('COMMIT');
    console.log('[MIGRATION 028] ✓ deployments.ai_diagnosis dropped');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[MIGRATION 028] ✗ Rollback failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
};
