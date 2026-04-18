// migrations/037-create-server-metrics-history.js
// Creates server_metrics_history table for storing CPU, memory, and disk metrics
// over time for graphing and trend analysis.

const pool = require('../db');

exports.up = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS server_metrics_history (
        id SERIAL PRIMARY KEY,
        server_id INTEGER NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
        cpu_percent NUMERIC(5,2),
        memory_percent NUMERIC(5,2),
        disk_percent NUMERIC(5,2),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create indexes for efficient querying
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_metrics_server_timestamp 
      ON server_metrics_history(server_id, timestamp DESC);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_metrics_user_timestamp 
      ON server_metrics_history(user_id, timestamp DESC);
    `);

    console.log('[MIGRATION 037] ✓ server_metrics_history table created with indexes');
  } catch (err) {
    console.error('[MIGRATION 037] ✗ Error:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

exports.down = async () => {
  const client = await pool.connect();
  try {
    await client.query('DROP TABLE IF EXISTS server_metrics_history');
    console.log('[MIGRATION 037] ✓ server_metrics_history table dropped');
  } catch (err) {
    console.error('[MIGRATION 037] ✗ Error:', err.message);
    throw err;
  } finally {
    client.release();
  }
};
