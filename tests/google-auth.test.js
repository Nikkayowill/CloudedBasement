'use strict';
// tests/google-auth.test.js
// Route-level regression tests for Google OAuth availability handling.

const { test, describe, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const originalGoogleClientId = process.env.GOOGLE_CLIENT_ID;
const originalGoogleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

function clearAuthModuleCache() {
  const modulesToClear = [
    '../index',
    '../routes/auth',
    '../services/googleAuth',
  ];

  for (const mod of modulesToClear) {
    try {
      delete require.cache[require.resolve(mod)];
    } catch {
      // Module may not have been loaded yet.
    }
  }
}

// Force the unconfigured branch before index.js runs dotenv/passport setup.
process.env.GOOGLE_CLIENT_ID = '';
process.env.GOOGLE_CLIENT_SECRET = '';

clearAuthModuleCache();

const app = require('../index');

after(() => {
  if (originalGoogleClientId === undefined) {
    delete process.env.GOOGLE_CLIENT_ID;
  } else {
    process.env.GOOGLE_CLIENT_ID = originalGoogleClientId;
  }

  if (originalGoogleClientSecret === undefined) {
    delete process.env.GOOGLE_CLIENT_SECRET;
  } else {
    process.env.GOOGLE_CLIENT_SECRET = originalGoogleClientSecret;
  }

  clearAuthModuleCache();
});

describe('Google OAuth unavailable routing', () => {
  test('GET /auth/google redirects to login with unavailable message', async () => {
    const res = await request(app)
      .get('/auth/google')
      .set('Accept', 'text/html');

    assert.equal(res.status, 302);
    assert.ok(
      res.headers.location?.includes('/login?error=Google%20authentication%20is%20unavailable') ||
      res.headers.location?.includes('/login?error=Google authentication is unavailable'),
      `expected unavailable redirect, got: ${res.headers.location}`
    );
  });

  test('GET /auth/google/callback short-circuits before passport and redirects to login', async () => {
    const res = await request(app)
      .get('/auth/google/callback?code=fake-code&state=fake-state')
      .set('Accept', 'text/html');

    assert.equal(res.status, 302);
    assert.ok(
      res.headers.location?.includes('/login?error=Google%20authentication%20is%20unavailable') ||
      res.headers.location?.includes('/login?error=Google authentication is unavailable'),
      `expected unavailable redirect, got: ${res.headers.location}`
    );
  });
});
