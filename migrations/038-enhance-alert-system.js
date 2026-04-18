// migrations/038-enhance-alert-system.js
// Adds state machine columns to resource_alert_rules,
// Slack/Discord webhook fields to servers, and creates alert_history table.

const pool = require('../db');

exports.up = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Add state tracking to resource_alert_rules
    await client.query(`
      ALTER TABLE resource_alert_rules
        ADD COLUMN IF NOT EXISTS state VARCHAR(12) NOT NULL DEFAULT 'armed',
        ADD COLUMN IF NOT EXISTS triggered_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS resolved_at  TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS snoozed_until TIMESTAMPTZ
    `);

    // Add notification channel fields to servers
    await client.query(`
      ALTER TABLE servers
        ADD COLUMN IF NOT EXISTS slack_webhook_url   TEXT,
        ADD COLUMN IF NOT EXISTS discord_webhook_url TEXT
    `);

    // Create alert_history table
    await client.query(`
      CREATE TABLE IF NOT EXISTS alert_history (
        id              SERIAL PRIMARY KEY,
        user_id         INTEGER NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
        server_id       INTEGER          REFERENCES servers(id)  ON DELETE SET NULL,
        rule_id         INTEGER          REFERENCES resource_alert_rules(id) ON DELETE SET NULL,
        metric          VARCHAR(20)  NOT NULL,
        threshold_pct   INTEGER      NOT NULL,
        peak_value      NUMERIC(5,2),
        event_type      VARCHAR(12)  NOT NULL CHECK (event_type IN ('triggered', 'resolved')),
        channels_notified TEXT[]     DEFAULT '{}',
        dismissed       BOOLEAN      NOT NULL DEFAULT FALSE,
        created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_alert_history_user
        ON alert_history(user_id, created_at DESC)
    `);

    await client.query('COMMIT');
    console.log('[MIGRATION 038] ✓ Alert system schema enhanced');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[MIGRATION 038] ✗ Error:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

exports.down = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Reverse ALTERs on resource_alert_rules
    await client.query(`
      ALTER TABLE resource_alert_rules
        DROP COLUMN IF EXISTS state,
        DROP COLUMN IF EXISTS triggered_at,
        DROP COLUMN IF EXISTS resolved_at,
        DROP COLUMN IF EXISTS snoozed_until
    `);

    // Reverse ALTERs on servers
    await client.query(`
      ALTER TABLE servers
        DROP COLUMN IF EXISTS slack_webhook_url,
        DROP COLUMN IF EXISTS discord_webhook_url
    `);

    // Drop alert_history table (and its index cascades automatically)
    await client.query('DROP TABLE IF EXISTS alert_history');

    await client.query('COMMIT');
    console.log('[MIGRATION 038] ✓ Rolled back alert system schema');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[MIGRATION 038] ✗ Rollback error:', err.message);
    throw err;
  } finally {
    client.release();
  }
};
