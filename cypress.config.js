require('dotenv').config();
const { Pool } = require('pg');

// Lazy-initialize a single pg pool for Cypress DB tasks.
// Reuses the same env vars as the Express app (.env at project root).
let dbPool;
function getDb() {
  if (!dbPool) {
    dbPool = new Pool({
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: 3,
    });
  }
  return dbPool;
}

module.exports = {
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        // ── db:confirmEmail ────────────────────────────────────────────────
        // Simulates the user clicking the confirmation link in their email.
        // Sets email_confirmed = true and clears the one-time token.
        async 'db:confirmEmail'(email) {
          await getDb().query(
            `UPDATE users
                SET email_confirmed = true,
                    email_token = NULL,
                    token_expires_at = NULL
              WHERE email = $1`,
            [email]
          );
          return null;
        },

        // ── db:insertPayment ───────────────────────────────────────────────
        // Seeds a succeeded payment so the user can access /onboarding/choose.
        // This replaces the Stripe payment flow in tests (test Stripe UI separately).
        //
        // payments table columns (create_payments_table.sql):
        //   user_id, stripe_payment_id, amount, currency, plan, status, description
        // NOTE: payment_interval lives on the SERVERS table, not payments.
        async 'db:insertPayment'({ userEmail, plan = 'basic' }) {
          const db = getDb();
          const { rows } = await db.query(
            'SELECT id FROM users WHERE email = $1',
            [userEmail]
          );
          if (!rows[0]) throw new Error(`[db:insertPayment] User not found: ${userEmail}`);
          const userId = rows[0].id;

          const AMOUNTS = { basic: 1500, pro: 3500, premium: 6500 };
          const amountDollars = (AMOUNTS[plan] ?? 1500) / 100;
          const fakeStripeId  = `pi_test_e2e_${Date.now()}`;

          await db.query(
            `INSERT INTO payments (user_id, stripe_payment_id, amount, plan, status)
             VALUES ($1, $2, $3, $4, 'succeeded')`,
            [userId, fakeStripeId, amountDollars, plan]
          );
          return userId;
        },

        // ── db:getUserByEmail ──────────────────────────────────────────────
        // Returns the user row for a given email (id, email, email_confirmed).
        async 'db:getUserByEmail'(email) {
          const { rows } = await getDb().query(
            'SELECT id, email, email_confirmed FROM users WHERE email = $1',
            [email]
          );
          return rows[0] || null;
        },

        // ── db:deleteUserServers ───────────────────────────────────────────
        // Removes all server records for a user (including 'provisioning' rows
        // that getUserServer() would find and redirect on).  Call this after
        // any test that submits a provisioning form so subsequent tests can
        // still access /onboarding/choose.
        async 'db:deleteUserServers'(email) {
          const db = getDb();
          const { rows } = await db.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
          );
          if (!rows[0]) return null;
          const userId = rows[0].id;
          // Also remove any child rows that reference servers
          try { await db.query('DELETE FROM deployments WHERE server_id IN (SELECT id FROM servers WHERE user_id = $1)', [userId]); } catch (_) {}
          try { await db.query('DELETE FROM domains WHERE server_id IN (SELECT id FROM servers WHERE user_id = $1)', [userId]); } catch (_) {}
          try { await db.query('DELETE FROM wordpress_sites WHERE user_id = $1', [userId]); } catch (_) {}
          await db.query('DELETE FROM servers WHERE user_id = $1', [userId]);
          return null;
        },

        // ── db:deleteTestUser ──────────────────────────────────────────────
        // Removes a test user and all related data. Called in before/after hooks
        // to keep the DB clean between test runs.
        async 'db:deleteTestUser'(email) {
          const db = getDb();
          const { rows } = await db.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
          );
          if (!rows[0]) return null;
          const userId = rows[0].id;

          // Delete in FK dependency order; swallow errors for tables that may
          // not exist in all environments or schema revisions.
          const deletes = [
            `DELETE FROM deployments
                WHERE server_id IN (SELECT id FROM servers WHERE user_id = $1)`,
            `DELETE FROM domains
                WHERE server_id IN (SELECT id FROM servers WHERE user_id = $1)`,
            `DELETE FROM wordpress_sites WHERE user_id = $1`,
            `DELETE FROM servers WHERE user_id = $1`,
            `DELETE FROM payments WHERE user_id = $1`,
            // connect-pg-simple stores session JSON; remove by userId field
            `DELETE FROM session
                WHERE (sess::jsonb->>'userId')::int = $1`,
            `DELETE FROM users WHERE id = $1`,
          ];

          for (const sql of deletes) {
            try {
              await db.query(sql, [userId]);
            } catch (_) {
              // Ignore — the table may not exist or the row may already be gone
            }
          }
          return userId;
        },
      });

      return config;
    },

    specPattern: 'tests/ui/**/*.cy.js',
    baseUrl: 'http://localhost:3000',
  },
};
