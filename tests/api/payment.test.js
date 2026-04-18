// tests/api/payment.test.js
// Run: node --test tests/api/payment.test.js

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../../index');

describe('Payment API — unauthenticated access', () => {
  test('GET /pay redirects unauthenticated users to login', async () => {
    const res = await request(app).get('/pay');
    assert.ok(res.statusCode === 302 || res.statusCode === 401, `expected 302 or 401, got ${res.statusCode}`);
  });

  test('GET /api/billing/usage returns 401 without session', async () => {
    const res = await request(app).get('/api/billing/usage');
    assert.equal(res.statusCode, 401);
  });

  test('POST /create-payment-intent returns 401 without session', async () => {
    const res = await request(app).post('/create-payment-intent').send({});
    assert.equal(res.statusCode, 401);
  });
});
