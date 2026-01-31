const pool = require('../db');

async function up() {
  const client = await pool.connect();
  try {
    // Check if column already exists
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'servers' 
      AND column_name = 'ipv6_address'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('✅ Column ipv6_address already exists, skipping migration');
      return;
    }

    // Add ipv6_address column to servers table
    await client.query(`
      ALTER TABLE servers 
      ADD COLUMN ipv6_address VARCHAR(45)
    `);

    console.log('✅ Added ipv6_address column to servers table');
  } catch (error) {
    console.error('❌ Migration 013 failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

async function down() {
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE servers 
      DROP COLUMN IF EXISTS ipv6_address
    `);

    console.log('✅ Removed ipv6_address column from servers table');
  } catch (error) {
    console.error('❌ Rollback 013 failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { up, down };
