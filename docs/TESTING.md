# Testing

## Current state

- `package.json` has `"test": "echo \"Error: no test specified\" && exit 1"`.
- Cypress E2E specs live under `tests/ui`.
- API tests under `tests/api` are Jest/Supertest examples and are not currently wired into a runnable pipeline.

## E2E (Cypress)

Run all UI specs:

```bash
npx cypress run --spec "tests/ui/**/*.cy.js"
```

Open interactive runner:

```bash
npx cypress open
```

Cypress tasks in `cypress.config.js` directly manipulate database records for flow setup/cleanup.

## Recommended pre-release checks

1. Auth journey:
- register
- confirm email
- login/logout
- forgot/reset password
2. Billing journey:
- create payment intent
- checkout/session flow
- webhook handling in test mode
3. Provisioning and deployment:
- start trial
- server request/provisioning transitions
- deploy and delete deployment
4. Domain/SSL:
- add domain
- SSL enable path
- auto-deploy webhook signature path
5. Admin routes:
- access control
- update workflow actions
- domain API CRUD

## Gaps

- No CI-enforced automated unit/integration suite.
- API tests reference endpoints that do not match current routing (`/api/provision` example).
- No smoke test command is wired into npm scripts.
