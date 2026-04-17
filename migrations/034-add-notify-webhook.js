const pool = require('../db');

exports.up = async () => {
  try {
    await pool.query('BEGIN');
    await pool.query(`
      ALTER TABLE servers
      ADD COLUMN IF NOT EXISTS notify_webhook_url TEXT
    `);
    await pool.query('COMMIT');
    console.log('✓ Added servers.notify_webhook_url');
  } catch (err) {
    await pool.query('ROLLBACK');
    throw err;
  }
};

exports.down = async () => {
  await pool.query(`ALTER TABLE servers DROP COLUMN IF EXISTS notify_webhook_url`);
};
