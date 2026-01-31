const pool = require('../db');

async function up() {
  const client = await pool.connect();
  try {
    // Add payment_interval and site_limit columns to servers table
    await client.query(`
      ALTER TABLE servers 
      ADD COLUMN IF NOT EXISTS payment_interval VARCHAR(20) DEFAULT 'monthly' CHECK (payment_interval IN ('monthly', 'yearly')),
      ADD COLUMN IF NOT EXISTS site_limit INTEGER NOT NULL DEFAULT 2
    `);

    // Set site limits based on plan
    await client.query(`
      UPDATE servers 
      SET site_limit = CASE 
        WHEN plan = 'basic' THEN 2
        WHEN plan IN ('priority', 'pro') THEN 5
        WHEN plan = 'premium' THEN 10
        WHEN plan = 'founder' THEN 10
        ELSE 2
      END
    `);
    
    console.log('✅ Added payment_interval and site_limit columns to servers table');
  } catch (error) {
    console.error('❌ Migration 014 failed:', error.message);
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
      DROP COLUMN IF EXISTS payment_interval,
      DROP COLUMN IF EXISTS site_limit
    `);

    console.log('✅ Removed payment_interval and site_limit columns from servers table');
  } catch (error) {
    console.error('❌ Rollback 014 failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { up, down };
