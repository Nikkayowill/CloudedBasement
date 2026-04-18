// services/securityLog.js
// Write security-relevant events to the security_events table.
// Fire-and-forget — never blocks the request path.

const crypto = require('crypto');
const pool = require('../db');

const TRUST_PROXY = /^(1|true|yes)$/i.test(process.env.TRUST_PROXY || '');
const TRUSTED_PROXIES = new Set(
  (process.env.TRUSTED_PROXIES || '')
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean)
    .map((ip) => normalizeIp(ip))
);

function normalizeIp(ip) {
  if (!ip || typeof ip !== 'string') return null;
  const trimmed = ip.trim();
  if (trimmed.startsWith('::ffff:')) return trimmed.slice(7);
  return trimmed;
}

function isTrustedProxy(ip) {
  const normalized = normalizeIp(ip);
  if (!normalized || !TRUST_PROXY) return false;
  if (TRUSTED_PROXIES.size === 0) return false;
  return TRUSTED_PROXIES.has(normalized);
}

function hashEmail(email) {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) return null;
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

async function logSecurityEvent({ userId = null, eventType, ip = null, userAgent = null, email = null, details = {} }) {
  try {
    if (!eventType || typeof eventType !== 'string' || !eventType.trim()) {
      throw new Error('eventType is required for security logging');
    }

    const emailValue = details?.persistRawEmail === true
      ? (email || null)
      : hashEmail(email);

    await pool.query(
      `INSERT INTO security_events (event_type, user_id, ip_address, user_agent, email, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [eventType.trim(), userId || null, ip || null, userAgent || null, emailValue, JSON.stringify(details)]
    );
  } catch (err) {
    console.error('[SECURITY] Failed to log security event:', err.message);
  }
}

function getClientIp(req) {
  const remoteIp = normalizeIp(req.socket?.remoteAddress || null);

  if (TRUST_PROXY && isTrustedProxy(remoteIp)) {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor && typeof forwardedFor === 'string') {
      const chain = forwardedFor
        .split(',')
        .map((entry) => normalizeIp(entry))
        .filter(Boolean);

      for (let i = chain.length - 1; i >= 0; i--) {
        if (!isTrustedProxy(chain[i])) {
          return chain[i];
        }
      }
    }

    const realIp = normalizeIp(req.headers['x-real-ip']);
    if (realIp && !isTrustedProxy(realIp)) {
      return realIp;
    }
  }

  return remoteIp || null;
}

module.exports = { logSecurityEvent, getClientIp };
