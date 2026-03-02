// tests/ui/fullUserFlow.cy.js
//
// Full E2E journey: Landing → Register → Email confirm → Onboarding → Dashboard
//
// External integrations that can't run in a local test environment:
//   • Stripe payment UI  — payment record is seeded via db:insertPayment task
//   • DigitalOcean API   — provisioning may fail gracefully if DO_API_KEY is absent;
//                          the test only asserts the redirect, not that a droplet exists
//   • Real email sending — email confirmation is applied via db:confirmEmail task
//
// Run:  npx cypress run --spec tests/ui/fullUserFlow.cy.js
// Open: npx cypress open  (select this file)

describe('Full User Flow: Landing → Dashboard', () => {
  // Unique email per run prevents conflicts if a previous run left data behind.
  const testEmail    = `e2e_${Date.now()}@testdomain.dev`;
  const testPassword = 'Tr0ub4dor&3!E2E'; // zxcvbn score ≥ 3 (mixed, symbols, length)

  before(() => {
    // Remove any leftover data from a previous incomplete run.
    cy.task('db:deleteTestUser', testEmail);
  });

  after(() => {
    // Keep the DB clean; comment this out temporarily to inspect test data.
    cy.task('db:deleteTestUser', testEmail);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // The entire flow is one `it` so the browser session is shared across steps.
  // Each phase is clearly marked with a comment; failures identify the exact step.
  // ─────────────────────────────────────────────────────────────────────────
  it('completes the full user journey from landing page to dashboard', () => {

    // ── Phase 1: Landing page ─────────────────────────────────────────────
    // Authenticated users are redirected to /dashboard; visiting as a guest
    // should render the React homepage.
    cy.visit('/');

    // Primary CTA — "Start Free Trial" links to /register (HeroSection.jsx:24)
    cy.get('a[href="/register"]')
      .first()
      .should('be.visible')
      .and('contain.text', 'Start free trial');

    cy.get('a[href="/register"]').first().click();
    cy.url().should('include', '/register');


    // ── Phase 2: Registration ─────────────────────────────────────────────
    // The register form has a bot-verification CAPTCHA: a 6-char code is
    // rendered in a <span class="font-mono"> and must be typed verbatim.
    // The submit button starts disabled and is only enabled via an inline JS
    // listener once the typed value matches the displayed code.
    cy.get('h1').should('contain.text', 'CREATE ACCOUNT');

    // Read the displayed bot code from the DOM before typing form values.
    // Selector: the font-mono span inside the same parent div as #botCode input.
    cy.get('#botCode').parent().find('span.font-mono').invoke('text').then((botCode) => {
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type(testPassword);
      cy.get('input[name="confirmPassword"]').type(testPassword);
      cy.get('#acceptTerms').check({ force: true });

      // Type the code — the inline listener converts to uppercase and enables
      // #submitBtn once the value matches.
      cy.get('#botCode').type(botCode.trim().toUpperCase());
    });

    // Commands below run after the .then() resolves (Cypress command queue).
    cy.get('#submitBtn').should('not.be.disabled');
    cy.get('#submitBtn').click();

    // Registration creates a session and redirects to /dashboard.
    // At this point session.emailConfirmed = false.
    cy.url().should('include', '/dashboard');


    // ── Phase 3: Email confirmation (DB task + re-login) ──────────────────
    // The real flow: user receives an email with a 6-digit code and visits
    // /confirm-email/:code.  In tests we skip the email by updating the DB,
    // then force a fresh login so the session picks up emailConfirmed: true.
    cy.task('db:confirmEmail', testEmail);

    // Logout destroys the session that has emailConfirmed: false.
    cy.visit('/logout');
    cy.url().should('include', '/login');

    cy.get('input[name="email"]').type(testEmail);
    cy.get('input[name="password"]').type(testPassword);
    cy.get('form[action="/login"]').submit();

    // After re-login, session.emailConfirmed = true (read from DB on login).
    cy.url().should('include', '/dashboard');


    // ── Phase 4: Payment (seeded via DB task) ─────────────────────────────
    // The real flow uses Stripe Elements (cross-origin iframes).  Automating
    // those requires cy.origin('https://js.stripe.com', ...) and a valid test
    // Stripe key; see the dedicated stripe-payment.cy.js spec (TODO) for that.
    // Here we insert a succeeded payment record directly, which is what the
    // Stripe webhook would do after a real payment.
    cy.task('db:insertPayment', { userEmail: testEmail, plan: 'basic' });


    // ── Phase 5: Onboarding — choose hosting type ─────────────────────────
    // POST /payment-success redirects to /onboarding/choose.  With a payment
    // in the DB we can visit it directly.
    cy.visit('/onboarding/choose');
    cy.url().should('include', '/onboarding/choose');

    // Page header
    cy.get('h1').should('contain.text', 'Choose your hosting type');

    // ── Node.js / Git Deploy card ─────────────────────────────────────────
    cy.contains('h2', 'Node.js / Git Deploy').should('be.visible');
    cy.contains('li', 'Deploy from GitHub in seconds').should('exist');
    cy.contains('li', 'PM2 + Nginx pre-configured').should('exist');
    cy.contains('button', 'Deploy Node.js App').should('be.visible');

    // ── Managed WordPress card ────────────────────────────────────────────
    cy.contains('h2', 'Managed WordPress').should('be.visible');
    cy.contains('li', 'WordPress + MySQL auto-installed').should('exist');
    // WordPress card has inline form inputs
    cy.get('input[name="siteTitle"]')
      .should('exist')
      .and('have.attr', 'placeholder', 'My WordPress Site');
    cy.get('input[name="adminEmail"]')
      .should('exist')
      .and('have.attr', 'type', 'email');
    cy.contains('button', 'Launch WordPress Site').should('be.visible');

    // Footer note confirming single-server constraint
    cy.contains('You can only run one server type per plan.').should('exist');

    // ── Phase 5b: Submit Node.js provisioning ─────────────────────────────
    // POST /onboarding/provision-nodejs → redirect to /dashboard?provisioning=true
    // A DO API key must be present; the test fails if the backend errors out
    // and redirects to /dashboard?error=... instead.
    cy.contains('button', 'Deploy Node.js App').click();

    cy.url({ timeout: 15000 }).should('include', '/dashboard');

    // Provisioning must have started — failure redirects add ?error= to the URL.
    cy.url().should('not.include', 'error=');

    // The raw JSON error body must never appear in the viewport.
    // wordpressController returns {"error":"Failed to start provisioning..."} on 500;
    // a similar guard here catches any accidental JSON-body leakage on this path.
    cy.get('body').should('not.contain.text', 'Failed to start provisioning. Please try again.');


    // ── Phase 6: Dashboard verification ──────────────────────────────────
    // Revisit /dashboard to confirm we're authenticated and the layout renders.
    cy.visit('/dashboard');

    // Must stay on dashboard — no redirect to /login
    cy.url().should('not.include', '/login');

    // Dashboard nav — React Sidebar.jsx overrides two labels (Sidebar.jsx:53-54):
    // 'sites' → 'Domains', 'deploy' → 'Deployments'
    cy.contains('Overview').should('exist');
    cy.contains('Domains').should('exist');
    cy.contains('Deployments').should('exist');
    cy.contains('Dev Tools').should('exist');
    cy.contains('Settings').should('exist');
  });
});
