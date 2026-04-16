require('dotenv').config();
const pool = require('../db');

/**
 * Migration 033: Add CHECK constraint on server_updates.status
 *
 * Enforces the status state machine at the database level so invalid
 * status values cannot be inserted even if application code has a bug.
 */
exports.up = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Add CHECK constraint if it doesn't already exist
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'server_updates_status_check'
        ) THEN
          ALTER TABLE server_updates
            ADD CONSTRAINT server_updates_status_check
            CHECK (status IN ('draft', 'tested', 'released', 'archived'));
        END IF;
      END $$;
    `);

    // A hard NOT NULL on script_hash would break pre-existing rows without a hash.
    // Use a partial index instead — gives fast lookups while leaving old nulls intact.
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_server_updates_script_hash
        ON server_updates (script_hash)
        WHERE script_hash IS NOT NULL
    `);

    await client.query('COMMIT');
    console.log('✓ Added server_updates status CHECK constraint');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('✗ Migration 033 failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

exports.down = async () => {
  await pool.query(`ALTER TABLE server_updates DROP CONSTRAINT IF EXISTS server_updates_status_check`);
  await pool.query(`DROP INDEX IF EXISTS idx_server_updates_script_hash`);
  console.log('✓ Dropped server_updates status CHECK constraint');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`ALTER TABLE server_updates DROP CONSTRAINT IF EXISTS server_updates_status_check`);
    await client.query(`DROP INDEX IF EXISTS idx_server_updates_script_hash`);
    await client.query('COMMIT');
    console.log('\u2713 Dropped server_updates status CHECK constraint and idx_server_updates_script_hash index');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\u2717 Migration 033 down failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
};
