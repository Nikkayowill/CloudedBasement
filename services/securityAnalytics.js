// services/securityAnalytics.js
// Read-only aggregation of security_events into actionable signals.
// Never mutates state. Pure classifiers exported for unit testing.
//
// Signal categories:
//   LOGIN_FAILED_IP_1H      — brute-force from a single IP over 1 h
//   LOGIN_FAILED_IP_24H     — sustained brute-force from a single IP over 24 h
//   LOGIN_FAILED_EMAIL_1H   — credential stuffing against a single account over 1 h
//   LOGIN_FAILED_EMAIL_24H  — sustained credential stuffing against an account over 24 h
//   TWO_FA_FAILED_USER_1H   — repeated 2FA bypass attempts for a user over 1 h
//   TWO_FA_FAILED_USER_24H  — sustained 2FA bypass attempts for a user over 24 h
//   AUTH_SPIKE              — current-hour auth event volume > N× 7-day baseline avg

'use strict';

const crypto = require('crypto');
const net  = require('net');
const pool = require('../db');

function hashEmail(email) {
  return crypto.createHash('sha256').update(email).digest('hex');
}

// ── Thresholds ────────────────────────────────────────────────────────────────
// Tune here without touching logic.

const THRESHOLDS = {
  LOGIN_FAILED_IP_1H:     10,
  LOGIN_FAILED_IP_24H:    50,
  LOGIN_FAILED_EMAIL_1H:   5,
  LOGIN_FAILED_EMAIL_24H: 20,
  TWO_FA_FAILED_USER_1H:   3,
  TWO_FA_FAILED_USER_24H: 10,
  AUTH_SPIKE_MULTIPLIER:   3.0, // current-hour count > N× 7-day baseline hourly avg
};

// ── DB queries (parameterized) ────────────────────────────────────────────────

async function queryFailedLoginsByIp(windowHours) {
  const { rows } = await pool.query(
    `SELECT ip_address, COUNT(*)::int AS count
       FROM security_events
      WHERE event_type = 'LOGIN_FAILED'
        AND created_at > NOW() - make_interval(hours => $1::int)
        AND ip_address IS NOT NULL
      GROUP BY ip_address
      ORDER BY count DESC
      LIMIT 20`,
    [windowHours]
  );
  return rows; // [{ ip_address, count }]
}

async function queryFailedLoginsByEmail(windowHours) {
  const { rows } = await pool.query(
    `SELECT email, COUNT(*)::int AS count
       FROM security_events
      WHERE event_type = 'LOGIN_FAILED'
        AND created_at > NOW() - make_interval(hours => $1::int)
        AND email IS NOT NULL
      GROUP BY email
      ORDER BY count DESC
      LIMIT 20`,
    [windowHours]
  );
  return rows; // [{ email, count }]
}

async function query2FAFailuresByUser(windowHours) {
  const { rows } = await pool.query(
    `SELECT se.user_id, u.email, COUNT(*)::int AS count
       FROM security_events se
       LEFT JOIN users u ON se.user_id = u.id
      WHERE se.event_type = '2FA_FAILED'
        AND se.created_at > NOW() - make_interval(hours => $1::int)
        AND se.user_id IS NOT NULL
      GROUP BY se.user_id, u.email
      ORDER BY count DESC
      LIMIT 20`,
    [windowHours]
  );
  return rows; // [{ user_id, email, count }]
}

async function queryAuthSpike() {
  // Current-hour event count
  const { rows: curr } = await pool.query(`
    SELECT COUNT(*)::int AS count
      FROM security_events
     WHERE event_type IN ('LOGIN_FAILED', 'LOGIN_SUCCESS', '2FA_FAILED')
       AND created_at > NOW() - INTERVAL '1 hour'
  `);

  // Baseline: total auth events in the 167-hour window [7d ago, 1h ago].
  // Dividing by 167 gives the per-hour average, excluding the current window
  // so a live spike doesn't inflate its own baseline.
  const { rows: base } = await pool.query(`
    SELECT ROUND(COUNT(*)::numeric / 167, 1) AS hourly_avg
      FROM security_events
     WHERE event_type IN ('LOGIN_FAILED', 'LOGIN_SUCCESS', '2FA_FAILED')
       AND created_at > NOW() - INTERVAL '7 days'
       AND created_at <= NOW() - INTERVAL '1 hour'
  `);

  return {
    current_hour:       curr[0].count,
    baseline_hourly_avg: parseFloat(base[0].hourly_avg) || 0,
  };
}

// ── Pure classifier (no I/O — fully testable) ─────────────────────────────────

/**
 * Given pre-aggregated counts, returns triggered threshold alerts.
 * Pure function: no database or notifier calls — safe to unit-test without mocks.
 *
 * Expected shape of `data`:
 *   failed_logins_by_ip      { '1h': [{ip_address, count}], '24h': [...] }
 *   failed_logins_by_email   { '1h': [{email, count}],      '24h': [...] }
 *   two_fa_failures_by_user  { '1h': [{user_id, email, count}], '24h': [...] }
 *   auth_spike               { current_hour, baseline_hourly_avg }
 *
 * @param {object} data
 * @returns {object[]} triggered alert items
 */
function classifyThresholdAlerts(data) {
  const alerts = [];

  function check(signal, offender, count, threshold, severity) {
    if (count >= threshold) {
      alerts.push({ signal, offender, count, threshold, severity });
    }
  }

  for (const row of data.failed_logins_by_ip['1h']) {
    check('LOGIN_FAILED_IP_1H', row.ip_address, row.count,
          THRESHOLDS.LOGIN_FAILED_IP_1H, 'high');
  }
  for (const row of data.failed_logins_by_ip['24h']) {
    check('LOGIN_FAILED_IP_24H', row.ip_address, row.count,
          THRESHOLDS.LOGIN_FAILED_IP_24H, 'medium');
  }
  for (const row of data.failed_logins_by_email['1h']) {
    check('LOGIN_FAILED_EMAIL_1H', row.email, row.count,
          THRESHOLDS.LOGIN_FAILED_EMAIL_1H, 'high');
  }
  for (const row of data.failed_logins_by_email['24h']) {
    check('LOGIN_FAILED_EMAIL_24H', row.email, row.count,
          THRESHOLDS.LOGIN_FAILED_EMAIL_24H, 'medium');
  }
  for (const row of data.two_fa_failures_by_user['1h']) {
    const id = row.email || String(row.user_id);
    check('TWO_FA_FAILED_USER_1H', id, row.count,
          THRESHOLDS.TWO_FA_FAILED_USER_1H, 'high');
  }
  for (const row of data.two_fa_failures_by_user['24h']) {
    const id = row.email || String(row.user_id);
    check('TWO_FA_FAILED_USER_24H', id, row.count,
          THRESHOLDS.TWO_FA_FAILED_USER_24H, 'medium');
  }

  // Spike detection: skip when baseline is zero (no history yet)
  const spike = data.auth_spike;
  if (spike.baseline_hourly_avg > 0) {
    const multiplier = spike.current_hour / spike.baseline_hourly_avg;
    if (multiplier >= THRESHOLDS.AUTH_SPIKE_MULTIPLIER) {
      alerts.push({
        signal:    'AUTH_SPIKE',
        offender:  null,
        count:     spike.current_hour,
        threshold: THRESHOLDS.AUTH_SPIKE_MULTIPLIER,
        severity:  'high',
        detail:    `Current hour: ${spike.current_hour} events vs baseline avg ${spike.baseline_hourly_avg}/h (${multiplier.toFixed(1)}×)`,
      });
    }
  }

  return alerts;
}

// ── Threshold analytics cache ─────────────────────────────────────────────────
// Short-lived in-memory cache for the unfiltered threshold report.
// Prevents N×7 DB queries when the dashboard polls the endpoint frequently.
// Resets on process restart (acceptable — data is seconds-old at most).

const ANALYTICS_CACHE_TTL_MS = 30 * 1000; // 30 seconds
let _analyticsCache = null;

function _clearAnalyticsCache() { _analyticsCache = null; } // test helper

// ── Orchestrator ──────────────────────────────────────────────────────────────

async function runSecurityAnalytics() {
  if (_analyticsCache && Date.now() - _analyticsCache.ts < ANALYTICS_CACHE_TTL_MS) {
    return _analyticsCache.result;
  }
  const generatedAt = new Date().toISOString();
  const errors = [];

  let ip1h = [], ip24h = [];
  let email1h = [], email24h = [];
  let tfa1h = [], tfa24h = [];
  let spike = { current_hour: 0, baseline_hourly_avg: 0 };

  try {
    [ip1h, ip24h, email1h, email24h, tfa1h, tfa24h, spike] = await Promise.all([
      queryFailedLoginsByIp(1),
      queryFailedLoginsByIp(24),
      queryFailedLoginsByEmail(1),
      queryFailedLoginsByEmail(24),
      query2FAFailuresByUser(1),
      query2FAFailuresByUser(24),
      queryAuthSpike(),
    ]);
  } catch (err) {
    console.error('[SECURITY ANALYTICS] Database query failed:', err?.stack || err);
    errors.push({
      phase: 'database',
      message: 'Failed to run analytics queries',
      errorMessage: err?.message || String(err),
    });
  }

  const signals = {
    failed_logins_by_ip:     { '1h': ip1h,    '24h': ip24h    },
    failed_logins_by_email:  { '1h': email1h, '24h': email24h },
    two_fa_failures_by_user: { '1h': tfa1h,   '24h': tfa24h   },
    auth_spike:              spike,
  };

  const triggered = classifyThresholdAlerts(signals);

  const counts = {
    total_triggered: triggered.length,
    by_severity: { high: 0, medium: 0, low: 0 },
  };
  for (const a of triggered) {
    if (a.severity) counts.by_severity[a.severity] = (counts.by_severity[a.severity] || 0) + 1;
  }

  const result = { generated_at: generatedAt, thresholds: THRESHOLDS, signals, triggered_thresholds: triggered, counts, errors };
  _analyticsCache = { result, ts: Date.now() };
  return result;
}

// ── Filtered query API ────────────────────────────────────────────────────────
// Supports arbitrary filtering by event type, IP, user, email, and time window.
// Used by GET /admin/security-events/analytics.

// Allowlist of known event types — prevents arbitrary string injection into
// the WHERE clause even though values are parameterized.
const VALID_EVENT_TYPES = new Set([
  'LOGIN_FAILED', 'LOGIN_SUCCESS', '2FA_FAILED',
  'PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET_COMPLETED',
  'API_KEY_ROTATED', 'REGISTER_SUCCESS', 'REGISTER_FAILED',
]);

/**
 * Validates and normalises raw query-string filters.
 * Returns a clean object safe to pass to buildSecurityEventsQuery.
 * Pure function — no I/O.
 */
function sanitizeFilters(raw = {}) {
  const _parsed     = parseInt(raw.window_hours, 10);
  const windowHours = Math.min(Math.max(isNaN(_parsed) ? 24 : _parsed, 1), 720);
  const eventType   = VALID_EVENT_TYPES.has(raw.event_type) ? raw.event_type : null;
  // net.isIP returns 4 (IPv4), 6 (IPv6), or 0 (invalid) — stricter than a regex
  // and catches out-of-range octets (e.g. 999.0.0.1) that a character allowlist misses.
  const ip          = (raw.ip && typeof raw.ip === 'string' && net.isIP(raw.ip) !== 0)
    ? raw.ip : null;
  const userId      = raw.user_id ? (parseInt(raw.user_id, 10) || null) : null;
  const email       = (raw.email && typeof raw.email === 'string' && raw.email.length <= 255)
    ? hashEmail(raw.email.trim().toLowerCase()) : null;

  return { window_hours: windowHours, event_type: eventType, ip, user_id: userId, email };
}

/**
 * Builds a shared parameterized WHERE clause + params array from sanitized filters.
 * Pure function — no I/O.  Used by all filtered query helpers below.
 *
 * @param {object} filters  output of sanitizeFilters()
 * @returns {{ where: string, params: any[] }}
 */
function buildSecurityEventsQuery(filters) {
  const params     = [];
  const conditions = [];

  params.push(filters.window_hours);
  conditions.push(`se.created_at > NOW() - make_interval(hours => $${params.length}::int)`);

  if (filters.event_type) {
    params.push(filters.event_type);
    conditions.push(`se.event_type = $${params.length}`);
  }
  if (filters.ip) {
    params.push(filters.ip);
    conditions.push(`se.ip_address = $${params.length}::inet`);
  }
  if (filters.user_id) {
    params.push(filters.user_id);
    conditions.push(`se.user_id = $${params.length}`);
  }
  if (filters.email) {
    params.push(filters.email);
    conditions.push(`LOWER(se.email) = $${params.length}`);
  }

  return { where: conditions.join(' AND '), params };
}

async function queryAggregates(filters) {
  const { where, params } = buildSecurityEventsQuery(filters);

  const [byTypeResult, statsResult] = await Promise.all([
    pool.query(
      `SELECT se.event_type, COUNT(*)::int AS count
         FROM security_events se
        WHERE ${where}
        GROUP BY se.event_type
        ORDER BY count DESC`,
      params
    ),
    pool.query(
      `SELECT COUNT(*)::int AS total,
              COUNT(DISTINCT se.ip_address)::int AS unique_ips,
              COUNT(DISTINCT se.user_id)::int AS unique_users
         FROM security_events se
        WHERE ${where}`,
      params
    ),
  ]);

  return {
    total_events:  statsResult.rows[0].total,
    unique_ips:    statsResult.rows[0].unique_ips,
    unique_users:  statsResult.rows[0].unique_users,
    by_event_type: byTypeResult.rows,
  };
}

async function queryTrend(filters) {
  const { where, params } = buildSecurityEventsQuery(filters);
  const { rows } = await pool.query(
    `SELECT date_trunc('hour', se.created_at) AS hour,
            se.event_type,
            COUNT(*)::int AS count
       FROM security_events se
      WHERE ${where}
      GROUP BY 1, 2
      ORDER BY 1 ASC`,
    params
  );
  return rows; // [{ hour, event_type, count }]
}

async function queryTopOffenders(filters) {
  const { where, params } = buildSecurityEventsQuery(filters);

  const [ipsResult, emailsResult] = await Promise.all([
    pool.query(
      `SELECT se.ip_address::text AS ip_address, COUNT(*)::int AS count
         FROM security_events se
        WHERE ${where}
          AND se.ip_address IS NOT NULL
        GROUP BY se.ip_address
        ORDER BY count DESC
        LIMIT 10`,
      params
    ),
    pool.query(
      `SELECT se.email, COUNT(*)::int AS count
         FROM security_events se
        WHERE ${where}
          AND se.email IS NOT NULL
        GROUP BY se.email
        ORDER BY count DESC
        LIMIT 10`,
      params
    ),
  ]);

  return { ips: ipsResult.rows, emails: emailsResult.rows };
}

async function queryRecentEvents(filters) {
  const { where, params: base } = buildSecurityEventsQuery(filters);
  const params = [...base, 100];
  // Intentionally excludes user_agent and details to avoid logging sensitive payloads
  const { rows } = await pool.query(
    `SELECT se.id, se.event_type, se.user_id, se.ip_address::text AS ip_address,
            se.email, se.created_at
       FROM security_events se
      WHERE ${where}
      ORDER BY se.created_at DESC
      LIMIT $${params.length}`,
    params
  );
  return rows;
}

/**
 * Orchestrates all filtered analytics queries in parallel.
 * Accepts raw query-string params — sanitization happens internally.
 *
 * @param {object} rawFilters  e.g. req.query
 * @returns {object} structured analytics report
 */
async function runFilteredAnalytics(rawFilters = {}) {
  const filters     = sanitizeFilters(rawFilters);
  const generatedAt = new Date().toISOString();
  const errors      = [];

  let aggregates   = { total_events: 0, unique_ips: 0, unique_users: 0, by_event_type: [] };
  let trend        = [];
  let topOffenders = { ips: [], emails: [] };
  let recentEvents = [];

  try {
    [aggregates, trend, topOffenders, recentEvents] = await Promise.all([
      queryAggregates(filters),
      queryTrend(filters),
      queryTopOffenders(filters),
      queryRecentEvents(filters),
    ]);
  } catch (err) {
    errors.push({
      phase: 'database',
      message: 'Failed to run filtered analytics queries',
      errorCode: 'FILTERED_ANALYTICS_QUERY_FAILED',
    });
  }

  return {
    generated_at:    generatedAt,
    filters_applied: filters,
    aggregates,
    trend,
    top_offenders:   topOffenders,
    recent_events:   recentEvents,
    errors,
  };
}

module.exports = {
  runSecurityAnalytics,
  classifyThresholdAlerts,  // exported for unit testing
  THRESHOLDS,
  // Filtered query API
  runFilteredAnalytics,
  sanitizeFilters,          // exported for unit testing
  buildSecurityEventsQuery, // exported for unit testing
  VALID_EVENT_TYPES,
  _clearAnalyticsCache,     // test helper
};
