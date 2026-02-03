require('dotenv').config();
const pool = require('../db');

async function addLinkedSubdomain() {
  try {
    // Add linked_subdomain column to domains table
    // This links a custom domain to a specific deployment's subdomain
    await pool.query(`
      ALTER TABLE domains 
      ADD COLUMN IF NOT EXISTS linked_subdomain VARCHAR(100)
    `);
    
    console.log('✅ Added linked_subdomain column to domains table');
    
    // Add foreign key constraint (optional - referencing deployments.subdomain)
    // We'll skip this since subdomain might not exist yet when adding domain
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

addLinkedSubdomain();
