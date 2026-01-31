const pool = require('../db');

async function up() {
  const client = await pool.connect();
  try {
    // Update plan CHECK constraint to use 'pro' instead of 'priority'
    await client.query(`
      ALTER TABLE servers 
      DROP CONSTRAINT IF EXISTS servers_plan_check
    `);

    await client.query(`
      ALTER TABLE servers 
      ADD CONSTRAINT servers_plan_check 
      CHECK (plan IN ('basic', 'pro', 'premium', 'founder'))
    `);

    // Rename existing 'priority' plans to 'pro'
    await client.query(`
      UPDATE servers 
      SET plan = 'pro' 
      WHERE plan = 'priority'
    `);
    
    console.log('✅ Renamed priority plan to pro');
  } catch (error) {
    console.error('❌ Migration 015 failed:', error.message);
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
      DROP CONSTRAINT IF EXISTS servers_plan_check
    `);

    await client.query(`
      ALTER TABLE servers 
      ADD CONSTRAINT servers_plan_check 
      CHECK (plan IN ('basic', 'priority', 'premium', 'founder'))
    `);

    await client.query(`
      UPDATE servers 
      SET plan = 'priority' 
      WHERE plan = 'pro'
    `);

    console.log('✅ Reverted pro plan to priority');
  } catch (error) {
    console.error('❌ Rollback 015 failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { up, down };
