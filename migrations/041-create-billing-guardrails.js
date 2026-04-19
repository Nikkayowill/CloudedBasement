// migrations/041-create-billing-guardrails.js
// Creates billing_guardrails (per-user spend thresholds) and
// billing_threshold_sent (deduplication — one alert per threshold per cycle).

'use strict';

const pool = require('../db');

exports.up = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS billing_guardrails (
        id              SERIAL PRIMARY KEY,
        user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        monthly_limit   NUMERIC(10,2),
        warn_at_percent INTEGER DEFAULT 80 CHECK (warn_at_percent BETWEEN 1 AND 99),
        enabled         BOOLEAN NOT NULL DEFAULT TRUE,
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS billing_threshold_sent (
        id              SERIAL PRIMARY KEY,
        user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        cycle           TEXT    NOT NULL,
        threshold_pct   INTEGER NOT NULL,
        sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (user_id, cycle, threshold_pct)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_billing_threshold_sent_user_cycle
        ON billing_threshold_sent (user_id, cycle)
    `);

    await client.query('COMMIT');
    console.log('[MIGRATION 041] ✓ billing_guardrails and billing_threshold_sent tables created');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[MIGRATION 041] ✗ Error:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

exports.down = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DROP TABLE IF EXISTS billing_threshold_sent CASCADE');
    await client.query('DROP TABLE IF EXISTS billing_guardrails CASCADE');
    await client.query('COMMIT');
    console.log('[MIGRATION 041] ✓ billing guardrail tables dropped');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[MIGRATION 041] ✗ Rollback error:', err.message);
    throw err;
  } finally {
    client.release();
  }
};
