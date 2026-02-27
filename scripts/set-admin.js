// Quick script to check and set admin role for superadmin account
require('dotenv').config();
const pool = require('./db');

const ADMIN_EMAIL = 'support@cloudedbasement.ca';

async function setAdminRole() {
  try {
    // Check current role
    const result = await pool.query(
      'SELECT id, email, role, email_confirmed FROM users WHERE email = $1',
      [ADMIN_EMAIL]
    );

    if (result.rows.length === 0) {
      console.log(`❌ Account ${ADMIN_EMAIL} not found in database.`);
      console.log('💡 Please register this account first at /register');
      process.exit(1);
    }

    const user = result.rows[0];
    console.log('\n📊 Current account status:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role || 'user (default)'}`);
    console.log(`   Email Confirmed: ${user.email_confirmed}`);

    if (user.role === 'admin') {
      console.log('\n✅ Account already has admin role!');
    } else {
      // Set admin role
      await pool.query(
        'UPDATE users SET role = $1 WHERE id = $2',
        ['admin', user.id]
      );
      console.log('\n✅ Admin role granted successfully!');
    }

    // Ensure email is confirmed
    if (!user.email_confirmed) {
      await pool.query(
        'UPDATE users SET email_confirmed = true, email_token = NULL, token_expires_at = NULL WHERE id = $1',
        [user.id]
      );
      console.log('✅ Email confirmed (bypassed for superadmin)');
    }

    console.log('\n🎉 Superadmin setup complete!');
    console.log(`   You can now access admin features at /admin\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setAdminRole();
