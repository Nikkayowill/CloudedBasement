const pool = require('../db');

async function up() {
  await pool.query(`
    ALTER TABLE servers 
    ADD COLUMN IF NOT EXISTS trial_warning_sent BOOLEAN DEFAULT FALSE
  `);
  console.log('[Migration 019] Added trial_warning_sent column to servers');
}

async function down() {
  await pool.query(`
    ALTER TABLE servers DROP COLUMN IF EXISTS trial_warning_sent
  `);
}

module.exports = { up, down };
