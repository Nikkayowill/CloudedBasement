// controllers/teamController.js
// CRUD for account team memberships and email invites.
//
// Access model:
//   - All /api/team/* routes require the caller to be the account owner
//     (session.userId === account_owner_id). Members managing their own seat
//     (e.g., accepting an invite) use the /api/team/invite/accept endpoint.
//   - Only account owners can invite, promote/demote, or remove members.

'use strict';

const crypto = require('crypto');
const pool   = require('../db');
const { sendEmail } = require('../services/email');
const { VALID_TEAM_ROLES } = require('../src/utils/rbac');

const INVITE_TTL_HOURS = 72;

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function getPendingInviteByToken(token) {
  const tokenHash = hashToken(token);
  const inviteResult = await pool.query(
    `SELECT * FROM account_invites
      WHERE token_hash = $1 AND status = 'pending'`,
    [tokenHash]
  );
  return inviteResult.rows[0] || null;
}

// ── GET /api/team/invite/accept ──────────────────────────────────────────────

async function previewInviteAcceptance(req, res) {
  const token = (req.query.token || '').trim();
  if (!token || !/^[0-9a-f]{64}$/.test(token)) {
    return res.status(400).json({ error: 'Invalid or missing invite token' });
  }

  try {
    const invite = await getPendingInviteByToken(token);
    if (!invite) return res.status(404).json({ error: 'Invite not found or already used' });

    if (new Date(invite.expires_at) < new Date()) {
      await pool.query(
        `UPDATE account_invites SET status = 'expired' WHERE id = $1`,
        [invite.id]
      );
      return res.status(410).json({ error: 'Invite has expired' });
    }

    if (!req.session.userId) {
      const returnUrl = encodeURIComponent(`/api/team/invite/accept?token=${token}`);
      return res.redirect(`/login?return=${returnUrl}`);
    }

    if (req.session.userId === invite.account_owner_id) {
      return res.status(400).json({ error: 'Account owners cannot accept their own invites' });
    }

    return res.json({
      valid: true,
      message: 'Invite is valid. Submit a POST request to accept this invite.',
      invite: {
        email: invite.email,
        role: invite.role,
        expires_at: invite.expires_at,
      },
    });
  } catch (err) {
    console.error('[team/previewInviteAcceptance] Error:', err.message);
    return res.status(500).json({ error: 'Failed to validate invite' });
  }
}

// ── GET /api/team/members ─────────────────────────────────────────────────────

async function listMembers(req, res) {
  try {
    const members = await pool.query(
      `SELECT m.id, m.role, m.created_at, m.updated_at,
              u.email, u.id AS user_id
         FROM account_memberships m
         JOIN users u ON u.id = m.member_user_id
        WHERE m.account_owner_id = $1
        ORDER BY m.created_at ASC`,
      [req.session.userId]
    );

    const invites = await pool.query(
      `SELECT id, email, role, status, expires_at, created_at
         FROM account_invites
        WHERE account_owner_id = $1 AND status = 'pending'
        ORDER BY created_at DESC`,
      [req.session.userId]
    );

    res.json({ members: members.rows, pending_invites: invites.rows });
  } catch (err) {
    console.error('[team/listMembers] Error:', err.message);
    res.status(500).json({ error: 'Failed to list team members' });
  }
}

// ── POST /api/team/invite ─────────────────────────────────────────────────────

async function inviteMember(req, res) {
  const { email, role } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'email is required' });
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail.includes('@') || normalizedEmail.length > 255) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  if (!role || !VALID_TEAM_ROLES.filter(r => r !== 'owner').includes(role)) {
    return res.status(400).json({ error: 'role must be admin, developer, or viewer' });
  }

  try {
    // Check for existing active invite
    const existing = await pool.query(
      `SELECT id FROM account_invites
        WHERE account_owner_id = $1 AND email = $2 AND status = 'pending'`,
      [req.session.userId, normalizedEmail]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'A pending invite already exists for this email.' });
    }

    const ownerRow = await pool.query(
      'SELECT email FROM users WHERE id = $1',
      [req.session.userId]
    );
    const ownerEmail = ownerRow.rows[0]?.email ?? 'your account';

    const token     = generateToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + INVITE_TTL_HOURS * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO account_invites
         (account_owner_id, inviter_user_id, email, role, token_hash, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.session.userId, req.session.userId, normalizedEmail, role, tokenHash, expiresAt]
    );

    // Fire-and-forget invite email
    const acceptUrl = `${process.env.APP_URL || 'https://cloudedbasement.com'}/api/team/invite/accept?token=${token}`;
    const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
    setImmediate(async () => {
      try {
        await sendEmail(
          normalizedEmail,
          `You're invited to join ${ownerEmail}'s team on Clouded Basement`,
          `<p>You've been invited as a <strong>${roleLabel}</strong> on <strong>${ownerEmail}</strong>'s Clouded Basement account.</p>
           <p><a href="${acceptUrl}">Accept invitation</a> (expires in ${INVITE_TTL_HOURS} hours)</p>`,
          `You've been invited as a ${roleLabel} on ${ownerEmail}'s Clouded Basement account.\n\nAccept: ${acceptUrl}\n\nExpires in ${INVITE_TTL_HOURS} hours.`
        );
      } catch (err) {
        console.error('[team/inviteMember] Email send failed:', err.message);
      }
    });

    res.json({ success: true, message: `Invite sent to ${normalizedEmail}` });
  } catch (err) {
    console.error('[team/inviteMember] Error:', err.message);
    res.status(500).json({ error: 'Failed to send invite' });
  }
}

// ── POST /api/team/invite/accept ──────────────────────────────────────────────

async function acceptInvite(req, res) {
  const token = (req.body?.token || '').trim();
  if (!token || !/^[0-9a-f]{64}$/.test(token)) {
    return res.status(400).json({ error: 'Invalid or missing invite token' });
  }

  try {
    const invite = await getPendingInviteByToken(token);
    if (!invite) return res.status(404).json({ error: 'Invite not found or already used' });

    if (new Date(invite.expires_at) < new Date()) {
      await pool.query(
        `UPDATE account_invites SET status = 'expired' WHERE id = $1`,
        [invite.id]
      );
      return res.status(410).json({ error: 'Invite has expired' });
    }

    // Accepting user must be logged in
    if (!req.session.userId) {
      const returnUrl = encodeURIComponent(`/api/team/invite/accept?token=${token}`);
      return res.redirect(`/login?return=${returnUrl}`);
    }

    // Prevent owner from joining their own team
    if (req.session.userId === invite.account_owner_id) {
      return res.status(400).json({ error: 'Account owners cannot accept their own invites' });
    }

    const userResult = await pool.query(
      'SELECT email FROM users WHERE id = $1',
      [req.session.userId]
    );
    const userEmail = userResult.rows[0]?.email?.trim().toLowerCase();
    if (!userEmail || userEmail !== invite.email.trim().toLowerCase()) {
      return res.status(403).json({ error: 'Invite email does not match your account email' });
    }

    await pool.query('BEGIN');
    try {
      await pool.query(
        `INSERT INTO account_memberships (account_owner_id, member_user_id, role)
         VALUES ($1, $2, $3)
         ON CONFLICT (account_owner_id, member_user_id) DO UPDATE SET role = EXCLUDED.role, updated_at = NOW()`,
        [invite.account_owner_id, req.session.userId, invite.role]
      );

      await pool.query(
        `UPDATE account_invites SET status = 'accepted', accepted_at = NOW() WHERE id = $1`,
        [invite.id]
      );

      await pool.query('COMMIT');
    } catch (txErr) {
      await pool.query('ROLLBACK');
      throw txErr;
    }

    res.json({ success: true, message: 'You have joined the team.', role: invite.role });
  } catch (err) {
    console.error('[team/acceptInvite] Error:', err.message);
    res.status(500).json({ error: 'Failed to accept invite' });
  }
}

// ── PATCH /api/team/members/:id/role ─────────────────────────────────────────

async function updateMemberRole(req, res) {
  const membershipId = parseInt(req.params.id, 10);
  const { role } = req.body;

  if (!Number.isFinite(membershipId)) {
    return res.status(400).json({ error: 'Invalid membership ID' });
  }
  if (!role || !VALID_TEAM_ROLES.filter(r => r !== 'owner').includes(role)) {
    return res.status(400).json({ error: 'role must be admin, developer, or viewer' });
  }

  try {
    const result = await pool.query(
      `UPDATE account_memberships
          SET role = $1, updated_at = NOW()
        WHERE id = $2 AND account_owner_id = $3
        RETURNING id`,
      [role, membershipId, req.session.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Membership not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('[team/updateMemberRole] Error:', err.message);
    res.status(500).json({ error: 'Failed to update role' });
  }
}

// ── DELETE /api/team/members/:id ──────────────────────────────────────────────

async function removeMember(req, res) {
  const membershipId = parseInt(req.params.id, 10);
  if (!Number.isFinite(membershipId)) {
    return res.status(400).json({ error: 'Invalid membership ID' });
  }

  try {
    const result = await pool.query(
      `DELETE FROM account_memberships
        WHERE id = $1 AND account_owner_id = $2
        RETURNING id`,
      [membershipId, req.session.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Membership not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('[team/removeMember] Error:', err.message);
    res.status(500).json({ error: 'Failed to remove member' });
  }
}

// ── DELETE /api/team/invites/:id (revoke pending invite) ─────────────────────

async function revokeInvite(req, res) {
  const inviteId = parseInt(req.params.id, 10);
  if (!Number.isFinite(inviteId)) {
    return res.status(400).json({ error: 'Invalid invite ID' });
  }

  try {
    const result = await pool.query(
      `UPDATE account_invites
          SET status = 'revoked'
        WHERE id = $1 AND account_owner_id = $2 AND status = 'pending'
        RETURNING id`,
      [inviteId, req.session.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pending invite not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('[team/revokeInvite] Error:', err.message);
    res.status(500).json({ error: 'Failed to revoke invite' });
  }
}

module.exports = {
  previewInviteAcceptance,
  listMembers,
  inviteMember,
  acceptInvite,
  updateMemberRole,
  removeMember,
  revokeInvite,
};
