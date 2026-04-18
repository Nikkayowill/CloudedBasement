// tests/security-analytics.test.js
// Unit tests for security analytics classification and alert cooldown logic.
// All functions under test are pure (no I/O) or operate on an in-memory map —
// no database or notifier calls are made here.
// Run: node --test tests/security-analytics.test.js

'use strict';

const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

const {
  classifyThresholdAlerts,
  THRESHOLDS,
  _clearAnalyticsCache,
} = require('../services/securityAnalytics');

const {
  shouldAlert,
  markAlerted,
  _resetCooldowns,
  _setLastAlerted,
  COOLDOWN_MS,
} = require('../services/securityAlerts');

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeData(overrides = {}) {
  return {
    failed_logins_by_ip:     { '1h': [], '24h': [] },
    failed_logins_by_email:  { '1h': [], '24h': [] },
    two_fa_failures_by_user: { '1h': [], '24h': [] },
    auth_spike:              { current_hour: 0, baseline_hourly_avg: 0 },
    ...overrides,
  };
}

// ── classifyThresholdAlerts ───────────────────────────────────────────────────

describe('classifyThresholdAlerts — clean state', () => {
  test('zero alerts when all counts are below threshold', () => {
    const result = classifyThresholdAlerts(makeData());
    assert.equal(result.length, 0);
  });

  test('zero alerts when counts are exactly one below each threshold', () => {
    const data = makeData({
      failed_logins_by_ip: {
        '1h':  [{ ip_address: '1.2.3.4', count: THRESHOLDS.LOGIN_FAILED_IP_1H - 1 }],
        '24h': [{ ip_address: '1.2.3.4', count: THRESHOLDS.LOGIN_FAILED_IP_24H - 1 }],
      },
      failed_logins_by_email: {
        '1h':  [{ email: 'a@b.com', count: THRESHOLDS.LOGIN_FAILED_EMAIL_1H - 1 }],
        '24h': [{ email: 'a@b.com', count: THRESHOLDS.LOGIN_FAILED_EMAIL_24H - 1 }],
      },
      two_fa_failures_by_user: {
        '1h':  [{ user_id: 1, email: 'a@b.com', count: THRESHOLDS.TWO_FA_FAILED_USER_1H - 1 }],
        '24h': [{ user_id: 1, email: 'a@b.com', count: THRESHOLDS.TWO_FA_FAILED_USER_24H - 1 }],
      },
      auth_spike: {
        current_hour:       Math.floor((THRESHOLDS.AUTH_SPIKE_MULTIPLIER - 0.1) * 10),
        baseline_hourly_avg: 10,
      },
    });
    const result = classifyThresholdAlerts(data);
    assert.equal(result.length, 0, 'sub-threshold counts must not produce alerts');
  });
});

describe('classifyThresholdAlerts — LOGIN_FAILED_IP_1H', () => {
  test('triggers at exactly the threshold count', () => {
    const data = makeData({
      failed_logins_by_ip: {
        '1h':  [{ ip_address: '5.5.5.5', count: THRESHOLDS.LOGIN_FAILED_IP_1H }],
        '24h': [],
      },
    });
    const result = classifyThresholdAlerts(data);
    assert.equal(result.length, 1);
    assert.equal(result[0].signal, 'LOGIN_FAILED_IP_1H');
    assert.equal(result[0].severity, 'high');
    assert.equal(result[0].offender, '5.5.5.5');
    assert.equal(result[0].count, THRESHOLDS.LOGIN_FAILED_IP_1H);
    assert.equal(result[0].threshold, THRESHOLDS.LOGIN_FAILED_IP_1H);
  });

  test('does not trigger one count below threshold', () => {
    const data = makeData({
      failed_logins_by_ip: {
        '1h':  [{ ip_address: '5.5.5.5', count: THRESHOLDS.LOGIN_FAILED_IP_1H - 1 }],
        '24h': [],
      },
    });
    assert.equal(classifyThresholdAlerts(data).length, 0);
  });

  test('produces one alert per offending IP', () => {
    const data = makeData({
      failed_logins_by_ip: {
        '1h': [
          { ip_address: '1.1.1.1', count: THRESHOLDS.LOGIN_FAILED_IP_1H },
          { ip_address: '2.2.2.2', count: THRESHOLDS.LOGIN_FAILED_IP_1H },
          { ip_address: '3.3.3.3', count: THRESHOLDS.LOGIN_FAILED_IP_1H - 1 }, // below
        ],
        '24h': [],
      },
    });
    const result = classifyThresholdAlerts(data);
    assert.equal(result.length, 2);
    assert.deepEqual(result.map(r => r.offender).sort(), ['1.1.1.1', '2.2.2.2']);
  });
});

describe('classifyThresholdAlerts — LOGIN_FAILED_IP_24H', () => {
  test('triggers at threshold with medium severity', () => {
    const data = makeData({
      failed_logins_by_ip: {
        '1h':  [],
        '24h': [{ ip_address: '9.9.9.9', count: THRESHOLDS.LOGIN_FAILED_IP_24H }],
      },
    });
    const result = classifyThresholdAlerts(data);
    assert.equal(result.length, 1);
    assert.equal(result[0].signal, 'LOGIN_FAILED_IP_24H');
    assert.equal(result[0].severity, 'medium');
    assert.equal(result[0].offender, '9.9.9.9');
  });
});

describe('classifyThresholdAlerts — LOGIN_FAILED_EMAIL_1H', () => {
  test('triggers at threshold with high severity', () => {
    const data = makeData({
      failed_logins_by_email: {
        '1h':  [{ email: 'victim@example.com', count: THRESHOLDS.LOGIN_FAILED_EMAIL_1H }],
        '24h': [],
      },
    });
    const result = classifyThresholdAlerts(data);
    assert.equal(result.length, 1);
    assert.equal(result[0].signal, 'LOGIN_FAILED_EMAIL_1H');
    assert.equal(result[0].severity, 'high');
    assert.equal(result[0].offender, 'victim@example.com');
  });

  test('does not trigger below threshold', () => {
    const data = makeData({
      failed_logins_by_email: {
        '1h':  [{ email: 'victim@example.com', count: THRESHOLDS.LOGIN_FAILED_EMAIL_1H - 1 }],
        '24h': [],
      },
    });
    assert.equal(classifyThresholdAlerts(data).length, 0);
  });
});

describe('classifyThresholdAlerts — LOGIN_FAILED_EMAIL_24H', () => {
  test('triggers at threshold with medium severity', () => {
    const data = makeData({
      failed_logins_by_email: {
        '1h':  [],
        '24h': [{ email: 'target@example.com', count: THRESHOLDS.LOGIN_FAILED_EMAIL_24H }],
      },
    });
    const result = classifyThresholdAlerts(data);
    assert.equal(result.length, 1);
    assert.equal(result[0].signal, 'LOGIN_FAILED_EMAIL_24H');
    assert.equal(result[0].severity, 'medium');
    assert.equal(result[0].offender, 'target@example.com');
  });
});

describe('classifyThresholdAlerts — TWO_FA_FAILED_USER_1H', () => {
  test('triggers at threshold — uses email as offender when available', () => {
    const data = makeData({
      two_fa_failures_by_user: {
        '1h':  [{ user_id: 42, email: 'user42@example.com', count: THRESHOLDS.TWO_FA_FAILED_USER_1H }],
        '24h': [],
      },
    });
    const result = classifyThresholdAlerts(data);
    assert.equal(result.length, 1);
    assert.equal(result[0].signal, 'TWO_FA_FAILED_USER_1H');
    assert.equal(result[0].severity, 'high');
    assert.equal(result[0].offender, 'user42@example.com');
  });

  test('falls back to user_id string when email is null', () => {
    const data = makeData({
      two_fa_failures_by_user: {
        '1h':  [{ user_id: 7, email: null, count: THRESHOLDS.TWO_FA_FAILED_USER_1H }],
        '24h': [],
      },
    });
    const result = classifyThresholdAlerts(data);
    assert.equal(result.length, 1);
    assert.equal(result[0].offender, '7');
  });

  test('does not trigger below threshold', () => {
    const data = makeData({
      two_fa_failures_by_user: {
        '1h':  [{ user_id: 42, email: 'u@e.com', count: THRESHOLDS.TWO_FA_FAILED_USER_1H - 1 }],
        '24h': [],
      },
    });
    assert.equal(classifyThresholdAlerts(data).length, 0);
  });
});

describe('classifyThresholdAlerts — TWO_FA_FAILED_USER_24H', () => {
  test('triggers at threshold with medium severity', () => {
    const data = makeData({
      two_fa_failures_by_user: {
        '1h':  [],
        '24h': [{ user_id: 5, email: 'u@e.com', count: THRESHOLDS.TWO_FA_FAILED_USER_24H }],
      },
    });
    const result = classifyThresholdAlerts(data);
    assert.equal(result.length, 1);
    assert.equal(result[0].signal, 'TWO_FA_FAILED_USER_24H');
    assert.equal(result[0].severity, 'medium');
  });
});

describe('classifyThresholdAlerts — AUTH_SPIKE', () => {
  test('triggers when current hour exceeds multiplier × baseline', () => {
    const baseline = 10;
    const data = makeData({
      auth_spike: {
        current_hour:        Math.ceil(baseline * THRESHOLDS.AUTH_SPIKE_MULTIPLIER),
        baseline_hourly_avg: baseline,
      },
    });
    const result = classifyThresholdAlerts(data);
    assert.equal(result.length, 1);
    assert.equal(result[0].signal, 'AUTH_SPIKE');
    assert.equal(result[0].severity, 'high');
    assert.equal(result[0].offender, null, 'spike alert has no specific offender');
    assert.ok(result[0].detail, 'spike alert must include a detail message');
  });

  test('does not trigger when current hour is below multiplier × baseline', () => {
    const baseline = 10;
    const data = makeData({
      auth_spike: {
        current_hour:        Math.floor(baseline * (THRESHOLDS.AUTH_SPIKE_MULTIPLIER - 0.1)),
        baseline_hourly_avg: baseline,
      },
    });
    assert.equal(classifyThresholdAlerts(data).length, 0);
  });

  test('does not trigger when baseline is zero (avoids division by zero)', () => {
    const data = makeData({
      auth_spike: { current_hour: 999, baseline_hourly_avg: 0 },
    });
    assert.equal(classifyThresholdAlerts(data).length, 0,
      'must not flag a spike when there is no baseline history');
  });

  test('detail string includes current count, baseline, and multiplier', () => {
    const data = makeData({
      auth_spike: { current_hour: 60, baseline_hourly_avg: 10 },
    });
    const result = classifyThresholdAlerts(data);
    assert.equal(result.length, 1);
    assert.ok(result[0].detail.includes('60'), 'detail must include current count');
    assert.ok(result[0].detail.includes('10'), 'detail must include baseline avg');
    assert.ok(result[0].detail.includes('6.0'), 'detail must include the computed multiplier');
  });
});

describe('classifyThresholdAlerts — output shape', () => {
  test('every triggered alert has required fields: signal, offender, count, threshold, severity', () => {
    const data = makeData({
      failed_logins_by_ip: {
        '1h':  [{ ip_address: '8.8.8.8', count: THRESHOLDS.LOGIN_FAILED_IP_1H }],
        '24h': [],
      },
    });
    const result = classifyThresholdAlerts(data);
    assert.equal(result.length, 1);
    const item = result[0];
    assert.ok(item.signal,    'must have signal');
    assert.ok(item.offender,  'must have offender');
    assert.ok(item.count > 0, 'must have positive count');
    assert.ok(item.threshold, 'must have threshold');
    assert.ok(['high', 'medium', 'low'].includes(item.severity), 'severity must be high/medium/low');
  });
});

// ── Cooldown / dedupe (shouldAlert + markAlerted) ─────────────────────────────

describe('alert cooldown — shouldAlert / markAlerted', () => {
  beforeEach(() => _resetCooldowns());

  test('shouldAlert returns true initially (no prior alert)', () => {
    assert.equal(shouldAlert('LOGIN_FAILED_IP_1H', '1.1.1.1'), true);
  });

  test('shouldAlert returns false immediately after markAlerted', () => {
    markAlerted('LOGIN_FAILED_IP_1H', '1.1.1.1');
    assert.equal(shouldAlert('LOGIN_FAILED_IP_1H', '1.1.1.1'), false);
  });

  test('shouldAlert returns true again after cooldown has elapsed', () => {
    // Backdate the stored timestamp past the cooldown window
    const pastTimestamp = Date.now() - COOLDOWN_MS - 1;
    _setLastAlerted('LOGIN_FAILED_IP_1H', '1.1.1.1', pastTimestamp);
    assert.equal(shouldAlert('LOGIN_FAILED_IP_1H', '1.1.1.1'), true,
      'alert should be allowed again once cooldown expires');
  });

  test('cooldown at exactly the boundary (COOLDOWN_MS elapsed) allows the alert', () => {
    _setLastAlerted('AUTH_SPIKE', null, Date.now() - COOLDOWN_MS);
    assert.equal(shouldAlert('AUTH_SPIKE', null), true);
  });

  test('different offenders for the same signal are tracked independently', () => {
    markAlerted('LOGIN_FAILED_IP_1H', '1.1.1.1');
    // Suppressed for 1.1.1.1 but not for 2.2.2.2
    assert.equal(shouldAlert('LOGIN_FAILED_IP_1H', '1.1.1.1'), false);
    assert.equal(shouldAlert('LOGIN_FAILED_IP_1H', '2.2.2.2'), true);
  });

  test('different signals for the same offender are tracked independently', () => {
    markAlerted('LOGIN_FAILED_IP_1H', '1.1.1.1');
    assert.equal(shouldAlert('LOGIN_FAILED_IP_1H',  '1.1.1.1'), false);
    assert.equal(shouldAlert('LOGIN_FAILED_IP_24H', '1.1.1.1'), true);
  });

  test('null offender (spike) is tracked under __global__ key', () => {
    markAlerted('AUTH_SPIKE', null);
    assert.equal(shouldAlert('AUTH_SPIKE', null),        false);
    assert.equal(shouldAlert('AUTH_SPIKE', '1.2.3.4'),   true, 'offender-specific key is separate');
  });

  test('_resetCooldowns clears all tracked entries', () => {
    markAlerted('LOGIN_FAILED_IP_1H', '1.1.1.1');
    markAlerted('AUTH_SPIKE', null);
    _resetCooldowns();
    assert.equal(shouldAlert('LOGIN_FAILED_IP_1H', '1.1.1.1'), true);
    assert.equal(shouldAlert('AUTH_SPIKE', null),               true);
  });
});

// ── Analytics cache ───────────────────────────────────────────────────────────

describe('_clearAnalyticsCache', () => {
  test('_clearAnalyticsCache is exported and callable without errors', () => {
    // Verifies the cache helper is wired up correctly so tests can clear state
    assert.doesNotThrow(() => _clearAnalyticsCache());
    assert.doesNotThrow(() => _clearAnalyticsCache()); // idempotent
  });
});
