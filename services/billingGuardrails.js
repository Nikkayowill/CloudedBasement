// services/billingGuardrails.js
// Manages per-user monthly spend thresholds and spend forecasting.
//
// Threshold deduplication: one alert per (user_id, cycle, threshold_pct) per
// billing cycle. `cycle` is the YYYY-MM string of the current month.
//
// Forecast: simple linear projection based on days elapsed in the current month.
// Uses the sum of charges from payment_history for the current calendar month
// as the "spent so far" basis.

'use strict';

const pool = require('../db');

// ── Helpers ───────────────────────────────────────────────────────────────────

function currentCycle() {
  return new Date().toISOString().slice(0, 7); // 'YYYY-MM'
}

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate(); // month is 1-based
}

// ── Guardrail CRUD ────────────────────────────────────────────────────────────

async function getGuardrails(userId) {
  const result = await pool.query(
    `SELECT id, monthly_limit, warn_at_percent, enabled, updated_at
       FROM billing_guardrails
      WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0] || {
    monthly_limit:   null,
    warn_at_percent: 80,
    enabled:         true,
  };
}

/**
 * Upsert guardrails for a user.
 * Only the fields present in `patch` are updated.
 */
async function updateGuardrails(userId, patch) {
  const { monthly_limit, warn_at_percent, enabled } = patch;

  if (monthly_limit !== undefined && monthly_limit !== null) {
    const limit = parseFloat(monthly_limit);
    if (isNaN(limit) || limit <= 0) throw new Error('monthly_limit must be a positive number');
  }
  if (warn_at_percent !== undefined) {
    const pct = parseInt(warn_at_percent, 10);
    if (isNaN(pct) || pct < 1 || pct > 99) throw new Error('warn_at_percent must be between 1 and 99');
  }

  await pool.query(
    `INSERT INTO billing_guardrails (user_id, monthly_limit, warn_at_percent, enabled, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (user_id) DO UPDATE SET
       monthly_limit   = COALESCE(EXCLUDED.monthly_limit,   billing_guardrails.monthly_limit),
       warn_at_percent = COALESCE(EXCLUDED.warn_at_percent, billing_guardrails.warn_at_percent),
       enabled         = COALESCE(EXCLUDED.enabled,         billing_guardrails.enabled),
       updated_at      = NOW()`,
    [
      userId,
      monthly_limit   !== undefined ? (monthly_limit === null ? null : parseFloat(monthly_limit)) : undefined,
      warn_at_percent !== undefined ? parseInt(warn_at_percent, 10) : undefined,
      enabled         !== undefined ? Boolean(enabled) : undefined,
    ].map((v, i) => i === 0 ? v : v === undefined ? null : v)
  );

  return getGuardrails(userId);
}

// ── Forecast ──────────────────────────────────────────────────────────────────

/**
 * Returns { spent_this_month, forecast_month_end, cycle, days_elapsed, days_in_month }
 * using payment_history rows for the current calendar month.
 *
 * Returns null if payment_history table doesn't exist or has no rows.
 */
async function getSpendForecast(userId) {
  const now   = new Date();
  const year  = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1; // 1-based
  const cycle = currentCycle();
  const total = daysInMonth(year, month);
  const elapsed = now.getUTCDate();

  // Sum of successful charges this calendar month
  let spentRaw = 0;
  try {
    const result = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total
         FROM payment_history
        WHERE user_id = $1
          AND status  = 'succeeded'
          AND created_at >= date_trunc('month', NOW())
          AND created_at <  date_trunc('month', NOW()) + INTERVAL '1 month'`,
      [userId]
    );
    spentRaw = parseFloat(result.rows[0]?.total ?? 0);
  } catch {
    // payment_history may not exist in all environments
  }

  const spent    = Math.round(spentRaw * 100) / 100;
  const daily    = elapsed > 0 ? spent / elapsed : 0;
  const forecast = Math.round(daily * total * 100) / 100;

  return {
    cycle,
    spent_this_month:   spent,
    forecast_month_end: forecast,
    days_elapsed:       elapsed,
    days_in_month:      total,
  };
}

// ── Threshold check (call from billing webhooks or cron) ──────────────────────

/**
 * Checks if the user has crossed their warn_at_percent threshold for the current
 * cycle and records if not yet sent.  Returns { triggered, threshold_pct, limit }
 * or null if no guardrail set / not enabled.
 *
 * Does NOT send notifications — caller is responsible for that.
 */
async function checkThreshold(userId) {
  const guardrail = await getGuardrails(userId);
  if (!guardrail.enabled || !guardrail.monthly_limit) return null;

  const forecast = await getSpendForecast(userId);
  const spent    = forecast.spent_this_month;
  const limit    = parseFloat(guardrail.monthly_limit);
  const warnPct  = guardrail.warn_at_percent;
  const spentPct = limit > 0 ? Math.round((spent / limit) * 100) : 0;

  if (spentPct < warnPct) return null;

  const cycle = currentCycle();

  // Dedup: only trigger if not already sent this cycle
  const existing = await pool.query(
    `SELECT id FROM billing_threshold_sent
      WHERE user_id = $1 AND cycle = $2 AND threshold_pct = $3`,
    [userId, cycle, warnPct]
  );
  if (existing.rows.length > 0) return null; // already alerted this cycle

  await pool.query(
    `INSERT INTO billing_threshold_sent (user_id, cycle, threshold_pct)
     VALUES ($1, $2, $3)
     ON CONFLICT DO NOTHING`,
    [userId, cycle, warnPct]
  );

  return {
    triggered:     true,
    threshold_pct: warnPct,
    limit,
    spent,
    spent_pct:     spentPct,
  };
}

module.exports = {
  getGuardrails,
  updateGuardrails,
  getSpendForecast,
  checkThreshold,
  currentCycle,
};
