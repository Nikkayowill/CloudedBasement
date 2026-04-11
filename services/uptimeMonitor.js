'use strict';

// services/uptimeMonitor.js
// Pings every active deployed subdomain + verified custom domain every 5 minutes.
// Emails users on down/recovery transitions — never spams repeated alerts.

const https = require('https');
const pool = require('../db');
const { sendUptimeAlertEmail } = require('./email');

const PING_TIMEOUT_MS = 8000;
const MAX_CONCURRENT  = 10; // avoid hammering the network

// ── Main entry point (called by setInterval in index.js) ─────────────────────

async function checkUptimeStatus() {
  console.log('[Uptime Monitor] Starting uptime checks...');

  let targets;
  try {
    // Collect every URL that should be monitored:
    //   1. Successful deployments with a subdomain (*.cloudedbasement.ca)
    //   2. Verified custom domains with SSL enabled
    const result = await pool.query(`
      SELECT
        dep.user_id,
        u.email,
        CONCAT('https://', dep.subdomain, '.cloudedbasement.ca') AS target_url
      FROM deployments dep
      JOIN servers  s ON s.id       = dep.server_id
      JOIN users    u ON u.id       = dep.user_id
      WHERE dep.status    = 'success'
        AND dep.subdomain IS NOT NULL
        AND dep.is_preview = FALSE
        AND s.status      = 'running'

      UNION

      SELECT
        d.user_id,
        u.email,
        CONCAT('https://', d.domain) AS target_url
      FROM domains d
      JOIN servers s ON s.id = d.server_id
      JOIN users   u ON u.id = d.user_id
      WHERE d.ssl_enabled = TRUE
        AND d.verified    = TRUE
        AND s.status      = 'running'
    `);

    targets = result.rows;
  } catch (err) {
    console.error('[Uptime Monitor] Failed to fetch targets:', err.message);
    return;
  }

  if (targets.length === 0) {
    console.log('[Uptime Monitor] No targets to check.');
    return;
  }

  console.log(`[Uptime Monitor] Checking ${targets.length} target(s)...`);

  // Process in batches to avoid saturating the connection pool / network
  for (let i = 0; i < targets.length; i += MAX_CONCURRENT) {
    const batch = targets.slice(i, i + MAX_CONCURRENT);
    await Promise.all(batch.map(t => pingTarget(t)));
  }

  console.log('[Uptime Monitor] Checks complete.');
}

// ── Ping one target, record result, handle alerts ────────────────────────────

async function pingTarget({ user_id, email, target_url }) {
  const { status, response_ms, error_message } = await httpPing(target_url);

  try {
    // 1. Record the check
    await pool.query(
      `INSERT INTO uptime_checks (user_id, target_url, status, response_ms, error_message)
       VALUES ($1, $2, $3, $4, $5)`,
      [user_id, target_url, status, response_ms ?? null, error_message ?? null]
    );

    // 2. Fetch the previous known state (if any)
    const prev = await pool.query(
      `SELECT last_status, down_since, alerted_down
       FROM uptime_status
       WHERE user_id = $1 AND target_url = $2`,
      [user_id, target_url]
    );

    const existing = prev.rows[0];

    if (!existing) {
      // First time we've seen this URL — just insert, no alert
      await pool.query(
        `INSERT INTO uptime_status (user_id, target_url, last_status, last_checked_at, down_since, alerted_down)
         VALUES ($1, $2, $3, NOW(), $4, FALSE)`,
        [user_id, target_url, status, status === 'down' ? new Date() : null]
      );
      return;
    }

    const wasDown = existing.last_status === 'down';
    const isDown  = status === 'down';

    if (!wasDown && isDown) {
      // Transition: up → down. Record and send alert.
      await pool.query(
        `UPDATE uptime_status
         SET last_status = 'down', last_checked_at = NOW(), down_since = NOW(), alerted_down = TRUE
         WHERE user_id = $1 AND target_url = $2`,
        [user_id, target_url]
      );
      sendUptimeAlertEmail(email, target_url, 'down').catch(e =>
        console.error(`[Uptime Monitor] Failed to send down alert for ${target_url}:`, e.message)
      );
      console.log(`[Uptime Monitor] ⬇ DOWN: ${target_url} (user ${user_id})`);

    } else if (wasDown && !isDown) {
      // Transition: down → up. Calculate downtime duration and send recovery.
      const downSince = existing.down_since ? new Date(existing.down_since) : null;
      const downMinutes = downSince
        ? Math.round((Date.now() - downSince.getTime()) / 60000)
        : null;

      await pool.query(
        `UPDATE uptime_status
         SET last_status = 'up', last_checked_at = NOW(), down_since = NULL, alerted_down = FALSE
         WHERE user_id = $1 AND target_url = $2`,
        [user_id, target_url]
      );

      if (existing.alerted_down) {
        // Only send recovery if we actually sent a down alert
        sendUptimeAlertEmail(email, target_url, 'recovery', downMinutes).catch(e =>
          console.error(`[Uptime Monitor] Failed to send recovery alert for ${target_url}:`, e.message)
        );
      }
      console.log(`[Uptime Monitor] ⬆ UP: ${target_url} (user ${user_id}, was down ~${downMinutes ?? '?'}m)`);

    } else {
      // No transition — just update timestamp
      await pool.query(
        `UPDATE uptime_status
         SET last_status = $3, last_checked_at = NOW()
         WHERE user_id = $1 AND target_url = $2`,
        [user_id, target_url, status]
      );
    }

  } catch (err) {
    console.error(`[Uptime Monitor] DB error for ${target_url}:`, err.message);
  }
}

// ── HTTP ping — returns { status, response_ms, error_message } ───────────────

function httpPing(url) {
  return new Promise((resolve) => {
    const start = Date.now();

    const req = https.get(url, { timeout: PING_TIMEOUT_MS }, (res) => {
      const response_ms = Date.now() - start;
      res.resume(); // discard body — we only care about the status code

      // Treat 2xx and 3xx as up; 5xx and no-response as down
      const status = res.statusCode < 500 ? 'up' : 'down';
      resolve({ status, response_ms, error_message: status === 'down' ? `HTTP ${res.statusCode}` : null });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 'down', response_ms: null, error_message: 'Request timed out' });
    });

    req.on('error', (err) => {
      resolve({ status: 'down', response_ms: null, error_message: err.message });
    });
  });
}

// ── Dashboard API helper — latest status per URL for a user ──────────────────
// Called by dashboardController to enrich the API response.

async function getUptimeStatusForUser(userId) {
  try {
    const result = await pool.query(
      `SELECT target_url, last_status, last_checked_at, down_since
       FROM uptime_status
       WHERE user_id = $1`,
      [userId]
    );
    // Return a map: { 'https://foo.cloudedbasement.ca': { status, last_checked_at, down_since } }
    const map = {};
    for (const row of result.rows) {
      map[row.target_url] = {
        status:          row.last_status,
        last_checked_at: row.last_checked_at,
        down_since:      row.down_since,
      };
    }
    return map;
  } catch (err) {
    console.error('[Uptime Monitor] getUptimeStatusForUser error:', err.message);
    return {};
  }
}

module.exports = { checkUptimeStatus, getUptimeStatusForUser };
