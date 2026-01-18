require('dotenv').config();
const pool = require('../db');

async function addEmailConfirmationColumns() {
  const query = `
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS email_token VARCHAR(255),
    ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP;
  `;
  
  try {
    await pool.query(query);
    console.log('✓ Email confirmation columns added successfully');
  } catch (error) {
    console.error('Error adding email confirmation columns:', error);
  } finally {
    pool.end();
  }
}

addEmailConfirmationColumns();
