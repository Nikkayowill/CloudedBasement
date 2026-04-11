const pool = require('../db');

async function up() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id           SERIAL PRIMARY KEY,
        user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name         VARCHAR(100) NOT NULL,
        key_hash     VARCHAR(64) NOT NULL UNIQUE,
        key_prefix   VARCHAR(12) NOT NULL,
        scopes       TEXT[] NOT NULL DEFAULT '{}',
        last_used_at TIMESTAMPTZ,
        expires_at   TIMESTAMPTZ,
        is_active    BOOLEAN NOT NULL DEFAULT TRUE,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_api_keys_user_id  ON api_keys(user_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash)
    `);
    console.log('[MIGRATION] ✓ api_keys table ready');
  } finally {
    client.release();
  }
}

module.exports = { up };
