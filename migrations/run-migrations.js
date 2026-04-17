const pool = require('../db');

/**
 * Auto-run migrations on application startup
 * Checks if columns exist before adding them (idempotent)
 */
async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('[MIGRATION] Checking database schema...');
    
    // Check if postgres_installed and mongodb_installed columns exist
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'servers' 
      AND column_name IN ('postgres_installed', 'mongodb_installed')
    `);
    
    const existingColumns = columnCheck.rows.map(row => row.column_name);
    const needsPostgres = !existingColumns.includes('postgres_installed');
    const needsMongodb = !existingColumns.includes('mongodb_installed');
    
    if (needsPostgres || needsMongodb) {
      console.log('[MIGRATION] Adding missing database columns...');
      
      await client.query('BEGIN');
      
      if (needsPostgres) {
        await client.query(`
          ALTER TABLE servers 
          ADD COLUMN postgres_installed BOOLEAN DEFAULT FALSE
        `);
        console.log('[MIGRATION] ✓ Added postgres_installed column');
      }
      
      if (needsMongodb) {
        await client.query(`
          ALTER TABLE servers 
          ADD COLUMN mongodb_installed BOOLEAN DEFAULT FALSE
        `);
        console.log('[MIGRATION] ✓ Added mongodb_installed column');
      }
      
      await client.query('COMMIT');
      console.log('[MIGRATION] Database schema updated successfully');
    } else {
      console.log('[MIGRATION] Database schema is up to date');
    }

    // Run additional migrations
    const { addPasswordResetTokens } = require('./009-add-password-reset-tokens');
    await addPasswordResetTokens();
    
    const { up: addDatabaseCredentials } = require('./011-add-database-credentials');
    await addDatabaseCredentials();
    
    // Add browser fingerprint column for trial abuse prevention
    const { run: addBrowserFingerprint } = require('./016-add-browser-fingerprint');
    await addBrowserFingerprint();

    // Add Google OAuth columns (google_id, auth_provider) to users table
    const { up: addGoogleOAuth } = require('./023-add-google-oauth');
    await addGoogleOAuth();

    // Add wordpress_sites table + servers.server_type discriminator
    const { up: addWordPressSites } = require('./026-add-wordpress-sites');
    await addWordPressSites();

    // Add ai_diagnosis column to deployments
    const { up: addAiDiagnosis } = require('./028-add-ai-diagnosis');
    await addAiDiagnosis();

    // Add branch + is_preview columns to deployments
    const { up: addBranchToDeployments } = require('./029-add-branch-to-deployments');
    await addBranchToDeployments();

    // Add commit_sha for git-based rollback
    const { up: addCommitSha } = require('./030-add-commit-sha');
    await addCommitSha();

    // Create uptime monitoring tables
    const { up: createUptimeChecks } = require('./031-create-uptime-checks');
    await createUptimeChecks();

    // Create API keys table
    const { up: createApiKeys } = require('./032-create-api-keys');
    await createApiKeys();

    // Create server_updates, server_update_log, and system_settings tables
    const { up: createServerUpdates } = require('./024-create-server-updates');
    await createServerUpdates();

    const { up: enhanceServerUpdates } = require('./025-enhance-server-updates');
    await enhanceServerUpdates();

    // Add CHECK constraint on server_updates.status to enforce the state machine at DB level
    const { up: serverUpdatesConstraints } = require('./033-server-updates-status-constraint');
    await serverUpdatesConstraints();

    // Add notify_webhook_url to servers for deploy event notifications
    const { up: addNotifyWebhook } = require('./034-add-notify-webhook');
    await addNotifyWebhook();

  } catch (error) {
    // Safely rollback transaction (may not have started if error was early)
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      // Transaction not started - safe to ignore
    }
    console.error('[MIGRATION] Error running migrations:', error.message);
    // Don't crash the app - log error and continue
    // Worst case: database features won't work until manual fix
  } finally {
    client.release();
  }
}

module.exports = { runMigrations };
