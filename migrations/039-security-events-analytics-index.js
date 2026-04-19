// migrations/039-security-events-analytics-index.js
// Adds composite indexes to security_events to speed up analytics queries.
//
// The analytics service runs up to 7 queries per request, all of which filter
// on created_at plus one or more of (event_type, ip_address, email).
// The existing single-column indexes handle each dimension individually;
// these composite indexes eliminate a second filter pass for the most common
// query patterns (time-window + event_type).
//
// Skips gracefully if security_events does not exist (older deployments that
// haven't created the table yet will not be broken by this migration).

const pool = require('../db');

exports.up = async () => {
  const client = await pool.connect();
  try {
    const tableCheck = await client.query(`
      SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = 'security_events'
    `);
    if (tableCheck.rows.length === 0) {
      console.log('[MIGRATION 039] \u2139 security_events table not found \u2014 skipping index creation');
      return;
    }

    // Primary analytics index: covers WHERE event_type = ? AND created_at > ?
    // Also used by GROUP BY (event_type, created_at) trend queries.
    await client.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_events_type_created
        ON security_events (event_type, created_at DESC)
    `);

    // Covers WHERE email IS NOT NULL AND created_at > ? GROUP BY email
    await client.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_events_email_created
        ON security_events (email, created_at DESC)
        WHERE email IS NOT NULL
    `);
    console.log('[MIGRATION 039] \u2713 security_events composite analytics indexes created');
  } catch (err) {
    console.error('[MIGRATION 039] \u2717 Error:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

exports.down = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DROP INDEX IF EXISTS idx_security_events_type_created');
    await client.query('DROP INDEX IF EXISTS idx_security_events_email_created');
    await client.query('COMMIT');
    console.log('[MIGRATION 039] \u2713 Rolled back security_events composite indexes');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[MIGRATION 039] \u2717 Rollback error:', err.message);
    throw err;
  } finally {
    client.release();
  }
};
