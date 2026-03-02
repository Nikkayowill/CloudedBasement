// cypress/support/commands.js
// Custom Cypress commands used across all E2E specs.

// ── cy.login(email, password) ────────────────────────────────────────────────
// Fast login that caches the authenticated session with cy.session().
// The session is reused across tests in the same spec, so the full login
// round-trip only happens once per unique [email, password] pair.
//
// Usage:
//   cy.login('user@example.com', 'Password123!');
//   cy.visit('/dashboard');
Cypress.Commands.add('login', (email, password) => {
  cy.session(
    [email, password],
    () => {
      cy.visit('/login');
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type(password);
      cy.get('form[action="/login"]').submit();
      cy.url().should('include', '/dashboard');
    },
    {
      // Re-run setup if the cached session is no longer valid
      validate() {
        cy.request({ url: '/dashboard', failOnStatusCode: false }).then((res) => {
          expect(res.status).to.eq(200);
        });
      },
    }
  );
});

// ── cy.registerAndConfirm(email, password) ──────────────────────────────────
// Registers a new user through the UI (handling the bot-code CAPTCHA), then
// confirms their email directly in the DB and re-logs in so the session has
// emailConfirmed: true.  Returns after landing on /dashboard.
//
// Requires the db:confirmEmail task registered in cypress.config.js.
Cypress.Commands.add('registerAndConfirm', (email, password) => {
  cy.visit('/register');

  // Read the bot verification code from the span displayed above the input.
  // DOM: <div> <label/> <p/> <div><span class="...font-mono...">{CODE}</span></div>
  //           <input id="botCode"> </div>
  cy.get('#botCode').parent().find('span.font-mono').invoke('text').then((botCode) => {
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('input[name="confirmPassword"]').type(password);
    cy.get('#acceptTerms').check({ force: true });
    // Typing the correct code triggers the inline JS listener that enables
    // the submit button (which starts disabled).
    cy.get('#botCode').type(botCode.trim().toUpperCase());
  });

  cy.get('#submitBtn').should('not.be.disabled');
  cy.get('#submitBtn').click();
  cy.url().should('include', '/dashboard');

  // Simulate clicking the emailed verification link by updating the DB directly.
  cy.task('db:confirmEmail', email);

  // Destroy the current session (emailConfirmed: false) and re-login so the
  // new session reflects emailConfirmed: true from the DB.
  cy.visit('/logout');
  cy.url().should('include', '/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('form[action="/login"]').submit();
  cy.url().should('include', '/dashboard');
});
