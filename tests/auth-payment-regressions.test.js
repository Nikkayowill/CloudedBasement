// tests/auth-payment-regressions.test.js
// Focused source-level regression checks for recent auth/payment hardening.
// Run: node --test tests/auth-payment-regressions.test.js

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');

describe('paymentController hardening regressions', () => {
  test('validates plan keys and uses validatedPlan in Stripe metadata', () => {
    const src = fs.readFileSync(require.resolve('../controllers/paymentController'), 'utf8');

    assert.ok(src.includes('const ALLOWED_PLAN_KEYS = Object.keys(PRICING_PLANS);'));
    assert.ok(src.includes('function getValidatedPlan(planValue, fallback = \'basic\')'));
    assert.ok(src.includes('const validatedPlan = getValidatedPlan(req.body.plan, \'basic\');'));
    assert.ok(src.includes('metadata: { plan: validatedPlan }'));
    assert.ok(src.includes('plan: validatedPlan,'));
  });

  test('demo redirect uses safe interpolation and encoding', () => {
    const src = fs.readFileSync(require.resolve('../controllers/paymentController'), 'utf8');

    assert.ok(src.includes('const demoPlan = ${JSON.stringify(validatedDemoPlan)};'));
    assert.ok(src.includes("encodeURIComponent(demoPlan)"));
    assert.ok(src.includes("return res.status(400).send('Invalid plan selected');"));
  });
});

describe('auth middleware hardening regressions', () => {
  test('requireAuth uses shared isApiRequest helper', () => {
    const src = fs.readFileSync(require.resolve('../middleware/auth'), 'utf8');

    assert.ok(src.includes('function requireAuth(req, res, next)'));
    assert.ok(src.includes('if (isApiRequest(req))'));
    assert.ok(src.includes("req.path === '/create-payment-intent'"));
  });

  test('missing-role paths destroy session with callback before redirect', () => {
    const src = fs.readFileSync(require.resolve('../middleware/auth'), 'utf8');

    assert.ok(src.includes('function destroySessionAndRedirect(req, res, location)'));
    assert.ok(src.includes('req.session.destroy((err) => {'));
    assert.ok(src.includes("return destroySessionAndRedirect(req, res, '/login?error=Session invalid');"));
  });

  test('google auth start route enables OAuth state and missing-config guard', () => {
    const src = fs.readFileSync(require.resolve('../routes/auth'), 'utf8');

    assert.ok(src.includes('function ensureGoogleOAuthAvailable(req, res, next)'));
    assert.ok(src.includes("return res.redirect('/login?error=Google authentication is unavailable');"));
    assert.ok(src.includes("passport.authenticate('google', { scope: ['profile', 'email'], state: true })"));
  });

  test('google auth callback regenerates session before setting auth state', () => {
    const src = fs.readFileSync(require.resolve('../routes/auth'), 'utf8');

    assert.ok(src.includes("req.session.regenerate((err) => {"));
    assert.ok(src.includes("console.error('Session regeneration error on Google login:'"));
    assert.ok(src.includes("req.session.userId = req.user.id;"));
    assert.ok(src.includes("return res.redirect(req.user.role === 'admin' ? '/admin' : '/dashboard');"));
  });

  test('google auth service supports env-configured callback URL', () => {
    const src = fs.readFileSync(require.resolve('../services/googleAuth'), 'utf8');

    assert.ok(src.includes('function isGoogleOAuthConfigured()'));
    assert.ok(src.includes('function getGoogleCallbackURL()'));
    assert.ok(src.includes('if (process.env.GOOGLE_CALLBACK_URL)'));
  });
});
