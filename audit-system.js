require('dotenv').config();
const pool = require('./db');

async function auditSystem() {
  console.log('========================================');
  console.log('CLOUDED BASEMENT SYSTEM AUDIT');
  console.log('========================================\n');
  
  const issues = [];
  const warnings = [];
  
  try {
    // 1. Database Connection Test
    console.log('1. DATABASE CONNECTION');
    const dbTest = await pool.query('SELECT NOW() as time, current_database() as db');
    console.log('   ✅ Connected to:', dbTest.rows[0].db);
    console.log('   ✅ Server time:', dbTest.rows[0].time);
    
    // 2. Users Table Check
    console.log('\n2. USERS TABLE');
    const usersResult = await pool.query('SELECT COUNT(*) as total, COUNT(CASE WHEN email_confirmed THEN 1 END) as confirmed, COUNT(CASE WHEN trial_used THEN 1 END) as trial_used FROM users');
    console.log('   Total users:', usersResult.rows[0].total);
    console.log('   Email confirmed:', usersResult.rows[0].confirmed);
    console.log('   Trial used:', usersResult.rows[0].trial_used);
    
    // Check for required columns
    const userColumns = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
    const requiredUserCols = ['id', 'email', 'password_hash', 'email_confirmed', 'trial_used', 'browser_fingerprint', 'signup_ip'];
    for (const col of requiredUserCols) {
      if (!userColumns.rows.find(r => r.column_name === col)) {
        issues.push('Missing users column: ' + col);
      }
    }
    console.log('   Required columns: ✅');
    
    // 3. Servers Table Check
    console.log('\n3. SERVERS TABLE');
    const serversResult = await pool.query("SELECT COUNT(*) as total, COUNT(CASE WHEN status = 'running' THEN 1 END) as running, COUNT(CASE WHEN status = 'provisioning' THEN 1 END) as provisioning, COUNT(CASE WHEN is_trial THEN 1 END) as trials FROM servers");
    console.log('   Total servers:', serversResult.rows[0].total);
    console.log('   Running:', serversResult.rows[0].running);
    console.log('   Provisioning:', serversResult.rows[0].provisioning);
    console.log('   Trial servers:', serversResult.rows[0].trials);
    
    // Check for required columns
    const serverColumns = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'servers'");
    const requiredServerCols = ['id', 'user_id', 'plan', 'status', 'ip_address', 'droplet_id', 'stripe_charge_id', 'stripe_subscription_id', 'is_trial', 'site_limit'];
    for (const col of requiredServerCols) {
      if (!serverColumns.rows.find(r => r.column_name === col)) {
        issues.push('Missing servers column: ' + col);
      }
    }
    console.log('   Required columns: ✅');
    
    // 4. Payments Table Check
    console.log('\n4. PAYMENTS TABLE');
    const paymentsResult = await pool.query("SELECT COUNT(*) as total, COUNT(CASE WHEN status = 'succeeded' THEN 1 END) as succeeded, SUM(CASE WHEN status = 'succeeded' THEN amount ELSE 0 END) as revenue FROM payments");
    console.log('   Total payments:', paymentsResult.rows[0].total);
    console.log('   Successful:', paymentsResult.rows[0].succeeded);
    console.log('   Total revenue: $' + (paymentsResult.rows[0].revenue || 0));
    
    // 5. Domains Table Check
    console.log('\n5. DOMAINS TABLE');
    const domainsResult = await pool.query('SELECT COUNT(*) as total, COUNT(CASE WHEN ssl_enabled THEN 1 END) as ssl_enabled FROM domains');
    console.log('   Total domains:', domainsResult.rows[0].total);
    console.log('   SSL enabled:', domainsResult.rows[0].ssl_enabled);
    
    // 6. Sessions Table Check
    console.log('\n6. SESSIONS TABLE');
    const sessionsResult = await pool.query('SELECT COUNT(*) as total FROM session');
    console.log('   Active sessions:', sessionsResult.rows[0].total);
    
    // 7. Support Tickets Check
    console.log('\n7. SUPPORT TICKETS');
    const ticketsResult = await pool.query("SELECT COUNT(*) as total, COUNT(CASE WHEN status = 'open' THEN 1 END) as open FROM support_tickets");
    console.log('   Total tickets:', ticketsResult.rows[0].total);
    console.log('   Open tickets:', ticketsResult.rows[0].open);
    
    // 8. Environment Variables Check
    console.log('\n8. ENVIRONMENT VARIABLES');
    const envVars = ['STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY', 'STRIPE_WEBHOOK_SECRET', 'DIGITALOCEAN_TOKEN', 'SESSION_SECRET', 'DB_HOST', 'SMTP_HOST', 'SENTRY_DSN'];
    for (const v of envVars) {
      if (process.env[v]) {
        console.log('   ✅', v);
      } else {
        warnings.push('Missing env var: ' + v);
        console.log('   ⚠️', v, '(missing)');
      }
    }
    
    // 9. Stripe Key Check
    console.log('\n9. STRIPE MODE');
    const stripeKey = process.env.STRIPE_SECRET_KEY || '';
    if (stripeKey.startsWith('sk_live_')) {
      console.log('   🔴 LIVE MODE (real charges!)');
    } else if (stripeKey.startsWith('sk_test_')) {
      console.log('   🟡 TEST MODE');
    } else {
      issues.push('Invalid Stripe key format');
      console.log('   ❌ UNKNOWN');
    }
    
    // 10. Indexes Check
    console.log('\n10. DATABASE INDEXES');
    const indexResult = await pool.query("SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%'");
    console.log('   Custom indexes found:', indexResult.rows.length);
    
    // 11. Orphan Check (servers without users)
    console.log('\n11. DATA INTEGRITY');
    const orphanServers = await pool.query('SELECT COUNT(*) as count FROM servers s LEFT JOIN users u ON s.user_id = u.id WHERE u.id IS NULL');
    if (parseInt(orphanServers.rows[0].count) > 0) {
      issues.push('Orphan servers (no user): ' + orphanServers.rows[0].count);
    } else {
      console.log('   ✅ No orphan servers');
    }
    
    const orphanPayments = await pool.query('SELECT COUNT(*) as count FROM payments p LEFT JOIN users u ON p.user_id = u.id WHERE u.id IS NULL');
    if (parseInt(orphanPayments.rows[0].count) > 0) {
      issues.push('Orphan payments (no user): ' + orphanPayments.rows[0].count);
    } else {
      console.log('   ✅ No orphan payments');
    }
    
    // 12. Stuck provisioning servers
    const stuckServers = await pool.query("SELECT COUNT(*) as count FROM servers WHERE status = 'provisioning' AND created_at < NOW() - INTERVAL '10 minutes'");
    if (parseInt(stuckServers.rows[0].count) > 0) {
      warnings.push('Stuck provisioning servers: ' + stuckServers.rows[0].count);
    }
    
    // 13. Deployments Check
    console.log('\n12. DEPLOYMENTS');
    const deploymentsResult = await pool.query("SELECT COUNT(*) as total, COUNT(CASE WHEN status = 'success' THEN 1 END) as success, COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed FROM deployments");
    console.log('   Total deployments:', deploymentsResult.rows[0].total);
    console.log('   Successful:', deploymentsResult.rows[0].success);
    console.log('   Failed:', deploymentsResult.rows[0].failed);
    
    // Summary
    console.log('\n========================================');
    console.log('AUDIT SUMMARY');
    console.log('========================================');
    
    if (issues.length === 0 && warnings.length === 0) {
      console.log('\n✅ ALL CHECKS PASSED - System is healthy!');
    } else {
      if (issues.length > 0) {
        console.log('\n❌ ISSUES (' + issues.length + '):');
        issues.forEach(i => console.log('   - ' + i));
      }
      if (warnings.length > 0) {
        console.log('\n⚠️ WARNINGS (' + warnings.length + '):');
        warnings.forEach(w => console.log('   - ' + w));
      }
    }
    
  } catch (error) {
    console.error('\n❌ AUDIT FAILED:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

auditSystem();
