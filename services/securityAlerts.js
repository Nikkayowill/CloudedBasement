// services/securityAlerts.js
// Dispatches security threshold alerts via existing notifier channels.
// Includes in-memory cooldown/dedupe to prevent alert spam.
//
// Cooldown is keyed on "<SIGNAL>:<offender>" — same signal against the same
// offender will not fire again until COOLDOWN_MS has elapsed.
//
// Limitation: the cooldown map is in-memory. It resets on process restart.
// For cross-process durability, move the map to a shared store (Redis/DB).

'use strict';

const { sendSlack, sendDiscord, sendWebhook } = require('./notifier');

const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour between repeated same-key alerts

// Key: "<SIGNAL>:<offender|__global__>" → timestamp of last dispatch (ms)
const _lastAlerted = new Map();

// ── Cooldown helpers ──────────────────────────────────────────────────────────

function _alertKey(signal, offender) {
  return `${signal}:${offender ?? '__global__'}`;
}

function shouldAlert(signal, offender) {
  const last = _lastAlerted.get(_alertKey(signal, offender));
  return !last || Date.now() - last >= COOLDOWN_MS;
}

function markAlerted(signal, offender) {
  _lastAlerted.set(_alertKey(signal, offender), Date.now());
}

// Test helpers — not intended for production call sites
function _resetCooldowns() {
  _lastAlerted.clear();
}

function _setLastAlerted(signal, offender, timestamp) {
  _lastAlerted.set(_alertKey(signal, offender), timestamp);
}

// ── Message builder ───────────────────────────────────────────────────────────

function buildAlertMessage(alert) {
  const offenderStr = alert.offender ? ` [${alert.offender}]` : '';
  const detail = alert.detail ? ` — ${alert.detail}` : '';
  return (
    `[SECURITY ALERT] ${alert.signal}${offenderStr}: ` +
    `${alert.count} events (threshold: ${alert.threshold}, severity: ${alert.severity})${detail}`
  );
}

// ── Dispatch ──────────────────────────────────────────────────────────────────

/**
 * Iterates triggered alerts, filters by cooldown, and dispatches to any
 * configured notifier channels (Slack / Discord / generic webhook).
 * Individual channel failures are silently swallowed — one broken webhook
 * must not suppress delivery to others.
 *
 * @param {object[]} triggeredAlerts  output of classifyThresholdAlerts()
 */
async function dispatchSecurityAlerts(triggeredAlerts) {
  const slackUrl   = process.env.SLACK_WEBHOOK_URL;
  const discordUrl = process.env.DISCORD_WEBHOOK_URL;
  const webhookUrl = process.env.ALERT_WEBHOOK_URL;

  if (!slackUrl && !discordUrl && !webhookUrl) return;

  for (const alert of triggeredAlerts) {
    if (!shouldAlert(alert.signal, alert.offender)) continue;

    const message    = buildAlertMessage(alert);
    const dispatched = new Date().toISOString();
    const promises   = [];
    const channelPayload = {
      metric: alert.signal,
      value: alert.count,
      unit: alert.unit || 'events',
      threshold: alert.threshold,
      serverName: alert.offender || 'global',
    };

    if (slackUrl) {
      promises.push(
        sendSlack(slackUrl, channelPayload)
          .then(() => true)
          .catch((err) => {
            console.error('[SECURITY ALERTS] Slack delivery failed:', err?.message || err);
            return false;
          })
      );
    }
    if (discordUrl) {
      promises.push(
        sendDiscord(discordUrl, channelPayload)
          .then(() => true)
          .catch((err) => {
            console.error('[SECURITY ALERTS] Discord delivery failed:', err?.message || err);
            return false;
          })
      );
    }
    if (webhookUrl) {
      // Webhook payload: structured data, not raw Stripe/sensitive fields
      const payload = {
        signal:     alert.signal,
        offender:   alert.offender,
        count:      alert.count,
        threshold:  alert.threshold,
        severity:   alert.severity,
        detail:     alert.detail ?? null,
        dispatched,
      };
      promises.push(
        sendWebhook(webhookUrl, payload)
          .then(() => true)
          .catch((err) => {
            console.error('[SECURITY ALERTS] Generic webhook delivery failed:', err?.message || err);
            return false;
          })
      );
    }

    const results = await Promise.all(promises);
    if (results.some(Boolean)) {
      markAlerted(alert.signal, alert.offender);
    } else {
      console.error(`[SECURITY ALERTS] No delivery channels succeeded for ${alert.signal}`);
    }
  }
}

module.exports = {
  dispatchSecurityAlerts,
  shouldAlert,
  markAlerted,
  _resetCooldowns,
  _setLastAlerted,
  COOLDOWN_MS,
};
