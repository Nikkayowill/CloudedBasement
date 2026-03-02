// tests/ui/onboarding.cy.js
//
// Focused tests for the /onboarding/choose page.
// These run independently of the full flow spec; they seed the required
// DB state (confirmed user + payment) via tasks rather than going through
// the full registration/payment UI.

describe('Onboarding — /onboarding/choose', () => {
  const testEmail    = `e2e_ob_${Date.now()}@testdomain.dev`;
  const testPassword = 'Tr0ub4dor&3!E2E';

  before(() => {
    cy.task('db:deleteTestUser', testEmail);
    // Register + confirm email + seed payment so we can access /onboarding/choose
    cy.registerAndConfirm(testEmail, testPassword);
    cy.task('db:insertPayment', { userEmail: testEmail, plan: 'basic' });
  });

  after(() => {
    cy.task('db:deleteTestUser', testEmail);
  });

  beforeEach(() => {
    // Delete any server rows from previous tests so getUserServer() returns null
    // and the /onboarding/choose guard does NOT redirect us to /dashboard.
    cy.task('db:deleteUserServers', testEmail);
    cy.login(testEmail, testPassword);
    cy.visit('/onboarding/choose');
    // Early failure guard — if the guard redirected us, every test would fail
    // on a missing element rather than giving a useful "redirected" message.
    cy.url().should('include', '/onboarding/choose');
  });

  // ── Page structure ────────────────────────────────────────────────────────

  it('renders the hosting-type selection page', () => {
    cy.get('h1').should('contain.text', 'Choose your hosting type');
    // Plan name is shown in the sub-heading (BASIC in this run)
    cy.contains('BASIC').should('exist');
  });

  // ── Node.js card ──────────────────────────────────────────────────────────

  it('displays the Node.js / Git Deploy card with all expected features', () => {
    cy.contains('h2', 'Node.js / Git Deploy').should('be.visible');

    const expectedFeatures = [
      'Deploy from GitHub in seconds',
      'PM2 + Nginx pre-configured',
      'Multiple sites per server',
      'Custom domains + free SSL',
    ];
    expectedFeatures.forEach((feat) => {
      cy.contains('li', feat).should('exist');
    });

    cy.contains('button', 'Deploy Node.js App')
      .should('be.visible')
      .and('not.be.disabled');
  });

  // ── WordPress card ────────────────────────────────────────────────────────

  it('displays the Managed WordPress card with all expected features', () => {
    cy.contains('h2', 'Managed WordPress').should('be.visible');

    const expectedFeatures = [
      'WordPress + MySQL auto-installed',
      'PHP 8.3-FPM + Nginx optimised',
      'Certbot (Let\'s Encrypt) ready',
      'wp-cli available via SSH',
    ];
    expectedFeatures.forEach((feat) => {
      cy.contains('li', feat).should('exist');
    });

    cy.contains('button', 'Launch WordPress Site')
      .should('be.visible')
      .and('not.be.disabled');
  });

  it('renders the WordPress form with siteTitle and adminEmail inputs', () => {
    cy.get('#wp-onboarding-form').within(() => {
      cy.get('input[name="siteTitle"]')
        .should('have.attr', 'type', 'text')
        .and('have.attr', 'placeholder', 'My WordPress Site')
        .and('have.attr', 'required');

      cy.get('input[name="adminEmail"]')
        .should('have.attr', 'type', 'email')
        .and('have.attr', 'placeholder', 'you@example.com')
        .and('have.attr', 'required');
    });
  });

  // ── Footer note ───────────────────────────────────────────────────────────

  it('shows the single-server constraint note', () => {
    cy.contains('You can only run one server type per plan.').should('exist');
    cy.contains('a', 'Contact support')
      .should('have.attr', 'href', 'mailto:support@cloudedbasement.ca');
  });

  // ── Guard: unauthenticated access ─────────────────────────────────────────

  it('redirects unauthenticated users away from /onboarding/choose', () => {
    // Clear the session cookie to simulate a logged-out browser
    cy.clearCookies();
    cy.visit('/onboarding/choose');
    // Should land on /login or /pricing (payment_required guard)
    cy.url().should('match', /\/(login|pricing)/);
  });

  // ── Node.js provisioning submission ──────────────────────────────────────

  it('submits the Node.js form and lands on /dashboard with provisioning started', () => {
    cy.contains('button', 'Deploy Node.js App').click();

    // Must land on /dashboard — not stay on the onboarding page.
    cy.url({ timeout: 15000 }).should('include', '/dashboard');

    // Failure redirects to /dashboard?error=... — assert that does NOT happen.
    // A DO API key must be present for this assertion to pass.
    cy.url().should('not.include', 'error=');

    // The raw error JSON must not be visible anywhere in the page.
    cy.get('body').should('not.contain.text', 'Failed to start provisioning. Please try again.');
  });

  // ── WordPress provisioning submission ────────────────────────────────────

  it('does not submit the WordPress form when required fields are empty', () => {
    // Attempt to submit without filling required fields.
    // HTML5 `required` validation fires before the POST; page does not navigate.
    cy.get('#wp-onboarding-form').within(() => {
      cy.get('button[type="submit"]').click();
    });
    cy.url().should('include', '/onboarding/choose');
  });

  it('POSTs the WordPress form with valid inputs and starts provisioning (202)', () => {
    // POST /wordpress/create returns JSON 202 (accepted) — NOT a redirect.
    // Intercept the request before clicking so we can inspect the response.
    cy.intercept('POST', '/wordpress/create').as('wpCreate');

    cy.get('#wp-onboarding-form').within(() => {
      cy.get('input[name="siteTitle"]').type('My E2E Test Site');
      cy.get('input[name="adminEmail"]').type(testEmail);
      cy.get('button[type="submit"]').click();
    });

    cy.wait('@wpCreate').then(({ response }) => {
      // Only 202 is acceptable. A 500 means provisioning failed and the browser
      // will render the raw JSON {"error":"Failed to start provisioning..."} —
      // a broken UX. A DO API key must be configured for this assertion to pass.
      expect(response.statusCode, 'POST /wordpress/create must be 202').to.eq(202);
      expect(response.body, 'response body must not contain an error key').to.not.have.property('error');
    });

    // Belt-and-suspenders: the raw error string must not be visible in the viewport.
    // This catches regressions where a 500 body leaks into the rendered page.
    cy.get('body').should('not.contain.text', 'Failed to start provisioning. Please try again.');
  });
});
