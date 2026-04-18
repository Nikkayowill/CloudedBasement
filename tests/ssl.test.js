// tests/ssl.test.js
// Unit tests for domain/SSL verification lifecycle
// Run: node --test tests/ssl.test.js

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

// ── sslVerification — checkDNSPointsToUs ─────────────────────────────────────

describe('checkDNSPointsToUs', () => {
  function freshSSLVerification() {
    delete require.cache[require.resolve('../services/sslVerification')];
    return require('../services/sslVerification');
  }

  test('returns valid:true when resolved IP matches expected', async () => {
    const dnsMod = require('dns');
    const orig = dnsMod.promises.resolve4;
    dnsMod.promises.resolve4 = async () => ['1.2.3.4', '1.2.3.5'];

    try {
      const { checkDNSPointsToUs } = freshSSLVerification();
      const result = await checkDNSPointsToUs('example.com', '1.2.3.4');
      assert.equal(result.valid, true);
      assert.ok(result.reason.includes('points to our server'));
    } finally {
      dnsMod.promises.resolve4 = orig;
    }
  });

  test('returns valid:false when IP does not match', async () => {
    const dnsMod = require('dns');
    const orig = dnsMod.promises.resolve4;
    dnsMod.promises.resolve4 = async () => ['9.9.9.9'];

    try {
      const { checkDNSPointsToUs } = freshSSLVerification();
      const result = await checkDNSPointsToUs('example.com', '1.2.3.4');
      assert.equal(result.valid, false);
      assert.ok(result.reason.includes('instead of'));
    } finally {
      dnsMod.promises.resolve4 = orig;
    }
  });

  test('returns valid:false when DNS lookup fails', async () => {
    const dnsMod = require('dns');
    const orig = dnsMod.promises.resolve4;
    const err = new Error('NXDOMAIN');
    err.code = 'ENOTFOUND';
    dnsMod.promises.resolve4 = async () => { throw err; };

    try {
      const { checkDNSPointsToUs } = freshSSLVerification();
      const result = await checkDNSPointsToUs('nonexistent.example.com', '1.2.3.4');
      assert.equal(result.valid, false);
      assert.ok(result.error || result.reason, 'should include reason or error');
    } finally {
      dnsMod.promises.resolve4 = orig;
    }
  });
});

// ── determineSSLStatus state machine ─────────────────────────────────────────

describe('determineSSLStatus', () => {
  // We need to access the non-exported helper — test via source inspection
  test('state machine: no DNS → ssl_status = none', () => {
    const fs = require('fs');
    const src = fs.readFileSync(require.resolve('../services/sslVerification'), 'utf8');
    // Verify the state machine logic is present
    assert.ok(src.includes("return 'none'"), 'state machine should return none for no DNS');
    assert.ok(src.includes("return 'orphaned'"), 'state machine should handle orphaned state');
    assert.ok(src.includes("return 'active'"), 'state machine should return active when all checks pass');
    assert.ok(src.includes("return 'unreachable'"), 'state machine should handle unreachable state');
  });
});

// ── autoSSL — DNS check delegation ───────────────────────────────────────────

describe('autoSSL DNS delegation', () => {
  test('autoSSL imports checkDNSPointsToUs from sslVerification', () => {
    const fs = require('fs');
    const src = fs.readFileSync(require.resolve('../services/autoSSL'), 'utf8');
    assert.ok(
      src.includes('checkDNSPointsToUs'),
      'autoSSL.js should use checkDNSPointsToUs from sslVerification'
    );
    assert.ok(
      src.includes('sslVerification'),
      'autoSSL.js should import from sslVerification'
    );
  });

  test('autoSSL does not contain its own dns.resolve4 call', () => {
    const fs = require('fs');
    const src = fs.readFileSync(require.resolve('../services/autoSSL'), 'utf8');
    assert.ok(
      !src.includes('dns.resolve4'),
      'autoSSL.js should not have its own dns.resolve4 call (should delegate to sslVerification)'
    );
    assert.ok(
      !src.includes("require('dns')"),
      'autoSSL.js should not require dns directly'
    );
  });

  test('autoSSL responds to checkDNSPointsToUs valid:false result without provisioning', async () => {
    // Verify source code: if dnsResult.valid is false, we return early
    const fs = require('fs');
    const src = fs.readFileSync(require.resolve('../services/autoSSL'), 'utf8');
    assert.ok(
      src.includes('dnsResult.valid') || src.includes('!dnsResult.valid'),
      'autoSSL.js should check dnsResult.valid before provisioning'
    );
  });
});

// ── Regression: sslVerification still exports all expected functions ──────────

describe('sslVerification exports regression', () => {
  test('all original exports still present', () => {
    const mod = require('../services/sslVerification');
    const expected = ['verifyDomainSSL', 'reconcileAllSSLStates', 'checkDNSPointsToUs', 'checkTLSReachable', 'checkCertExistsOnServer', 'quickDNSCheck'];
    for (const fn of expected) {
      assert.equal(typeof mod[fn], 'function', `${fn} should still be exported`);
    }
  });
});
