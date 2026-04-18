// services/alertMonitor.js
// Runs every 5 minutes. Reads the latest stored metrics row per server,
// applies a state machine (armed → triggered → armed) per alert rule,
// and fires multi-channel notifications on state transitions.

const pool = require('../db');
const { sendEmail }   = require('./email');
const { sendWebhook, sendSlack, sendDiscord } = require('./notifier');

// ── Notification helpers ──────────────────────────────────────────────────────

async function notifyEmail(userEmail, metric, currentValue, threshold) {
  const label = metric.charAt(0).toUpperCase() + metric.slice(1);
  const plain = `Your server's ${metric} usage has reached ${currentValue}%, exceeding your alert threshold of ${threshold}%.\n\nLog in to investigate: https://cloudedbasement.ca/dashboard`;
  const html  = `<p>Your server's <strong>${metric}</strong> usage has reached <strong>${currentValue}%</strong>, exceeding your alert threshold of ${threshold}%.</p><p><a href="https://cloudedbasement.ca/dashboard">Log in to investigate</a></p>`;
  await sendEmail(userEmail, `⚠️ ${label.charAt(0).toUpperCase() + label.slice(1)} Alert: ${currentValue}% on your Clouded Basement server`, html, plain);
}

// ── Fire all channels for a triggered rule ───────────────────────────────────

async function fireNotifications(user, server, rule, currentValue) {
  const alert = { metric: rule.metric, value: currentValue, threshold: rule.threshold_pct, serverName: server.hostname };
  const channels = [];

  const tasks = [
    notifyEmail(user.email, rule.metric, currentValue, rule.threshold_pct)
      .then(() => channels.push('email'))
      .catch(err => console.error('[ALERT] email failed:', err.message)),
  ];

  if (server.slack_webhook_url) {
    tasks.push(
      sendSlack(server.slack_webhook_url, alert)
        .then(() => channels.push('slack'))
        .catch(err => console.error('[ALERT] slack failed:', err.message))
    );
  }

  if (server.discord_webhook_url) {
    tasks.push(
      sendDiscord(server.discord_webhook_url, alert)
        .then(() => channels.push('discord'))
        .catch(err => console.error('[ALERT] discord failed:', err.message))
    );
  }

  if (server.notify_webhook_url) {
    tasks.push(
      sendWebhook(server.notify_webhook_url, {
        event:     'resource_alert',
        metric:    rule.metric,
        current:   currentValue,
        threshold: rule.threshold_pct,
        server:    server.hostname,
        timestamp: new Date().toISOString(),
      })
        .then(() => channels.push('webhook'))
        .catch(err => console.error('[ALERT] webhook failed:', err.message))
    );
  }

  await Promise.all(tasks);
  return channels;
}

// ── Metric value extractor ────────────────────────────────────────────────────

function getMetricValue(row, metric) {
  if (!row) return null;
  let raw;
  if (metric === 'cpu')         raw = parseFloat(row.cpu_percent);
  else if (metric === 'memory') raw = parseFloat(row.memory_percent);
  else if (metric === 'disk')   raw = parseFloat(row.disk_percent);
  else return null;
  return Number.isFinite(raw) ? raw : null;
}

// ── Main loop ────────────────────────────────────────────────────────────────

async function runAlertMonitor() {
  try {
    // Load all active alert rules with their user email and server info
    const rulesResult = await pool.query(`
      SELECT
        r.id, r.user_id, r.metric, r.threshold_pct, r.state, r.snoozed_until,
        u.email,
        s.id         AS server_id,
        s.hostname,
        s.notify_webhook_url,
        s.slack_webhook_url,
        s.discord_webhook_url
      FROM resource_alert_rules r
      JOIN users   u ON u.id = r.user_id
      JOIN servers s ON s.user_id = r.user_id AND s.status = 'running'
      ORDER BY r.user_id, r.metric
    `);

    if (rulesResult.rows.length === 0) return;

    console.log(`[ALERT] Checking ${rulesResult.rows.length} rules across ${new Set(rulesResult.rows.map(r => r.server_id)).size} servers`);

    // Batch-fetch the latest metrics row per server to avoid N+1
    const serverIds = [...new Set(rulesResult.rows.map(r => r.server_id))];
    const metricsMap = {};

    await Promise.all(serverIds.map(async (sid) => {
      const res = await pool.query(
        `SELECT cpu_percent, memory_percent, disk_percent
           FROM server_metrics_history
          WHERE server_id = $1
          ORDER BY timestamp DESC
          LIMIT 1`,
        [sid]
      );
      metricsMap[sid] = res.rows[0] || null;
    }));

    const now = new Date();

    for (const rule of rulesResult.rows) {
      const latestRow    = metricsMap[rule.server_id];
      const currentValue = getMetricValue(latestRow, rule.metric);

      if (currentValue == null) continue;

      // Respect snooze
      if (rule.snoozed_until && new Date(rule.snoozed_until) > now) continue;

      const isBreaching = currentValue >= rule.threshold_pct;

      if (rule.state === 'armed' && isBreaching) {
        // Wrap state transition in a dedicated client transaction
        const txClient = await pool.connect();
        try {
          await txClient.query('BEGIN');
          const updated = await txClient.query(
            `UPDATE resource_alert_rules
                SET state = 'triggered', triggered_at = NOW(), resolved_at = NULL
              WHERE id = $1 AND state = 'armed'
              RETURNING id`,
            [rule.id]
          );
          if (updated.rows.length === 0) { await txClient.query('ROLLBACK'); continue; }

          const user   = { email: rule.email };
          const server = {
            id:                  rule.server_id,
            hostname:            rule.hostname,
            notify_webhook_url:  rule.notify_webhook_url,
            slack_webhook_url:   rule.slack_webhook_url,
            discord_webhook_url: rule.discord_webhook_url,
          };

          const channels = await fireNotifications(user, server, rule, currentValue);

          await txClient.query(
            `INSERT INTO alert_history
               (user_id, server_id, rule_id, metric, threshold_pct, peak_value, event_type, channels_notified)
             VALUES ($1, $2, $3, $4, $5, $6, 'triggered', $7)`,
            [rule.user_id, rule.server_id, rule.id, rule.metric, rule.threshold_pct, currentValue, channels]
          );

          await txClient.query('COMMIT');
          console.log(`[ALERT] TRIGGERED — user ${rule.user_id} ${rule.metric} ${currentValue}% >= ${rule.threshold_pct}% via [${channels.join(', ')}]`);
        } catch (err) {
          await txClient.query('ROLLBACK');
          console.error(`[ALERT] Transaction failed for rule ${rule.id}:`, err.message);
        } finally {
          txClient.release();
        }

      } else if (rule.state === 'triggered' && !isBreaching) {
        const txClient = await pool.connect();
        try {
          await txClient.query('BEGIN');
          const updated = await txClient.query(
            `UPDATE resource_alert_rules
                SET state = 'armed', resolved_at = NOW(), snoozed_until = NULL
              WHERE id = $1 AND state = 'triggered'
              RETURNING id`,
            [rule.id]
          );
          if (updated.rows.length === 0) { await txClient.query('ROLLBACK'); continue; }

          await txClient.query(
            `INSERT INTO alert_history
               (user_id, server_id, rule_id, metric, threshold_pct, peak_value, event_type, channels_notified)
             VALUES ($1, $2, $3, $4, $5, $6, 'resolved', '{}')`,
            [rule.user_id, rule.server_id, rule.id, rule.metric, rule.threshold_pct, currentValue]
          );

          await txClient.query('COMMIT');
          console.log(`[ALERT] RESOLVED — user ${rule.user_id} ${rule.metric} dropped to ${currentValue}%`);
        } catch (err) {
          await txClient.query('ROLLBACK');
          console.error(`[ALERT] Resolution transaction failed for rule ${rule.id}:`, err.message);
        } finally {
          txClient.release();
        }
      }
    }
  } catch (err) {
    console.error('[ALERT] Monitor run failed:', err.message);
  }
}

module.exports = { runAlertMonitor };
