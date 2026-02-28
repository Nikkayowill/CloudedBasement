'use strict';

// controllers/wordpressController.js
// Handles WordPress site creation and status polling.
//
// Endpoints:
//   POST /wordpress/create      — validate input, kick off async provisioning
//   GET  /api/wordpress/status/:siteId — poll deployment progress (frontend poller)

const pool = require('../db');
const { createWordPressServer } = require('../services/wordpress');

// ── Allowed plan slugs ──────────────────────────────────────────────────────
const ALLOWED_PLANS = new Set(['basic', 'pro', 'premium']);

// ── Input validation helpers ────────────────────────────────────────────────

/**
 * Returns true if the string is a well-formed email address.
 * Intentionally simple — full RFC 5321 compliance is out of scope.
 */
function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Strips any character that is not a printable ASCII letter, digit, space,
 * apostrophe, hyphen, or period — safe for storage and HTML rendering.
 * Returns the sanitised string (max 100 chars).
 */
function sanitiseSiteTitle(raw) {
  return String(raw)
    .replace(/[^\w\s'.,-]/g, '')  // strip non-safe chars
    .trim()
    .slice(0, 100);
}

// ── POST /wordpress/create ──────────────────────────────────────────────────

/**
 * Kick off WordPress provisioning for the authenticated user.
 *
 * Body: { plan, siteTitle, adminEmail }
 *
 * Returns HTTP 202 with { serverId, wpSiteId, status: 'provisioning' } so the
 * frontend can start polling /api/wordpress/status/:siteId immediately.
 */
exports.createSite = async (req, res) => {
  // Defensive authentication check
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const userId = req.session.userId;

  try {
    // ── Validate plan ──────────────────────────────────────────────────────
    const plan = req.body.plan;
    if (!plan || !ALLOWED_PLANS.has(plan)) {
      return res.status(400).json({
        error: 'Invalid plan. Must be one of: basic, pro, premium.',
      });
    }

    // ── Validate siteTitle ─────────────────────────────────────────────────
    const rawTitle = req.body.siteTitle;
    if (!rawTitle || String(rawTitle).trim().length === 0) {
      return res.status(400).json({ error: 'siteTitle is required.' });
    }
    const siteTitle = sanitiseSiteTitle(rawTitle);
    if (siteTitle.length === 0) {
      return res.status(400).json({ error: 'siteTitle contains no valid characters.' });
    }

    // ── Validate adminEmail ────────────────────────────────────────────────
    const adminEmail = req.body.adminEmail;
    if (!isValidEmail(adminEmail)) {
      return res.status(400).json({ error: 'adminEmail must be a valid email address.' });
    }

    // ── Guard: one active server per user ──────────────────────────────────
    // createWordPressServer() has the same guard, but checking here first lets
    // us return a friendly JSON error without hitting the DO API at all.
    const existingServer = await pool.query(
      `SELECT s.id AS server_id, ws.id AS wp_site_id, ws.status
         FROM servers s
         JOIN wordpress_sites ws ON ws.server_id = s.id
        WHERE s.user_id = $1
          AND s.status NOT IN ('deleted', 'failed')
        ORDER BY s.created_at DESC
        LIMIT 1`,
      [userId]
    );
    if (existingServer.rows.length > 0) {
      const existing = existingServer.rows[0];
      return res.status(409).json({
        error: 'You already have an active WordPress server.',
        serverId:  existing.server_id,
        wpSiteId:  existing.wp_site_id,
        status:    existing.status,
      });
    }

    // ── Start provisioning (async — does not block the response) ───────────
    const serverRow = await createWordPressServer(userId, plan, siteTitle, adminEmail);

    // Fetch the wordpress_sites id created alongside the server row
    const wpSiteResult = await pool.query(
      `SELECT id FROM wordpress_sites WHERE server_id = $1 LIMIT 1`,
      [serverRow.id]
    );
    const wpSiteId = wpSiteResult.rows[0]?.id ?? null;

    return res.status(202).json({
      message:   'WordPress provisioning started.',
      serverId:  serverRow.id,
      wpSiteId,
      status:    'provisioning',
    });

  } catch (err) {
    console.error('[WP Controller] createSite error:', err.message);
    return res.status(500).json({ error: 'Failed to start provisioning. Please try again.' });
  }
};

// ── GET /api/wordpress/status/:siteId ──────────────────────────────────────

/**
 * Returns the current deployment status for a WordPress site.
 *
 * The frontend polls this every few seconds to update the progress card.
 * Only data safe to expose to the site owner is returned — no credentials.
 *
 * URL param: siteId — must be a positive integer.
 */
exports.getSiteStatus = async (req, res) => {
  // Defensive authentication check
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const userId = req.session.userId;

  // ── Validate siteId path param ─────────────────────────────────────────
  const siteIdRaw = req.params.siteId;
  const siteId = parseInt(siteIdRaw, 10);
  if (!Number.isInteger(siteId) || siteId <= 0) {
    return res.status(400).json({ error: 'Invalid site ID.' });
  }

  try {
    // ── Ownership check: WHERE user_id = $2 prevents IDOR ─────────────────
    const result = await pool.query(
      `SELECT
           ws.id              AS wp_site_id,
           ws.status          AS wp_status,
           ws.status_message,
           ws.domain,
           ws.site_title,
           ws.admin_user,
           ws.admin_email,
           ws.ssl_enabled,
           ws.created_at,
           ws.updated_at,
           s.id               AS server_id,
           s.status           AS server_status,
           s.ip_address
         FROM wordpress_sites ws
         JOIN servers s ON s.id = ws.server_id
        WHERE ws.id = $1
          AND ws.user_id = $2`,
      [siteId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'WordPress site not found.' });
    }

    const row = result.rows[0];

    // Build public URL once the site is live, only if domain or valid ip_address exists
    let siteUrl = null;
    if (row.wp_status === 'live') {
      if (row.domain) {
        siteUrl = `https://${row.domain}`;
      } else if (row.ip_address && row.ip_address !== 'null' && row.ip_address !== '') {
        siteUrl = `http://${row.ip_address}`;
      } // else siteUrl remains null
    }

    // Only include siteUrl if it's not null
    const response = {
      wpSiteId:      row.wp_site_id,
      serverId:      row.server_id,
      serverStatus:  row.server_status,
      wpStatus:      row.wp_status,
      statusMessage: row.status_message,
      siteTitle:     row.site_title,
      adminUser:     row.admin_user,
      adminEmail:    row.admin_email,
      domain:        row.domain,
      ipAddress:     row.ip_address,
      sslEnabled:    row.ssl_enabled,
      createdAt:     row.created_at,
      updatedAt:     row.updated_at,
    };
    if (siteUrl) response.siteUrl = siteUrl;

    return res.json(response);

  } catch (err) {
    console.error('[WP Controller] getSiteStatus error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch site status.' });
  }
};
