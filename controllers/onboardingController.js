'use strict';

// controllers/onboardingController.js
// Post-payment onboarding — lets the user choose between Node.js hosting and
// managed WordPress before any server is provisioned.
//
// Flow:
//   Pay on Stripe → /payment-success → /onboarding/choose
//   User clicks "Deploy Node.js App" → POST /onboarding/provision-nodejs → /dashboard?provisioning=true
//   User fills "Launch WordPress Site"  → POST /wordpress/create → /dashboard (polls status)

const pool = require('../db');
const { hasSuccessfulPayment, getUserServer } = require('../src/utils/db-helpers');
const { createRealServer } = require('../services/digitalocean');
const { getDashboardHead, getFooter, getScripts, getResponsiveNav, escapeHtml } = require('../src/utils/helpers');
const { getNonce } = require('../src/utils/nonce');

// ── GET /onboarding/choose ─────────────────────────────────────────────────

exports.showChoice = async (req, res) => {
  const userId = req.session.userId;

  try {
    // Guard: already has a server → nothing to choose
    const server = await getUserServer(userId);
    if (server) {
      return res.redirect('/dashboard');
    }

    // Guard: hasn't paid → send to pricing
    const hasPaid = await hasSuccessfulPayment(userId);
    if (!hasPaid) {
      return res.redirect('/pricing?error=payment_required');
    }

    // Fetch the most recent successful payment for plan info.
    // Note: payment_interval is NOT stored in the payments table — it is
    // forwarded as a query-param by /payment-success → /onboarding/choose.
    const paymentResult = await pool.query(
      `SELECT plan
         FROM payments
        WHERE user_id = $1 AND status = 'succeeded'
        ORDER BY created_at DESC
        LIMIT 1`,
      [userId]
    );
    const plan           = paymentResult.rows[0]?.plan || 'basic';
    const paymentInterval = req.query.interval === 'yearly' ? 'yearly' : 'monthly';

    const csrfToken = typeof req.csrfToken === 'function' ? req.csrfToken() : '';

    res.send(`
${getDashboardHead('Choose Your Hosting - Clouded Basement')}
  ${getResponsiveNav(req)}

  <main class="min-h-screen py-16 px-4" style="background: var(--dash-bg-base, #000);">
    <div class="max-w-4xl mx-auto">

      <!-- Header -->
      <div class="text-center mb-12">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
             style="background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.25);">
          <svg class="w-7 h-7" style="color: var(--dash-accent, #3b82f6);" fill="none"
               stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
        <h1 class="text-2xl font-semibold mb-2" style="color: var(--dash-text-primary, #fafafa);">
          Choose your hosting type
        </h1>
        <p class="text-sm" style="color: var(--dash-text-secondary, #a1a1a1);">
          Payment confirmed &mdash; <span class="font-medium"
          style="color: var(--dash-accent, #3b82f6);">${escapeHtml(plan.toUpperCase())}</span> plan.
          Select what you want to run on your server.
        </p>
      </div>

      <!-- Choice cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

        <!-- ── Node.js Card ─────────────────────────────────────────────── -->
        <div class="dash-card flex flex-col">
          <div class="dash-card-header mb-2">
            <div class="flex items-center gap-3">
              <!-- Node.js icon -->
              <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"
                   style="color: #4ade80;" aria-hidden="true">
                <path d="M12 1.85a.75.75 0 01.375.1l7.5 4.33a.75.75 0 01.375.65v8.64a.75.75 0 01-.375.649l-7.5 4.33a.75.75 0 01-.75 0l-7.5-4.33a.75.75 0 01-.375-.65V6.93a.75.75 0 01.375-.65l7.5-4.33A.75.75 0 0112 1.85z"/>
              </svg>
              <h2 class="text-base font-semibold" style="color: var(--dash-text-primary, #fafafa);">
                Node.js / Git Deploy
              </h2>
            </div>
          </div>
          <p class="text-sm mb-5" style="color: var(--dash-text-secondary, #a1a1a1);">
            Deploy any Node.js app directly from a GitHub repository. PM2 process manager,
            Nginx reverse proxy, multi-domain support, auto-deploy on push.
          </p>
          <ul class="space-y-2 mb-6 flex-1 text-sm" style="color: var(--dash-text-secondary, #a1a1a1);">
            ${[
              'Deploy from GitHub in seconds',
              'PM2 + Nginx pre-configured',
              'Multiple sites per server',
              'Custom domains + free SSL',
              'PostgreSQL &amp; MongoDB available',
            ].map(f => `
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 flex-shrink-0" style="color: var(--dash-success, #22c55e);"
                   fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              ${f}
            </li>`).join('')}
          </ul>
          <!-- Form submits to the provisioning endpoint -->
          <form action="/onboarding/provision-nodejs" method="POST">
            <input type="hidden" name="_csrf" value="${csrfToken}">
            <input type="hidden" name="plan"  value="${escapeHtml(plan)}">
            <input type="hidden" name="interval" value="${escapeHtml(paymentInterval)}">
            <button type="submit" class="dash-btn dash-btn-primary w-full">
              Deploy Node.js App
            </button>
          </form>
        </div>

        <!-- ── WordPress Card ───────────────────────────────────────────── -->
        <div class="dash-card flex flex-col">
          <div class="dash-card-header mb-2">
            <div class="flex items-center gap-3">
              <!-- WordPress icon -->
              <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"
                   style="color: #21759b;" aria-hidden="true">
                <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 1.543c2.34 0 4.484.849 6.141 2.247L4.79 18.141A8.432 8.432 0 013.543 12c0-4.666 3.791-8.457 8.457-8.457zm0 16.914a8.432 8.432 0 01-5.34-1.898l3.516-9.623.007-.017 3.613 9.904A8.43 8.43 0 0112 20.457zm3.507-.85l-2.61-7.143 2.553-7.387A8.46 8.46 0 0120.457 12a8.432 8.432 0 01-4.95 7.607z"/>
              </svg>
              <h2 class="text-base font-semibold" style="color: var(--dash-text-primary, #fafafa);">
                Managed WordPress
              </h2>
            </div>
          </div>
          <p class="text-sm mb-5" style="color: var(--dash-text-secondary, #a1a1a1);">
            A fully provisioned WordPress installation — MySQL 8, PHP 8.3-FPM, Nginx,
            wp-cli, and Certbot. Admin credentials generated and encrypted automatically.
          </p>
          <ul class="space-y-2 mb-6 flex-1 text-sm" style="color: var(--dash-text-secondary, #a1a1a1);">
            ${[
              'WordPress + MySQL auto-installed',
              'PHP 8.3-FPM + Nginx optimised',
              'Certbot (Let&apos;s Encrypt) ready',
              'Encrypted credential storage',
              'wp-cli available via SSH',
            ].map(f => `
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 flex-shrink-0" style="color: var(--dash-success, #22c55e);"
                   fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              ${f}
            </li>`).join('')}
          </ul>
          <!-- WordPress form — submits to the existing /wordpress/create endpoint -->
          <form id="wp-onboarding-form" action="/wordpress/create" method="POST" class="space-y-3">
            <input type="hidden" name="_csrf"  value="${csrfToken}">
            <input type="hidden" name="plan"   value="${escapeHtml(plan)}">
            <div>
              <label class="block text-xs mb-1" style="color: var(--dash-text-secondary, #a1a1a1);"
                     for="ob-wp-title">Site title</label>
              <input type="text" id="ob-wp-title" name="siteTitle" required
                     maxlength="100" placeholder="My WordPress Site"
                     class="dash-input w-full">
            </div>
            <div>
              <label class="block text-xs mb-1" style="color: var(--dash-text-secondary, #a1a1a1);"
                     for="ob-wp-email">Admin email</label>
              <input type="email" id="ob-wp-email" name="adminEmail" required
                     placeholder="you@example.com"
                     class="dash-input w-full">
            </div>
            <button type="submit" class="dash-btn dash-btn-secondary w-full">
              Launch WordPress Site
            </button>
          </form>
        </div>

      </div><!-- /grid -->

      <!-- Footer note -->
      <p class="text-center text-xs mt-8" style="color: var(--dash-text-muted, #525252);">
        You can only run one server type per plan.
        <a href="mailto:support@cloudedbasement.ca" class="underline hover:opacity-80">
          Contact support
        </a>
        if you need to switch later.
      </p>

    </div><!-- /max-w-4xl -->
  </main>

  ${getFooter()}
  ${getScripts('nav.js')}

  <script nonce="${getNonce()}">
  // Disable submit buttons after click to prevent double-provision
  document.querySelectorAll('.dash-card form').forEach(function (form) {
    form.addEventListener('submit', function () {
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = 'Launching\u2026'; }
    });
  });
  </script>
`);
  } catch (err) {
    console.error('[Onboarding] showChoice error:', err.message);
    res.status(500).send('An error occurred. Please try again.');
  }
};

// ── POST /onboarding/provision-nodejs ─────────────────────────────────────

/**
 * Provisions a Node.js server for the authenticated user.
 *
 * This is the equivalent of what the Stripe webhook used to do automatically.
 * We moved it here so the user explicitly chooses Node.js over WordPress first.
 *
 * Body: { plan, interval } — both are redundant (re-read from payments table for
 * security) but the hidden inputs let us skip the extra DB query in the happy path.
 */
exports.provisionNodejs = async (req, res) => {
  const userId = req.session.userId;

  try {
    // Re-verify payment server-side — never trust client-supplied plan.
    // interval comes from the hidden form input rendered by showChoice, which
    // itself reads from req.query.interval (forwarded from /payment-success).
    const paymentResult = await pool.query(
      `SELECT plan, stripe_payment_id
         FROM payments
        WHERE user_id = $1 AND status = 'succeeded'
        ORDER BY created_at DESC
        LIMIT 1`,
      [userId]
    );

    if (paymentResult.rows.length === 0) {
      return res.redirect('/pricing?error=payment_required');
    }

    // Guard: already has a server (double-submit or back-button)
    const existing = await getUserServer(userId);
    if (existing) {
      return res.redirect('/dashboard');
    }

    const { plan, stripe_payment_id: chargeId } = paymentResult.rows[0];
    // interval was forwarded from /payment-success via the hidden form input
    const interval = req.body.interval === 'yearly' ? 'yearly' : 'monthly';

    // Kick off async Node.js provisioning — same call the webhook used to make
    await createRealServer(userId, plan, chargeId, interval);

    return res.redirect('/dashboard?provisioning=true');

  } catch (err) {
    console.error('[Onboarding] provisionNodejs error:', err.message);
    return res.redirect('/dashboard?error=Provisioning failed, please contact support');
  }
};
