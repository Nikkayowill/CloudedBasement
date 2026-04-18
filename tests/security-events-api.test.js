// tests/security-events-api.test.js
// Tests for the filterable security event analytics API.
//
// sanitizeFilters and buildSecurityEventsQuery are pure functions — tested
// without any DB or HTTP overhead.
// Permission checks use supertest against the live Express app.

'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const request = require('supertest');
const app = require('../index');

const {
  sanitizeFilters,
  buildSecurityEventsQuery,
  VALID_EVENT_TYPES,
} = require('../services/securityAnalytics');

// ── sanitizeFilters ───────────────────────────────────────────────────────────

describe('sanitizeFilters — defaults', () => {
  test('returns window_hours=24 when not provided', () => {
    const f = sanitizeFilters({});
    assert.equal(f.window_hours, 24);
  });

  test('all optional filters are null when not provided', () => {
    const f = sanitizeFilters({});
    assert.equal(f.event_type, null);
    assert.equal(f.ip, null);
    assert.equal(f.user_id, null);
    assert.equal(f.email, null);
  });
});

describe('sanitizeFilters — window_hours', () => {
  test('parses numeric string', () => {
    assert.equal(sanitizeFilters({ window_hours: '48' }).window_hours, 48);
  });

  test('minimum clamps to 1', () => {
    assert.equal(sanitizeFilters({ window_hours: '0' }).window_hours,  1);
    assert.equal(sanitizeFilters({ window_hours: '-5' }).window_hours, 1);
  });

  test('maximum clamps to 720 (30 days)', () => {
    assert.equal(sanitizeFilters({ window_hours: '9999' }).window_hours, 720);
    assert.equal(sanitizeFilters({ window_hours: '721' }).window_hours,  720);
  });

  test('non-numeric string falls back to default 24', () => {
    assert.equal(sanitizeFilters({ window_hours: 'abc' }).window_hours, 24);
  });
});

describe('sanitizeFilters — event_type', () => {
  test('accepts all known event types', () => {
    for (const et of VALID_EVENT_TYPES) {
      assert.equal(sanitizeFilters({ event_type: et }).event_type, et);
    }
  });

  test('rejects unknown event type (returns null)', () => {
    assert.equal(sanitizeFilters({ event_type: 'DROP_TABLE' }).event_type, null);
    assert.equal(sanitizeFilters({ event_type: '' }).event_type,           null);
    assert.equal(sanitizeFilters({ event_type: 'login_failed' }).event_type, null, // case-sensitive
      'event_type filter must be case-sensitive');
  });
});

describe('sanitizeFilters — ip', () => {
  test('accepts valid IPv4', () => {
    assert.equal(sanitizeFilters({ ip: '192.168.1.100' }).ip, '192.168.1.100');
  });

  test('accepts valid IPv6', () => {
    assert.equal(sanitizeFilters({ ip: '2001:db8::1' }).ip, '2001:db8::1');
  });

  test('rejects IP with disallowed characters', () => {
    assert.equal(sanitizeFilters({ ip: "'; DROP TABLE"  }).ip, null);
    assert.equal(sanitizeFilters({ ip: '<script>'        }).ip, null);
    assert.equal(sanitizeFilters({ ip: 'not-an-ip'       }).ip, null);
  });

  test('rejects out-of-range IPv4 octets (net.isIP stricter than a character regex)', () => {
    // A character allowlist would accept '999.999.0.1' — net.isIP correctly rejects it
    assert.equal(sanitizeFilters({ ip: '999.999.0.1' }).ip, null);
    assert.equal(sanitizeFilters({ ip: '256.0.0.1'   }).ip, null);
  });

  test('rejects IP strings longer than 45 characters', () => {
    const longStr = '1'.repeat(46);
    assert.equal(sanitizeFilters({ ip: longStr }).ip, null);
  });

  test('null/missing ip returns null', () => {
    assert.equal(sanitizeFilters({}).ip, null);
    assert.equal(sanitizeFilters({ ip: null }).ip, null);
  });
});

describe('sanitizeFilters — user_id', () => {
  test('parses numeric string to integer', () => {
    assert.equal(sanitizeFilters({ user_id: '42' }).user_id, 42);
  });

  test('non-numeric user_id returns null', () => {
    assert.equal(sanitizeFilters({ user_id: 'abc' }).user_id, null);
  });

  test('absent user_id returns null', () => {
    assert.equal(sanitizeFilters({}).user_id, null);
  });
});

describe('sanitizeFilters — email', () => {
  const hashEmail = (value) => crypto.createHash('sha256').update(value).digest('hex');

  test('lowercases the email address', () => {
    assert.equal(sanitizeFilters({ email: 'User@EXAMPLE.COM' }).email, hashEmail('user@example.com'));
  });

  test('trims surrounding whitespace', () => {
    assert.equal(sanitizeFilters({ email: '  user@example.com  ' }).email, hashEmail('user@example.com'));
  });

  test('email longer than 255 chars returns null', () => {
    const long = 'a'.repeat(252) + '@b.com'; // 258 chars
    assert.ok(long.length > 255);
    const tooLong = 'a'.repeat(250) + '@b.com';
    assert.equal(sanitizeFilters({ email: tooLong }).email, null);
  });

  test('absent email returns null', () => {
    assert.equal(sanitizeFilters({}).email, null);
  });
});

// ── buildSecurityEventsQuery ──────────────────────────────────────────────────

describe('buildSecurityEventsQuery — WHERE clause construction', () => {
  test('always includes time-window condition as first clause', () => {
    const { where, params } = buildSecurityEventsQuery(sanitizeFilters({ window_hours: '6' }));
    assert.ok(where.includes('make_interval'), 'must use make_interval for the time window');
    assert.equal(params[0], 6, 'first param must be window_hours');
  });

  test('no extra conditions when only window_hours provided', () => {
    const { where, params } = buildSecurityEventsQuery(sanitizeFilters({}));
    assert.equal(params.length, 1, 'only window_hours param expected');
    assert.ok(!where.includes('event_type'), 'no event_type condition');
    assert.ok(!where.includes('ip_address'),  'no ip condition');
    assert.ok(!where.includes('user_id'),      'no user_id condition');
    assert.ok(!where.includes('email'),        'no email condition');
  });

  test('event_type filter adds parameterized equality condition', () => {
    const { where, params } = buildSecurityEventsQuery(
      sanitizeFilters({ event_type: 'LOGIN_FAILED' })
    );
    assert.ok(where.includes('event_type'), 'WHERE must reference event_type');
    assert.ok(params.includes('LOGIN_FAILED'), 'LOGIN_FAILED must be a bound param');
    assert.ok(!where.includes("'LOGIN_FAILED'"), 'must NOT be interpolated directly into SQL');
  });

  test('ip filter adds ::inet cast and parameterized value', () => {
    const { where, params } = buildSecurityEventsQuery(
      sanitizeFilters({ ip: '1.2.3.4' })
    );
    assert.ok(where.includes('::inet'), 'IP condition must cast to inet');
    assert.ok(params.includes('1.2.3.4'), '1.2.3.4 must be a bound param');
    assert.ok(!where.includes("'1.2.3.4'"), 'must NOT be interpolated directly into SQL');
  });

  test('user_id filter adds integer param', () => {
    const { where, params } = buildSecurityEventsQuery(
      sanitizeFilters({ user_id: '99' })
    );
    assert.ok(where.includes('user_id'), 'WHERE must reference user_id');
    assert.ok(params.includes(99), 'user_id must be bound as integer 99');
  });

  test('email filter adds LOWER() condition', () => {
    const { where, params } = buildSecurityEventsQuery(
      sanitizeFilters({ email: 'TEST@EXAMPLE.COM' })
    );
    assert.ok(where.toUpperCase().includes('LOWER'), 'must use LOWER() for case-insensitive match');
    assert.ok(params.includes(crypto.createHash('sha256').update('test@example.com').digest('hex')), 'email hash must be bound in params');
  });

  test('all filters combined produce params in correct order', () => {
    const filters = sanitizeFilters({
      window_hours: '12',
      event_type:   'LOGIN_FAILED',
      ip:           '5.5.5.5',
      user_id:      '7',
      email:        'x@y.com',
    });
    const { where, params } = buildSecurityEventsQuery(filters);
    assert.equal(params[0], 12,             'first param = window_hours');
    assert.equal(params[1], 'LOGIN_FAILED', 'second param = event_type');
    assert.equal(params[2], '5.5.5.5',     'third param = ip');
    assert.equal(params[3], 7,             'fourth param = user_id');
    assert.equal(params[4], crypto.createHash('sha256').update('x@y.com').digest('hex'), 'fifth param = email hash');
    assert.equal(params.length, 5);
    // Verify each param is referenced as $1…$5, not inlined
    for (let i = 1; i <= 5; i++) {
      assert.ok(where.includes(`$${i}`), `$${i} must appear in WHERE`);
    }
  });

  test('null filters are not added to params or WHERE', () => {
    // event_type stripped because 'INVALID' is not in VALID_EVENT_TYPES
    const filters = sanitizeFilters({ window_hours: '24', event_type: 'INVALID' });
    const { params } = buildSecurityEventsQuery(filters);
    assert.equal(params.length, 1, 'invalid event_type must not add a param');
  });

  test('returned params array is a fresh copy — mutations do not affect re-calls', () => {
    const filters = sanitizeFilters({ event_type: 'LOGIN_FAILED' });
    const r1 = buildSecurityEventsQuery(filters);
    r1.params.push('EXTRA');
    const r2 = buildSecurityEventsQuery(filters);
    assert.equal(r2.params.length, r1.params.length - 1,
      'params from first call must not bleed into second call');
  });
});

// ── Permission checks (supertest) ─────────────────────────────────────────────

describe('GET /admin/security-events/analytics — auth guard', () => {
  test('returns 401 for unauthenticated JSON client', async () => {
    const res = await request(app)
      .get('/admin/security-events/analytics')
      .set('Accept', 'application/json');
    assert.equal(res.statusCode, 401);
  });

  test('returns 302 redirect for unauthenticated browser request', async () => {
    const res = await request(app).get('/admin/security-events/analytics');
    assert.equal(res.statusCode, 302);
    assert.ok(res.headers.location?.includes('/login') ||
              res.headers.location?.includes('/auth'),
      'unauthenticated browser must be redirected to login');
  });
});

describe('GET /admin/security/analytics — auth guard (existing endpoint regression)', () => {
  test('returns 401 for unauthenticated JSON client', async () => {
    const res = await request(app)
      .get('/admin/security/analytics')
      .set('Accept', 'application/json');
    assert.equal(res.statusCode, 401);
  });
});
