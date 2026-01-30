const pool = require('../db');

async function up() {
  await pool.query(`
    ALTER TABLE servers 
    ADD COLUMN IF NOT EXISTS droplet_name VARCHAR(255);
  `);
  console.log('Migration 011: Added droplet_name column to servers table');
}

async function down() {
  await pool.query(`
    ALTER TABLE servers 
    DROP COLUMN IF EXISTS droplet_name;
  `);
  console.log('Migration 011 (rollback): Removed droplet_name column from servers table');
}

module.exports = { up, down };
