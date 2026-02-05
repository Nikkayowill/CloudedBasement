// Migration: Add Google OAuth columns to users table
const pool = require('../db');

async function up() {
  console.log('Running migration: add-google-oauth');
  
  // Add google_id column for OAuth users
  await pool.query(`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE,
    ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'local'
  `);
  
  // Create index for faster Google ID lookups
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)
  `);
  
  console.log('Migration complete: add-google-oauth');
}

async function down() {
  await pool.query(`
    ALTER TABLE users 
    DROP COLUMN IF EXISTS google_id,
    DROP COLUMN IF EXISTS auth_provider
  `);
  
  await pool.query(`DROP INDEX IF EXISTS idx_users_google_id`);
}

module.exports = { up, down };
