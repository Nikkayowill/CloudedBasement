// tests/billing-guardrails.test.js
// Tests for billing guardrail logic and HTTP endpoint auth guards.
//
// Pure function tests (currentCycle, input validation) run without DB.
// Auth guard tests use supertest against the live Express app.

'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../index');
const { currentCycle, updateGuardrails } = require('../services/billingGuardrails');

// ── currentCycle ──────────────────────────────────────────────────────────────

describe('currentCycle', () => {
  test('returns YYYY-MM format', () => {
    const cycle = currentCycle();
    assert.match(cycle, /^\d{4}-\d{2}$/);
  });

  test('matches current month', () => {
    const cycle = currentCycle();
    const now   = new Date();
    const expected = now.toISOString().slice(0, 7);
    assert.equal(cycle, expected);
  });
});

// ── updateGuardrails — input validation ──────────────────────────────────────

describe('updateGuardrails — validation (no DB hit needed for rejection)', () => {
  test('rejects monthly_limit of 0', async () => {
    await assert.rejects(
      () => updateGuardrails(999999, { monthly_limit: 0 }),
      (err) => {
        assert.ok(err.message.includes('positive'), `expected "positive" in: ${err.message}`);
        return true;
      }
    );
  });

  test('rejects negative monthly_limit', async () => {
    await assert.rejects(
      () => updateGuardrails(999999, { monthly_limit: -5 }),
      (err) => {
        assert.ok(err.message.includes('positive'), `expected "positive" in: ${err.message}`);
        return true;
      }
    );
  });

  test('rejects warn_at_percent = 0', async () => {
    await assert.rejects(
      () => updateGuardrails(999999, { warn_at_percent: 0 }),
      (err) => {
        assert.ok(err.message.includes('warn_at_percent'), `expected "warn_at_percent" in: ${err.message}`);
        return true;
      }
    );
  });

  test('rejects warn_at_percent = 100', async () => {
    await assert.rejects(
      () => updateGuardrails(999999, { warn_at_percent: 100 }),
      (err) => {
        assert.ok(err.message.includes('warn_at_percent'), `expected "warn_at_percent" in: ${err.message}`);
        return true;
      }
    );
  });
});

// ── Auth guards ───────────────────────────────────────────────────────────────

describe('GET /api/billing/guardrails — auth guard', () => {
  test('returns 401 for unauthenticated client', async () => {
    const res = await request(app)
      .get('/api/billing/guardrails')
      .set('Accept', 'application/json');
    assert.equal(res.statusCode, 401);
  });
});

describe('PUT /api/billing/guardrails — auth guard', () => {
  test('returns 401 for unauthenticated client', async () => {
    const res = await request(app)
      .put('/api/billing/guardrails')
      .set('Accept', 'application/json')
      .send({ monthly_limit: 100 });
    assert.equal(res.statusCode, 401);
  });
});

describe('GET /api/billing/forecast — auth guard', () => {
  test('returns 401 for unauthenticated client', async () => {
    const res = await request(app)
      .get('/api/billing/forecast')
      .set('Accept', 'application/json');
    assert.equal(res.statusCode, 401);
  });
});
