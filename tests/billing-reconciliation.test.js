// tests/billing-reconciliation.test.js
// Unit tests for billing reconciliation classification logic.
// All functions under test are pure (no I/O) — no DB or Stripe calls made here.
// Run: node --test tests/billing-reconciliation.test.js

'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

const {
  classifySubscriptionStatus,
  classifyOrphanedStripeSubscriptions,
  classifyMissingSubscriptionId,
  classifyPaymentStatus,
  classifyDuplicateSubscriptions,
} = require('../services/billingReconciliation');

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeServer(overrides = {}) {
  return {
    id: 1,
    user_id: 10,
    plan: 'pro',
    status: 'running',
    stripe_subscription_id: 'sub_test001',
    is_trial: false,
    created_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(), // 7 days ago
    email: 'user@example.com',
    ...overrides,
  };
}

function makeStripeSub(overrides = {}) {
  return {
    id: 'sub_test001',
    status: 'active',
    metadata: { user_id: '10', plan: 'pro' },
    ...overrides,
  };
}

function makePayment(overrides = {}) {
  return {
    id: 100,
    user_id: 10,
    stripe_payment_id: 'pi_test001',
    amount: 35,
    plan: 'pro',
    status: 'succeeded',
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    email: 'user@example.com',
    ...overrides,
  };
}

// ── classifySubscriptionStatus ────────────────────────────────────────────────

describe('classifySubscriptionStatus', () => {
  test('no drift when subscription is active', () => {
    const servers = [makeServer()];
    const subs = new Map([['sub_test001', makeStripeSub({ status: 'active' })]]);
    const result = classifySubscriptionStatus(servers, subs);
    assert.equal(result.length, 0);
  });

  test('high-severity drift when Stripe subscription is canceled', () => {
    const servers = [makeServer()];
    const subs = new Map([['sub_test001', makeStripeSub({ status: 'canceled' })]]);
    const result = classifySubscriptionStatus(servers, subs);
    assert.equal(result.length, 1);
    assert.equal(result[0].category, 'active_server_subscription_canceled');
    assert.equal(result[0].severity, 'high');
    assert.equal(result[0].stripe_status, 'canceled');
    assert.equal(result[0].server_id, 1);
  });

  test('high-severity drift when Stripe subscription is incomplete_expired', () => {
    const servers = [makeServer()];
    const subs = new Map([['sub_test001', makeStripeSub({ status: 'incomplete_expired' })]]);
    const result = classifySubscriptionStatus(servers, subs);
    assert.equal(result.length, 1);
    assert.equal(result[0].category, 'active_server_subscription_canceled');
    assert.equal(result[0].severity, 'high');
  });

  test('medium-severity drift when subscription is past_due', () => {
    const servers = [makeServer()];
    const subs = new Map([['sub_test001', makeStripeSub({ status: 'past_due' })]]);
    const result = classifySubscriptionStatus(servers, subs);
    assert.equal(result.length, 1);
    assert.equal(result[0].category, 'subscription_payment_delinquent');
    assert.equal(result[0].severity, 'medium');
  });

  test('medium-severity drift when subscription is unpaid', () => {
    const servers = [makeServer()];
    const subs = new Map([['sub_test001', makeStripeSub({ status: 'unpaid' })]]);
    const result = classifySubscriptionStatus(servers, subs);
    assert.equal(result.length, 1);
    assert.equal(result[0].category, 'subscription_payment_delinquent');
    assert.equal(result[0].severity, 'medium');
  });

  test('high-severity drift when subscription ID not found in Stripe', () => {
    const servers = [makeServer()];
    const subs = new Map(); // empty — sub not found
    const result = classifySubscriptionStatus(servers, subs);
    assert.equal(result.length, 1);
    assert.equal(result[0].category, 'subscription_not_found_in_stripe');
    assert.equal(result[0].severity, 'high');
    assert.equal(result[0].stripe_subscription_id, 'sub_test001');
  });

  test('low-severity drift when subscription is incomplete and server is > 24 h old', () => {
    const oldServer = makeServer({
      created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), // 48h ago
    });
    const subs = new Map([['sub_test001', makeStripeSub({ status: 'incomplete' })]]);
    const result = classifySubscriptionStatus([oldServer], subs);
    assert.equal(result.length, 1);
    assert.equal(result[0].category, 'subscription_incomplete_stale');
    assert.equal(result[0].severity, 'low');
  });

  test('no drift for new incomplete subscription (< 24 h old)', () => {
    const newServer = makeServer({
      created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2h ago
    });
    const subs = new Map([['sub_test001', makeStripeSub({ status: 'incomplete' })]]);
    const result = classifySubscriptionStatus([newServer], subs);
    assert.equal(result.length, 0, 'should not flag new incomplete subscription');
  });

  test('multiple servers produce independent drift items', () => {
    const servers = [
      makeServer({ id: 1, stripe_subscription_id: 'sub_a' }),
      makeServer({ id: 2, stripe_subscription_id: 'sub_b' }),
    ];
    const subs = new Map([
      ['sub_a', makeStripeSub({ id: 'sub_a', status: 'canceled' })],
      ['sub_b', makeStripeSub({ id: 'sub_b', status: 'active' })],
    ]);
    const result = classifySubscriptionStatus(servers, subs);
    assert.equal(result.length, 1);
    assert.equal(result[0].server_id, 1);
  });
});

// ── classifyOrphanedStripeSubscriptions ──────────────────────────────────────

describe('classifyOrphanedStripeSubscriptions', () => {
  test('no drift when active sub is linked to a server', () => {
    const servers = [makeServer({ stripe_subscription_id: 'sub_test001' })];
    const subs = new Map([['sub_test001', makeStripeSub()]]);
    const result = classifyOrphanedStripeSubscriptions(subs, servers);
    assert.equal(result.length, 0);
  });

  test('high-severity drift when active Stripe sub has no matching server', () => {
    const subs = new Map([
      ['sub_orphan', makeStripeSub({ id: 'sub_orphan', status: 'active', metadata: { user_id: '99', plan: 'basic' } })],
    ]);
    const result = classifyOrphanedStripeSubscriptions(subs, []); // no servers
    assert.equal(result.length, 1);
    assert.equal(result[0].category, 'active_stripe_subscription_no_server');
    assert.equal(result[0].severity, 'high');
    assert.equal(result[0].user_id, 99);
    assert.equal(result[0].stripe_subscription_id, 'sub_orphan');
  });

  test('no drift for canceled Stripe subscriptions', () => {
    const subs = new Map([
      ['sub_old', makeStripeSub({ id: 'sub_old', status: 'canceled', metadata: { user_id: '99' } })],
    ]);
    const result = classifyOrphanedStripeSubscriptions(subs, []);
    assert.equal(result.length, 0, 'canceled subscriptions should be ignored');
  });

  test('no drift when Stripe sub has no user_id metadata', () => {
    const subs = new Map([
      ['sub_noid', { id: 'sub_noid', status: 'active', metadata: {} }],
    ]);
    const result = classifyOrphanedStripeSubscriptions(subs, []);
    assert.equal(result.length, 0, 'cannot map subscription without user_id metadata');
  });

  test('flags when user has servers but none linked to this subscription', () => {
    // User 10 has a server but it has a DIFFERENT subscription ID
    const servers = [makeServer({ stripe_subscription_id: 'sub_other' })];
    const subs = new Map([
      ['sub_unlinked', makeStripeSub({ id: 'sub_unlinked', status: 'active', metadata: { user_id: '10' } })],
    ]);
    const result = classifyOrphanedStripeSubscriptions(subs, servers);
    assert.equal(result.length, 1);
    assert.equal(result[0].category, 'active_stripe_subscription_no_server');
    assert.ok(result[0].detail.includes('1 server'), 'detail should mention user has servers');
  });
});

// ── classifyMissingSubscriptionId ────────────────────────────────────────────

describe('classifyMissingSubscriptionId', () => {
  test('no drift when server has a stripe_subscription_id', () => {
    const servers = [makeServer({ stripe_subscription_id: 'sub_test001' })];
    const result = classifyMissingSubscriptionId(servers, []);
    assert.equal(result.length, 0);
  });

  test('no drift for trial servers', () => {
    const servers = [makeServer({ stripe_subscription_id: null, is_trial: true })];
    const result = classifyMissingSubscriptionId(servers, []);
    assert.equal(result.length, 0);
  });

  test('no drift for servers younger than 72 hours', () => {
    const newServer = makeServer({
      stripe_subscription_id: null,
      created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2h ago
    });
    const result = classifyMissingSubscriptionId([newServer], []);
    assert.equal(result.length, 0, 'new server should be within grace period');
  });

  test('medium-severity when old paid server has no sub_id and no recent payment', () => {
    const servers = [makeServer({ stripe_subscription_id: null })];
    const result = classifyMissingSubscriptionId(servers, []);
    assert.equal(result.length, 1);
    assert.equal(result[0].category, 'server_missing_subscription_id');
    assert.equal(result[0].severity, 'medium');
    assert.equal(result[0].has_recent_payment, false);
  });

  test('low-severity when old paid server has no sub_id but has a recent payment', () => {
    const servers = [makeServer({ stripe_subscription_id: null })];
    const payments = [makePayment({ user_id: 10 })];
    const result = classifyMissingSubscriptionId(servers, payments);
    assert.equal(result.length, 1);
    assert.equal(result[0].severity, 'low');
    assert.equal(result[0].has_recent_payment, true);
  });
});

// ── classifyPaymentStatus ─────────────────────────────────────────────────────

describe('classifyPaymentStatus', () => {
  test('no drift when Stripe PI matches local succeeded status', () => {
    const payments = [makePayment()];
    const pis = new Map([['pi_test001', { id: 'pi_test001', status: 'succeeded' }]]);
    const result = classifyPaymentStatus(payments, pis);
    assert.equal(result.length, 0);
  });

  test('no drift for payments not in the PI map (not checked)', () => {
    const payments = [makePayment()];
    const pis = new Map(); // pi_test001 not present — was not retrieved
    const result = classifyPaymentStatus(payments, pis);
    assert.equal(result.length, 0, 'unchecked payments should be skipped');
  });

  test('high-severity drift when PI is not found in Stripe (404 sentinel)', () => {
    const payments = [makePayment()];
    const pis = new Map([['pi_test001', { status: '__not_found' }]]);
    const result = classifyPaymentStatus(payments, pis);
    assert.equal(result.length, 1);
    assert.equal(result[0].category, 'local_payment_not_found_in_stripe');
    assert.equal(result[0].severity, 'high');
    assert.equal(result[0].payment_id, 100);
  });

  test('high-severity drift when local succeeded but Stripe shows canceled', () => {
    const payments = [makePayment()];
    const pis = new Map([['pi_test001', { id: 'pi_test001', status: 'canceled' }]]);
    const result = classifyPaymentStatus(payments, pis);
    assert.equal(result.length, 1);
    assert.equal(result[0].category, 'local_payment_status_mismatch');
    assert.equal(result[0].severity, 'high');
    assert.equal(result[0].stripe_status, 'canceled');
    assert.equal(result[0].local_status, 'succeeded');
  });

  test('high-severity drift when local succeeded but Stripe shows requires_action', () => {
    const payments = [makePayment()];
    const pis = new Map([['pi_test001', { id: 'pi_test001', status: 'requires_action' }]]);
    const result = classifyPaymentStatus(payments, pis);
    assert.equal(result.length, 1);
    assert.equal(result[0].category, 'local_payment_status_mismatch');
  });

  test('skips payments whose stripe_payment_id does not start with pi_', () => {
    const payments = [makePayment({ stripe_payment_id: 'ch_legacy001' })];
    const pis = new Map([['ch_legacy001', { id: 'ch_legacy001', status: 'succeeded' }]]);
    const result = classifyPaymentStatus(payments, pis);
    assert.equal(result.length, 0, 'non-PI payment IDs should be ignored');
  });

  test('skips payments with no stripe_payment_id', () => {
    const payments = [makePayment({ stripe_payment_id: null })];
    const result = classifyPaymentStatus(payments, new Map());
    assert.equal(result.length, 0);
  });
});

// ── classifyDuplicateSubscriptions ───────────────────────────────────────────

describe('classifyDuplicateSubscriptions', () => {
  test('no drift when each user has exactly one server', () => {
    const servers = [
      makeServer({ id: 1, user_id: 10, stripe_subscription_id: 'sub_a' }),
      makeServer({ id: 2, user_id: 20, stripe_subscription_id: 'sub_b' }),
    ];
    const result = classifyDuplicateSubscriptions(servers);
    assert.equal(result.length, 0);
  });

  test('medium-severity drift when a user has two servers each with a subscription', () => {
    const servers = [
      makeServer({ id: 1, user_id: 10, stripe_subscription_id: 'sub_a' }),
      makeServer({ id: 2, user_id: 10, stripe_subscription_id: 'sub_b' }),
    ];
    const result = classifyDuplicateSubscriptions(servers);
    assert.equal(result.length, 1);
    assert.equal(result[0].category, 'duplicate_active_subscriptions');
    assert.equal(result[0].severity, 'medium');
    assert.equal(result[0].user_id, 10);
    assert.deepEqual(result[0].server_ids.sort(), [1, 2]);
    assert.equal(result[0].stripe_subscription_ids.length, 2);
  });

  test('no drift for empty server list', () => {
    const result = classifyDuplicateSubscriptions([]);
    assert.equal(result.length, 0);
  });

  test('only flags users with more than one server — others unaffected', () => {
    const servers = [
      makeServer({ id: 1, user_id: 10, stripe_subscription_id: 'sub_a' }),
      makeServer({ id: 2, user_id: 10, stripe_subscription_id: 'sub_b' }),
      makeServer({ id: 3, user_id: 20, stripe_subscription_id: 'sub_c' }), // clean
    ];
    const result = classifyDuplicateSubscriptions(servers);
    assert.equal(result.length, 1);
    assert.equal(result[0].user_id, 10);
  });
});

// ── Cross-category sanity checks ──────────────────────────────────────────────

describe('cross-category sanity', () => {
  test('clean state produces zero drift across all classifiers', () => {
    const server = makeServer();
    const stripeSub = makeStripeSub();
    const stripeSubsMap = new Map([['sub_test001', stripeSub]]);
    const payment = makePayment();
    const piMap = new Map([['pi_test001', { id: 'pi_test001', status: 'succeeded' }]]);

    const d1 = classifySubscriptionStatus([server], stripeSubsMap);
    const d2 = classifyOrphanedStripeSubscriptions(stripeSubsMap, [server]);
    const d3 = classifyMissingSubscriptionId([server], [payment]);
    const d4 = classifyPaymentStatus([payment], piMap);
    const d5 = classifyDuplicateSubscriptions([server]);

    assert.equal(d1.length + d2.length + d3.length + d4.length + d5.length, 0,
      'clean state should produce zero drift items');
  });

  test('each drift item has required fields: category, severity, detail', () => {
    const server = makeServer({ stripe_subscription_id: null });
    const result = classifyMissingSubscriptionId([server], []);
    assert.equal(result.length, 1);
    const item = result[0];
    assert.ok(item.category, 'must have category');
    assert.ok(item.severity, 'must have severity');
    assert.ok(item.detail, 'must have detail');
    assert.ok(['high', 'medium', 'low'].includes(item.severity), 'severity must be high/medium/low');
  });
});
