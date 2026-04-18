// services/billingReconciliation.js
// Read-only billing reconciliation: compares internal DB state against Stripe.
// Never mutates state. Safe to call on demand or on a schedule.
//
// Drift categories:
//   subscription_not_found_in_stripe       — DB has sub_id but Stripe doesn't know it
//   active_server_subscription_canceled    — server running, Stripe sub is canceled
//   subscription_payment_delinquent        — Stripe sub is past_due or unpaid
//   subscription_incomplete_stale          — Stripe sub stuck in 'incomplete' > 24 h
//   active_stripe_subscription_no_server   — Stripe active sub with no matching server
//   server_missing_subscription_id         — paid non-trial server with no sub reference
//   local_payment_not_found_in_stripe      — local succeeded payment PI missing from Stripe
//   local_payment_status_mismatch          — local succeeded but Stripe shows failed/other
//   duplicate_active_subscriptions         — user has multiple servers each with a sub_id

'use strict';

const pool = require('../db');

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    const err = new Error('Stripe not configured');
    err.code = 'STRIPE_NOT_CONFIGURED';
    throw err;
  }
  return require('stripe')(key);
}

// ── DB helpers ────────────────────────────────────────────────────────────────

async function fetchServersWithSubscriptions() {
  const { rows } = await pool.query(`
    SELECT s.id, s.user_id, s.plan, s.status, s.stripe_subscription_id,
           s.is_trial, s.created_at, u.email
      FROM servers s
      JOIN users u ON s.user_id = u.id
     WHERE s.stripe_subscription_id IS NOT NULL
       AND s.status NOT IN ('deleted', 'failed')
  `);
  return rows;
}

async function fetchPaidActiveServers() {
  const { rows } = await pool.query(`
    SELECT s.id, s.user_id, s.plan, s.status, s.stripe_subscription_id,
           s.is_trial, s.created_at, u.email
      FROM servers s
      JOIN users u ON s.user_id = u.id
     WHERE s.status NOT IN ('deleted', 'failed')
       AND s.plan IN ('basic', 'pro', 'premium')
       AND (s.is_trial IS NULL OR s.is_trial = FALSE)
  `);
  return rows;
}

async function fetchRecentSucceededPayments() {
  const { rows } = await pool.query(`
    SELECT p.id, p.user_id, p.stripe_payment_id, p.amount, p.plan, p.status,
           p.created_at, u.email
      FROM payments p
      JOIN users u ON p.user_id = u.id
     WHERE p.created_at > NOW() - INTERVAL '90 days'
       AND p.status = 'succeeded'
       AND p.stripe_payment_id LIKE 'pi_%'
     ORDER BY p.created_at DESC
     LIMIT 200
  `);
  return rows;
}

// ── Stripe helpers ────────────────────────────────────────────────────────────

async function fetchAllStripeSubscriptions() {
  const stripe = getStripe();
  const subscriptions = new Map();
  let hasMore = true;
  let startingAfter;

  while (hasMore) {
    const params = { limit: 100, status: 'all' };
    if (startingAfter) params.starting_after = startingAfter;
    const page = await stripe.subscriptions.list(params);
    for (const sub of page.data) {
      subscriptions.set(sub.id, sub);
    }
    hasMore = page.has_more;
    if (page.data.length > 0) startingAfter = page.data[page.data.length - 1].id;
  }

  return subscriptions;
}

// ── Classification functions (pure — no I/O, fully testable) ─────────────────

/**
 * CAT 1 + 2: Servers with a Stripe subscription that is canceled or delinquent.
 *
 * @param {object[]} serversWithSubs  rows with stripe_subscription_id (non-deleted)
 * @param {Map<string,object>} stripeSubscriptions  sub_id → Stripe subscription object
 * @returns {object[]} drift items
 */
function classifySubscriptionStatus(serversWithSubs, stripeSubscriptions) {
  const drift = [];

  for (const server of serversWithSubs) {
    const sub = stripeSubscriptions.get(server.stripe_subscription_id);

    if (!sub) {
      drift.push({
        category: 'subscription_not_found_in_stripe',
        severity: 'high',
        server_id: server.id,
        user_id: server.user_id,
        stripe_subscription_id: server.stripe_subscription_id,
        server_status: server.status,
        server_plan: server.plan,
        detail: `Server #${server.id} references subscription ${server.stripe_subscription_id} which was not found in Stripe.`,
      });
      continue;
    }

    if (sub.status === 'canceled' || sub.status === 'incomplete_expired') {
      drift.push({
        category: 'active_server_subscription_canceled',
        severity: 'high',
        server_id: server.id,
        user_id: server.user_id,
        stripe_subscription_id: server.stripe_subscription_id,
        stripe_status: sub.status,
        server_status: server.status,
        server_plan: server.plan,
        detail: `Server #${server.id} is ${server.status} but its Stripe subscription is ${sub.status}.`,
      });
    } else if (sub.status === 'past_due' || sub.status === 'unpaid') {
      drift.push({
        category: 'subscription_payment_delinquent',
        severity: 'medium',
        server_id: server.id,
        user_id: server.user_id,
        stripe_subscription_id: server.stripe_subscription_id,
        stripe_status: sub.status,
        server_status: server.status,
        server_plan: server.plan,
        detail: `Server #${server.id} has a Stripe subscription in '${sub.status}' state.`,
      });
    } else if (sub.status === 'incomplete') {
      const serverAgeHours = (Date.now() - new Date(server.created_at).getTime()) / 3600000;
      if (serverAgeHours > 24) {
        drift.push({
          category: 'subscription_incomplete_stale',
          severity: 'low',
          server_id: server.id,
          user_id: server.user_id,
          stripe_subscription_id: server.stripe_subscription_id,
          stripe_status: sub.status,
          server_status: server.status,
          server_plan: server.plan,
          detail: `Server #${server.id} has a Stripe subscription stuck in 'incomplete' for over 24 hours.`,
        });
      }
    }
  }

  return drift;
}

/**
 * CAT 3: Active Stripe subscriptions not linked to any server in DB.
 *
 * @param {Map<string,object>} stripeSubscriptions
 * @param {object[]} paidActiveServers  non-deleted paid servers
 * @returns {object[]} drift items
 */
function classifyOrphanedStripeSubscriptions(stripeSubscriptions, paidActiveServers) {
  const drift = [];

  const serverBySubId = new Map();
  const serversByUserId = new Map();
  for (const server of paidActiveServers) {
    if (server.stripe_subscription_id) serverBySubId.set(server.stripe_subscription_id, server);
    if (!serversByUserId.has(server.user_id)) serversByUserId.set(server.user_id, []);
    serversByUserId.get(server.user_id).push(server);
  }

  for (const [subId, sub] of stripeSubscriptions) {
    if (sub.status !== 'active') continue;
    if (serverBySubId.has(subId)) continue; // Already linked — fine

    const userIdStr = sub.metadata?.user_id;
    if (!userIdStr) continue; // Can't map to internal user without our metadata

    const userId = parseInt(userIdStr, 10);
    if (isNaN(userId)) continue;

    const userServers = serversByUserId.get(userId) || [];
    const unlinkedContext = userServers.length > 0
      ? ` User ${userId} has ${userServers.length} server(s) but none linked to this subscription.`
      : ` User ${userId} has no active servers at all.`;

    drift.push({
      category: 'active_stripe_subscription_no_server',
      severity: 'high',
      user_id: userId,
      stripe_subscription_id: subId,
      stripe_status: sub.status,
      stripe_plan_metadata: sub.metadata?.plan || null,
      detail: `Stripe subscription ${subId} is active but not linked to any server.${unlinkedContext}`,
    });
  }

  return drift;
}

/**
 * CAT 4: Non-trial paid servers older than 72 h with no stripe_subscription_id.
 *
 * @param {object[]} paidActiveServers
 * @param {object[]} recentPayments  succeeded payments from the last 90 days
 * @returns {object[]} drift items
 */
function classifyMissingSubscriptionId(paidActiveServers, recentPayments) {
  const drift = [];
  const usersWithRecentPayment = new Set(recentPayments.map(p => p.user_id));

  for (const server of paidActiveServers) {
    if (server.is_trial) continue;
    if (server.stripe_subscription_id) continue;

    // New subscriptions can take up to a few hours for the webhook to arrive
    const serverAgeHours = (Date.now() - new Date(server.created_at).getTime()) / 3600000;
    if (serverAgeHours < 72) continue;

    const hasPayment = usersWithRecentPayment.has(server.user_id);
    drift.push({
      category: 'server_missing_subscription_id',
      severity: hasPayment ? 'low' : 'medium',
      server_id: server.id,
      user_id: server.user_id,
      server_status: server.status,
      server_plan: server.plan,
      has_recent_payment: hasPayment,
      detail: `Server #${server.id} is a paid non-trial server with no stripe_subscription_id after ${Math.floor(serverAgeHours)}h.${hasPayment ? ' User has a recent payment record.' : ' No recent payment found — possible billing gap.'}`,
    });
  }

  return drift;
}

/**
 * CAT 5: Local succeeded payments whose status diverges from Stripe.
 * Only examines payments whose PI was explicitly retrieved (present in the map).
 * Use { status: '__not_found' } as the sentinel for Stripe 404s.
 *
 * @param {object[]} localPayments  local succeeded payment rows
 * @param {Map<string,object>} stripePaymentIntents  pi_id → PI object | sentinel
 * @returns {object[]} drift items
 */
function classifyPaymentStatus(localPayments, stripePaymentIntents) {
  const drift = [];

  for (const payment of localPayments) {
    if (!payment.stripe_payment_id?.startsWith('pi_')) continue;

    const pi = stripePaymentIntents.get(payment.stripe_payment_id);
    if (pi === undefined) continue; // Not retrieved — skip

    if (pi.status === '__not_found') {
      drift.push({
        category: 'local_payment_not_found_in_stripe',
        severity: 'high',
        payment_id: payment.id,
        user_id: payment.user_id,
        stripe_payment_id: payment.stripe_payment_id,
        local_status: payment.status,
        detail: `Payment #${payment.id} is recorded as succeeded locally but the Stripe PaymentIntent was not found.`,
      });
      continue;
    }

    if (pi.status !== 'succeeded') {
      drift.push({
        category: 'local_payment_status_mismatch',
        severity: 'high',
        payment_id: payment.id,
        user_id: payment.user_id,
        stripe_payment_id: payment.stripe_payment_id,
        local_status: payment.status,
        stripe_status: pi.status,
        detail: `Payment #${payment.id} is 'succeeded' locally but Stripe shows '${pi.status}'.`,
      });
    }
  }

  return drift;
}

/**
 * CAT 6: Users with multiple active servers each linked to a subscription.
 *
 * @param {object[]} serversWithSubs  non-deleted servers with a stripe_subscription_id
 * @returns {object[]} drift items
 */
function classifyDuplicateSubscriptions(serversWithSubs) {
  const drift = [];
  const byUser = new Map();

  for (const server of serversWithSubs) {
    if (!byUser.has(server.user_id)) byUser.set(server.user_id, []);
    byUser.get(server.user_id).push(server);
  }

  for (const [userId, servers] of byUser) {
    if (servers.length > 1) {
      drift.push({
        category: 'duplicate_active_subscriptions',
        severity: 'medium',
        user_id: userId,
        server_ids: servers.map(s => s.id),
        stripe_subscription_ids: servers.map(s => s.stripe_subscription_id).filter(Boolean),
        detail: `User ${userId} has ${servers.length} active servers each with a stripe_subscription_id.`,
      });
    }
  }

  return drift;
}

// ── Result builder ────────────────────────────────────────────────────────────

function buildResult(runAt, drift, errors, stripeChecked) {
  const counts = {
    total: drift.length,
    by_category: {},
    by_severity: { high: 0, medium: 0, low: 0 },
  };
  for (const item of drift) {
    counts.by_category[item.category] = (counts.by_category[item.category] || 0) + 1;
    if (item.severity) counts.by_severity[item.severity] = (counts.by_severity[item.severity] || 0) + 1;
  }
  return { run_at: runAt, stripe_checked: stripeChecked, drift, counts, errors };
}

// ── Main reconciliation orchestrator ─────────────────────────────────────────

async function runReconciliation() {
  const runAt = new Date().toISOString();
  const drift = [];
  const errors = [];
  let stripeChecked = false;

  // ── Phase 1: DB-only checks ───────────────────────────────────────────────
  let serversWithSubs, paidActiveServers, recentPayments;

  try {
    [serversWithSubs, paidActiveServers, recentPayments] = await Promise.all([
      fetchServersWithSubscriptions(),
      fetchPaidActiveServers(),
      fetchRecentSucceededPayments(),
    ]);
  } catch {
    errors.push({ phase: 'database', message: 'Database query failed' });
    return buildResult(runAt, drift, errors, stripeChecked);
  }

  // CAT 6: duplicate subscriptions (no Stripe needed)
  drift.push(...classifyDuplicateSubscriptions(serversWithSubs));

  // CAT 4: paid servers missing a subscription reference (no Stripe needed)
  drift.push(...classifyMissingSubscriptionId(paidActiveServers, recentPayments));

  // ── Phase 2: Stripe API checks ────────────────────────────────────────────
  let stripe;
  try {
    stripe = getStripe();
    stripeChecked = true;
  } catch {
    errors.push({ phase: 'stripe_api', message: 'Stripe not configured — DB-only checks ran' });
    return buildResult(runAt, drift, errors, stripeChecked);
  }

  try {
    const stripeSubscriptions = await fetchAllStripeSubscriptions();

    // CAT 1 + 2: subscription status drift
    drift.push(...classifySubscriptionStatus(serversWithSubs, stripeSubscriptions));

    // CAT 3: Stripe subscriptions with no matching server
    drift.push(...classifyOrphanedStripeSubscriptions(stripeSubscriptions, paidActiveServers));
  } catch {
    errors.push({ phase: 'stripe_subscriptions', message: 'Failed to fetch Stripe subscriptions' });
  }

  // CAT 5: spot-check recent local payment records against Stripe (cap at 50)
  try {
    const toCheck = recentPayments.slice(0, 50);
    if (toCheck.length > 0) {
      const stripePaymentIntents = new Map();
      for (const payment of toCheck) {
        try {
          const pi = await stripe.paymentIntents.retrieve(payment.stripe_payment_id);
          stripePaymentIntents.set(pi.id, pi);
        } catch (piErr) {
          if (piErr.statusCode === 404) {
            stripePaymentIntents.set(payment.stripe_payment_id, { status: '__not_found' });
          }
          // Other Stripe errors on individual PIs are silently skipped
        }
      }
      drift.push(...classifyPaymentStatus(toCheck, stripePaymentIntents));
    }
  } catch {
    errors.push({ phase: 'stripe_payment_intents', message: 'Failed to verify payment intents against Stripe' });
  }

  return buildResult(runAt, drift, errors, stripeChecked);
}

module.exports = {
  runReconciliation,
  // Pure classifiers exported for unit testing
  classifySubscriptionStatus,
  classifyOrphanedStripeSubscriptions,
  classifyMissingSubscriptionId,
  classifyPaymentStatus,
  classifyDuplicateSubscriptions,
};
