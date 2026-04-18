const pool = require('../db');

exports.up = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS resource_alert_rules (
      id              SERIAL PRIMARY KEY,
      user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      metric          VARCHAR(20) NOT NULL CHECK (metric IN ('cpu', 'memory', 'disk')),
      threshold_pct   INTEGER NOT NULL CHECK (threshold_pct BETWEEN 1 AND 100),
      last_alerted_at TIMESTAMPTZ,
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (user_id, metric)
    )
  `);
  console.log('✓ Created resource_alert_rules table');
};

exports.down = async () => {
  await pool.query(`DROP TABLE IF EXISTS resource_alert_rules`);
};
