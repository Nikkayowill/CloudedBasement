// services/notifier.js
// Unified webhook/Slack/Discord delivery with DNS-level SSRF protection.
// All channels share one validation + timeout pipeline.
// Email is NOT handled here — use services/email.js.

const dns = require('dns').promises;
const net = require('net');
const https = require('https');

const SEND_TIMEOUT_MS = 5000;
const MAX_RESPONSE_BYTES = 64 * 1024;

// Literal hostname patterns that are always private — checked before DNS
const PRIVATE_HOST_RE = /^(localhost|0\.0\.0\.0$|0\.|127\.|10\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|::1$|fe80:|fc[0-9a-f]{2}:|fd[0-9a-f]{2}:|::ffff:(0\.0\.0\.0|127\.|10\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.))/i;
// IP address patterns from resolved DNS — catches IPv4-mapped IPv6 etc.
const PRIVATE_ADDR_RE = /^(0\.0\.0\.0$|127\.|10\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|::1$|fe80:|fc[0-9a-f]{2}:|fd[0-9a-f]{2}:|::ffff:(0\.0\.0\.0|127\.|10\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.))/i;

/**
 * Validate a webhook URL before delivery.
 * Enforces: valid URL, https-only, no private IPs in literal or resolved hostname.
 * Throws an Error on any failure; resolves to pinned connection details on success.
 */
async function validateWebhookUrl(url) {
  if (!url || typeof url !== 'string') throw new Error('Webhook URL is required');

  let parsed;
  try { parsed = new URL(url); } catch { throw new Error('Invalid webhook URL'); }

  if (parsed.protocol !== 'https:') throw new Error('Webhook URL must use HTTPS');

  const { hostname } = parsed;

  if (PRIVATE_HOST_RE.test(hostname)) {
    throw new Error('Webhook URL cannot point to a private address');
  }

  // DNS-level check: hostname may be public-looking but resolve to private
  let addrs;
  try {
    addrs = await dns.lookup(hostname, { all: true });
  } catch {
    throw new Error('Could not resolve webhook hostname');
  }

  for (const { address } of addrs) {
    const isPrivate = (net.isPrivate && net.isPrivate(address)) || PRIVATE_ADDR_RE.test(address);
    if (isPrivate) throw new Error('Webhook hostname resolves to a private IP');
  }

  // Pin to the first validated address to avoid DNS re-resolution during send.
  return {
    parsed,
    hostname,
    pinnedIp: addrs[0].address
  };
}

/**
 * Send a JSON payload to a webhook URL.
 * Always calls validateWebhookUrl first.
 * Times out after SEND_TIMEOUT_MS.
 */
async function sendWebhook(url, payload) {
  const { parsed, hostname, pinnedIp } = await validateWebhookUrl(url);
  const body = JSON.stringify(payload);
  const port = parsed.port ? Number(parsed.port) : 443;

  await new Promise((resolve, reject) => {
    const req = https.request({
      protocol: 'https:',
      host: pinnedIp,
      port,
      method: 'POST',
      path: `${parsed.pathname}${parsed.search}`,
      servername: hostname,
      timeout: SEND_TIMEOUT_MS,
      headers: {
        'Host': parsed.host,
        'Content-Type': 'application/json',
        'User-Agent': 'CloudedBasement/1.0',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let responseBody = '';
      let bytesReceived = 0;
      let tooLarge = false;

      res.on('data', (chunk) => {
        if (tooLarge) return;
        bytesReceived += chunk.length;
        if (bytesReceived > MAX_RESPONSE_BYTES) {
          tooLarge = true;
          res.destroy(new Error(`Webhook response exceeded ${MAX_RESPONSE_BYTES} bytes`));
          return;
        }
        responseBody += chunk.toString();
      });
      res.on('error', (err) => reject(err));
      res.on('end', () => {
        if (tooLarge) return;
        if (res.statusCode >= 200 && res.statusCode < 300) {
          return resolve();
        }

        const snippet = responseBody.slice(0, 300);
        return reject(new Error(`Webhook request failed with status ${res.statusCode}: ${snippet}`));
      });
    });

    req.on('timeout', () => {
      req.destroy(new Error('Webhook request timed out'));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/**
 * Send a resource-alert to a Slack incoming webhook.
 * @param {string} url
 * @param {{ metric: string, value: number, threshold: number, serverName: string }} alert
 */
async function sendSlack(url, { metric, value, unit = '%', threshold, serverName }) {
  const label = metric.charAt(0).toUpperCase() + metric.slice(1);
  const fmt = (v) => unit === '%' ? `${v}%` : `${v} ${unit}`;
  return sendWebhook(url, {
    text: `⚠️ *${label} Alert* on \`${serverName}\``,
    attachments: [{
      color:  '#FF4444',
      fields: [
        { title: 'Metric',    value: label,              short: true },
        { title: 'Current',   value: fmt(value),         short: true },
        { title: 'Threshold', value: fmt(threshold),     short: true },
        { title: 'Server',    value: serverName,          short: true },
      ],
      footer: 'Clouded Basement Alerts',
      ts:     Math.floor(Date.now() / 1000),
    }],
  });
}

/**
 * Send a resource-alert to a Discord webhook.
 * @param {string} url
 * @param {{ metric: string, value: number, threshold: number, serverName: string }} alert
 */
async function sendDiscord(url, { metric, value, unit = '%', threshold, serverName }) {
  const label = metric.charAt(0).toUpperCase() + metric.slice(1);
  const fmt = (v) => unit === '%' ? `${v}%` : `${v} ${unit}`;
  return sendWebhook(url, {
    embeds: [{
      title:     `⚠️ ${label} Alert — ${serverName}`,
      color:     0xFF4444,
      fields:    [
        { name: 'Current',   value: fmt(value),     inline: true },
        { name: 'Threshold', value: fmt(threshold), inline: true },
      ],
      footer:    { text: 'Clouded Basement Alerts' },
      timestamp: new Date().toISOString(),
    }],
  });
}

module.exports = { validateWebhookUrl, sendWebhook, sendSlack, sendDiscord };
