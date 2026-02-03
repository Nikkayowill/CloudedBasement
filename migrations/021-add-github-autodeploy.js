/**
 * Migration 021: Add GitHub auto-deploy columns to servers and domains tables
 * 
 * Purpose: Enable automatic deployment when code is pushed to GitHub
 * 
 * Servers table gets:
 * - github_webhook_secret: HMAC secret for verifying GitHub webhook signatures
 * - auto_deploy_enabled: Global toggle for server-wide auto-deploy (legacy)
 * 
 * Domains table gets:
 * - git_url: Repository URL for this specific domain
 * - auto_deploy_enabled: Per-domain auto-deploy toggle
 * - webhook_secret: Per-domain webhook secret
 * - last_deployed_at: Timestamp of last auto-deploy
 * - deployment_status: Current deploy state (pending/deploying/success/failed)
 */

const pool = require('../db');

async function up() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // === SERVERS TABLE ===
    // Server-wide webhook secret (for legacy single-site deployments)
    await client.query(`
      ALTER TABLE servers 
      ADD COLUMN IF NOT EXISTS github_webhook_secret VARCHAR(64)
    `);
    
    // Server-wide auto-deploy toggle
    await client.query(`
      ALTER TABLE servers 
      ADD COLUMN IF NOT EXISTS auto_deploy_enabled BOOLEAN DEFAULT false
    `);
    
    // === DOMAINS TABLE ===
    // Per-domain git repository URL
    await client.query(`
      ALTER TABLE domains 
      ADD COLUMN IF NOT EXISTS git_url VARCHAR(500)
    `);
    
    // Per-domain auto-deploy toggle
    await client.query(`
      ALTER TABLE domains 
      ADD COLUMN IF NOT EXISTS auto_deploy_enabled BOOLEAN DEFAULT false
    `);
    
    // Per-domain webhook secret for GitHub signature verification
    await client.query(`
      ALTER TABLE domains 
      ADD COLUMN IF NOT EXISTS webhook_secret VARCHAR(100)
    `);
    
    // Track when domain was last auto-deployed
    await client.query(`
      ALTER TABLE domains 
      ADD COLUMN IF NOT EXISTS last_deployed_at TIMESTAMP
    `);
    
    // Current deployment status (pending, deploying, success, failed)
    await client.query(`
      ALTER TABLE domains 
      ADD COLUMN IF NOT EXISTS deployment_status VARCHAR(50) DEFAULT 'pending'
    `);
    
    await client.query('COMMIT');
    console.log('✓ Migration 021: Added GitHub auto-deploy columns');
  } catch (error) {
    await client.query('ROLLBACK');
    // Ignore "column already exists" errors
    if (error.code === '42701') {
      console.log('Migration 021: Some columns already exist, continuing');
    } else {
      throw error;
    }
  } finally {
    client.release();
  }
}

async function down() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Servers
    await client.query('ALTER TABLE servers DROP COLUMN IF EXISTS github_webhook_secret');
    await client.query('ALTER TABLE servers DROP COLUMN IF EXISTS auto_deploy_enabled');
    
    // Domains
    await client.query('ALTER TABLE domains DROP COLUMN IF EXISTS git_url');
    await client.query('ALTER TABLE domains DROP COLUMN IF EXISTS auto_deploy_enabled');
    await client.query('ALTER TABLE domains DROP COLUMN IF EXISTS webhook_secret');
    await client.query('ALTER TABLE domains DROP COLUMN IF EXISTS last_deployed_at');
    await client.query('ALTER TABLE domains DROP COLUMN IF EXISTS deployment_status');
    
    await client.query('COMMIT');
    console.log('✓ Migration 021 rolled back');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { up, down };
