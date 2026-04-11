'use strict';

// migrations/031-create-uptime-checks.js
// Creates uptime_checks table for per-site availability monitoring.
// Each row is one ping result. Alerts are derived from status transitions.

const pool = require('../db');

exports.up = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS uptime_checks (
        id              SERIAL PRIMARY KEY,
        user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        target_url      VARCHAR(500) NOT NULL,
        status          VARCHAR(10) NOT NULL CHECK (status IN ('up', 'down')),
        response_ms     INTEGER,
        error_message   TEXT,
        checked_at      TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_uptime_checks_user_id    ON uptime_checks (user_id);
      CREATE INDEX IF NOT EXISTS idx_uptime_checks_target_url ON uptime_checks (target_url, checked_at DESC);
    `);

    // Track last-known status per URL so we only email on transitions (up→down, down→up)
    await client.query(`
      CREATE TABLE IF NOT EXISTS uptime_status (
        id              SERIAL PRIMARY KEY,
        user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        target_url      VARCHAR(500) NOT NULL,
        last_status     VARCHAR(10) NOT NULL CHECK (last_status IN ('up', 'down')),
        last_checked_at TIMESTAMP NOT NULL DEFAULT NOW(),
        down_since      TIMESTAMP,
        alerted_down    BOOLEAN NOT NULL DEFAULT FALSE,
        UNIQUE (user_id, target_url)
      )
    `);

    await client.query('COMMIT');
    console.log('[MIGRATION 031] ✓ uptime_checks + uptime_status tables created');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[MIGRATION 031] ✗ Failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

exports.down = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DROP TABLE IF EXISTS uptime_checks');
    await client.query('DROP TABLE IF EXISTS uptime_status');
    await client.query('COMMIT');
    console.log('[MIGRATION 031] ✓ uptime tables dropped');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[MIGRATION 031] ✗ Rollback failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
};
