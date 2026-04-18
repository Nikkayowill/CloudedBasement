'use strict';
// tests/auth-matrix.test.js
// Auth matrix — four test categories:
//   1. Unauthenticated denied on protected routes
//   2. Authenticated non-admin denied on admin routes (source-code regression)
//   3. CSRF rejection on mutating browser-session routes
//   4. requireAuth guard on GET /logout

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const fs = require('fs');

const app = require('../index');

// ── Category 1: Unauthenticated denied on protected routes ────────────────────

describe('1 — Unauthenticated access denied on protected routes', () => {
  test('GET /dashboard redirects or returns 401 without session', async () => {
    const res = await request(app)
      .get('/dashboard')
      .set('Accept', 'application/json');
    assert.ok(res.status === 401 || res.status === 302, `expected 401 or 302, got ${res.status}`);
  });

  test('GET /admin/data returns 401 without session', async () => {
    const res = await request(app)
      .get('/admin/data')
      .set('Accept', 'application/json');
    assert.equal(res.status, 401);
  });

  test('POST /api/keys returns 401 without session', async () => {
    const res = await request(app)
      .post('/api/keys')
      .set('Accept', 'application/json')
      .send({ name: 'test' });
    assert.equal(res.status, 401);
  });

  test('GET /api/billing/usage returns 401 without session', async () => {
    const res = await request(app)
      .get('/api/billing/usage')
      .set('Accept', 'application/json');
    assert.equal(res.status, 401);
  });

  test('GET /api/auth/status includes googleOAuthEnabled as boolean', async () => {
    const res = await request(app)
      .get('/api/auth/status')
      .set('Accept', 'application/json');

    assert.equal(res.status, 200);
    assert.equal(typeof res.body.loggedIn, 'boolean');
    assert.equal(typeof res.body.googleOAuthEnabled, 'boolean');
  });
});

// ── Category 2: Non-admin denied on admin routes (source-code regression) ─────

describe('2 — Admin routes have router-level auth guard', () => {
  test('routes/admin.js applies requireAuth + requireAdmin via router.use()', () => {
    const src = fs.readFileSync(require.resolve('../routes/admin'), 'utf8');
    assert.ok(
      src.includes('router.use(requireAuth, requireAdmin)'),
      'routes/admin.js is missing router-level requireAuth + requireAdmin guard'
    );
  });

  test('GET /admin returns 401 or redirect for unauthenticated JSON client', async () => {
    const res = await request(app)
      .get('/admin')
      .set('Accept', 'application/json');
    assert.ok(res.status === 401 || res.status === 302, `expected 401 or 302, got ${res.status}`);
  });

  test('POST /admin/delete-user/999 returns 401 for unauthenticated JSON client', async () => {
    const res = await request(app)
      .post('/admin/delete-user/999')
      .set('Accept', 'application/json')
      .send({});
    assert.equal(res.status, 401);
  });

  test('POST /admin/destroy-droplet/999 returns 401 for unauthenticated JSON client', async () => {
    const res = await request(app)
      .post('/admin/destroy-droplet/999')
      .set('Accept', 'application/json')
      .send({});
    assert.equal(res.status, 401);
  });
});

// ── Category 3: CSRF rejection on mutating browser-session routes ─────────────

describe('3 — CSRF required on mutating browser-session routes', () => {
  test('routes/auth.js mounts csrf on POST /login', () => {
    const src = fs.readFileSync(require.resolve('../routes/auth'), 'utf8');
    // login block must include csrf before the handler
    assert.ok(
      /router\.post\(['"]\/login['"][\s\S]{0,60}csrf/m.test(src),
      'POST /login is missing csrf middleware'
    );
  });

  test('routes/auth.js mounts csrf on POST /register', () => {
    const src = fs.readFileSync(require.resolve('../routes/auth'), 'utf8');
    assert.ok(
      /router\.post\(['"]\/register['"][\s\S]{0,60}csrf/m.test(src),
      'POST /register is missing csrf middleware'
    );
  });

  test('routes/auth.js mounts csrf on POST /logout', () => {
    const src = fs.readFileSync(require.resolve('../routes/auth'), 'utf8');
    assert.ok(
      /router\.post\(['"]\/logout['"][\s\S]{0,120}csrf/m.test(src),
      'POST /logout is missing csrf middleware'
    );
  });

  test('routes/auth.js mounts csrf + emailVerifyLimiter on POST /resend-confirmation', () => {
    const src = fs.readFileSync(require.resolve('../routes/auth'), 'utf8');
    assert.ok(
      src.includes("router.post('/resend-confirmation'") || src.includes('router.post("/resend-confirmation"'),
      'POST /resend-confirmation route is missing'
    );
    assert.ok(
      /router\.post\(['"]\/resend-confirmation['"][\s\S]{0,120}emailVerifyLimiter/m.test(src),
      'POST /resend-confirmation is missing emailVerifyLimiter'
    );
    assert.ok(
      /router\.post\(['"]\/resend-confirmation['"][\s\S]{0,120}csrf/m.test(src),
      'POST /resend-confirmation is missing csrf'
    );
  });

  test('POST /login without CSRF token returns 403', async () => {
    const res = await request(app)
      .post('/login')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send('email=test%40test.com&password=password123');
    assert.equal(res.status, 403);
  });

  test('POST /register without CSRF token returns 403', async () => {
    const res = await request(app)
      .post('/register')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send('email=new%40test.com&password=password123&confirmPassword=password123');
    assert.equal(res.status, 403);
  });

  test('POST /logout without auth or CSRF token returns 302, 401, or 403', async () => {
    const res = await request(app)
      .post('/logout')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send('');
    assert.ok(
      res.status === 302 || res.status === 401 || res.status === 403,
      `expected 302/401/403, got ${res.status}`
    );
  });

  test('POST /resend-confirmation without CSRF token returns 403', async () => {
    const res = await request(app)
      .post('/resend-confirmation')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send('email=test%40test.com');
    assert.equal(res.status, 403);
  });
});

// ── Category 4: requireAuth guard on GET /logout ──────────────────────────────

describe('4 — requireAuth guard on GET /logout', () => {
  test('routes/auth.js mounts requireAuth on GET /logout', () => {
    const src = fs.readFileSync(require.resolve('../routes/auth'), 'utf8');
    assert.ok(
      /router\.get\(['"]\/logout['"],\s*requireAuth/.test(src),
      'GET /logout is missing requireAuth middleware'
    );
  });

  test('GET /logout returns 401 for unauthenticated JSON client', async () => {
    const res = await request(app)
      .get('/logout')
      .set('Accept', 'application/json');
    assert.equal(res.status, 401);
  });

  test('GET /logout redirects unauthenticated browser request to login', async () => {
    const res = await request(app)
      .get('/logout')
      .set('Accept', 'text/html');
    assert.equal(res.status, 302);
    assert.ok(
      res.headers.location?.includes('/login'),
      `expected redirect to /login, got: ${res.headers.location}`
    );
  });
});
