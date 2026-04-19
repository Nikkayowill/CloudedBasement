'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');

const { isStaticAssetRequest } = require('../middleware/rateLimiter');

describe('rate limiter static asset detection', () => {
  test('skips hashed frontend assets', () => {
    assert.equal(isStaticAssetRequest({ method: 'GET', path: '/assets/app-abc123.js' }), true);
  });

  test('skips root-level public assets', () => {
    assert.equal(isStaticAssetRequest({ method: 'GET', path: '/CB-logo-icon.svg' }), true);
    assert.equal(isStaticAssetRequest({ method: 'HEAD', path: '/Favicon.svg' }), true);
  });

  test('does not skip dynamic marketing pages', () => {
    assert.equal(isStaticAssetRequest({ method: 'GET', path: '/pricing' }), false);
    assert.equal(isStaticAssetRequest({ method: 'GET', path: '/' }), false);
  });

  test('does not skip API reads without a static asset extension', () => {
    assert.equal(isStaticAssetRequest({ method: 'GET', path: '/api/auth/status' }), false);
    assert.equal(isStaticAssetRequest({ method: 'GET', path: '/api/csrf-token' }), false);
  });

  test('never treats mutating routes as static assets', () => {
    assert.equal(isStaticAssetRequest({ method: 'POST', path: '/assets/app-abc123.js' }), false);
  });
});