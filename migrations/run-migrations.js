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

    // Add 2FA columns (twofa_enabled, twofa_secret) to users table
    const twoFaCheck = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'twofa_enabled'
    `);
    if (twoFaCheck.rows.length === 0) {
      await client.query(`
        ALTER TABLE users
        ADD COLUMN twofa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN twofa_secret TEXT
      `);
      console.log('[MIGRATION] ✓ Added twofa_enabled and twofa_secret columns');
    }

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

    // Add start_command to deployments for custom startup commands
    const { up: addStartCommand } = require('./035-add-start-command');
    await addStartCommand();

    // Create resource alert rules table
    const { up: createResourceAlerts } = require('./036-create-resource-alert-rules');
    await createResourceAlerts();

    // Create server metrics history table for graphing
    const { up: createServerMetricsHistory } = require('./037-create-server-metrics-history');
    await createServerMetricsHistory();

    // Add alert state machine + Slack/Discord channels + alert_history table
    const { up: enhanceAlertSystem } = require('./038-enhance-alert-system');
    await enhanceAlertSystem();

    // Add composite indexes on security_events for analytics query performance
    const { up: securityEventsAnalyticsIndex } = require('./039-security-events-analytics-index');
    await securityEventsAnalyticsIndex();

    // Create restore_jobs table for tracking backup restore attempts
    const { up: createRestoreJobs } = require('./040-create-restore-jobs');
    await createRestoreJobs();

    // Create billing_guardrails and billing_threshold_sent tables
    const { up: createBillingGuardrails } = require('./041-create-billing-guardrails');
    await createBillingGuardrails();

    // Create account_memberships and account_invites tables for team access
    const { up: createTeamTables } = require('./042-create-team-tables');
    await createTeamTables();

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
