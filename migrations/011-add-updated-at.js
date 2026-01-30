require('dotenv').config();
const pool = require('../db');

async function addUpdatedAtColumn() {
  try {
    await pool.query(`
      ALTER TABLE servers
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);
    console.log('Added updated_at column to servers table');
    
    // Set updated_at to created_at for existing records
    await pool.query(`
      UPDATE servers SET updated_at = created_at WHERE updated_at IS NULL;
    `);
    console.log('Set updated_at for existing servers');
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding updated_at column:', error);
    process.exit(1);
  }
}

addUpdatedAtColumn();
