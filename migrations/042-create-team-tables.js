// migrations/042-create-team-tables.js
// Creates account_memberships (team roles per account) and account_invites
// (email-invite tokens with per-cycle expiry).
//
// Role hierarchy: owner > admin > developer > viewer
// account_owner_id is the user who owns the account/server; members can be
// granted scoped access to that account's resources.

'use strict';

const pool = require('../db');

exports.up = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS account_memberships (
        id               SERIAL PRIMARY KEY,
        account_owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        member_user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role             TEXT    NOT NULL DEFAULT 'viewer'
                           CHECK (role IN ('owner', 'admin', 'developer', 'viewer')),
        created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (account_owner_id, member_user_id)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_account_memberships_owner
        ON account_memberships (account_owner_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_account_memberships_member
        ON account_memberships (member_user_id)
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS account_invites (
        id               SERIAL PRIMARY KEY,
        account_owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        inviter_user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        email            TEXT    NOT NULL,
        role             TEXT    NOT NULL DEFAULT 'viewer'
                           CHECK (role IN ('admin', 'developer', 'viewer')),
        token_hash       TEXT    NOT NULL UNIQUE,
        status           TEXT    NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
        expires_at       TIMESTAMPTZ NOT NULL,
        created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        accepted_at      TIMESTAMPTZ
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_account_invites_owner
        ON account_invites (account_owner_id, status)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_account_invites_token
        ON account_invites (token_hash)
    `);

    await client.query('COMMIT');
    console.log('[MIGRATION 042] ✓ account_memberships and account_invites tables created');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[MIGRATION 042] ✗ Error:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

exports.down = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DROP TABLE IF EXISTS account_invites CASCADE');
    await client.query('DROP TABLE IF EXISTS account_memberships CASCADE');
    await client.query('COMMIT');
    console.log('[MIGRATION 042] ✓ team tables dropped');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[MIGRATION 042] ✗ Rollback error:', err.message);
    throw err;
  } finally {
    client.release();
  }
};
