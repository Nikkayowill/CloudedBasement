'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');

describe('read rate limit route coverage', () => {
  test('auth routes apply dedicated read limiters to public status endpoints', () => {
    const src = fs.readFileSync(require.resolve('../routes/auth'), 'utf8');

    assert.ok(
      /router\.get\('\/api\/auth\/status',\s*statusReadLimiter,/m.test(src),
      'GET /api/auth/status should use statusReadLimiter'
    );
    assert.ok(
      /router\.get\('\/api\/auth\/bot-challenge',\s*botChallengeLimiter,/m.test(src),
      'GET /api/auth/bot-challenge should use botChallengeLimiter'
    );
  });

  test('page routes apply dedicated read limiters to csrf and pricing status endpoints', () => {
    const src = fs.readFileSync(require.resolve('../routes/pages'), 'utf8');

    assert.ok(
      /router\.get\('\/api\/csrf-token',\s*csrfTokenReadLimiter,\s*csrf,/m.test(src),
      'GET /api/csrf-token should use csrfTokenReadLimiter before csrf middleware'
    );
    assert.ok(
      /router\.get\('\/api\/pricing\/status',\s*statusReadLimiter,/m.test(src),
      'GET /api/pricing/status should use statusReadLimiter'
    );
  });
});