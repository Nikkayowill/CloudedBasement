// migrations/040-create-restore-jobs.js
// Creates the restore_jobs table for tracking backup restore attempts.
//
// Each row represents one restore attempt. The idempotency_key prevents
// duplicate submissions from concurrent clicks.

'use strict';

const pool = require('../db');

exports.up = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS restore_jobs (
        id               SERIAL PRIMARY KEY,
        user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        server_id        INTEGER NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
        backup_file      TEXT    NOT NULL,
        db_type          TEXT    NOT NULL CHECK (db_type IN ('postgres', 'mongodb')),
        status           TEXT    NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'running', 'success', 'failed')),
        error_message    TEXT,
        idempotency_key  TEXT    NOT NULL UNIQUE,
        initiated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        started_at       TIMESTAMPTZ,
        finished_at      TIMESTAMPTZ
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_restore_jobs_user_id
        ON restore_jobs (user_id, initiated_at DESC)
    `);
    await client.query('COMMIT');
    console.log('[MIGRATION 040] ✓ restore_jobs table created');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[MIGRATION 040] ✗ Error:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

exports.down = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DROP TABLE IF EXISTS restore_jobs CASCADE');
    await client.query('COMMIT');
    console.log('[MIGRATION 040] ✓ restore_jobs table dropped');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[MIGRATION 040] ✗ Rollback error:', err.message);
    throw err;
  } finally {
    client.release();
  }
};
