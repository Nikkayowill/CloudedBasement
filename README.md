# Clouded Basement (`server-ui`)

Clouded Basement is a Node.js/Express platform that provisions and manages DigitalOcean droplets, handles Stripe billing, and provides a dashboard for deployment, domains, SSL, and server operations.

## Quick start

1. Install dependencies:
```bash
npm install
```
2. Copy and configure environment variables:
```bash
cp .env.example .env
```
3. Build homepage assets (required for `/` and `/dashboard`):
```bash
cd react-homepage
npm install
npm run build
cd ..
```
4. Start the server:
```bash
npm run dev
```
5. Open `http://localhost:3000`.

## Core capabilities (verified in current codebase)

- Authentication: email/password auth, email confirmation, password reset, Google OAuth.
- Billing: Stripe payment intent + checkout session flows, webhook handling, plan upgrades.
- Provisioning: DigitalOcean droplet creation and lifecycle management.
- Deployments: Git deploy flow for supported repositories and project-type detection.
- WordPress: managed WordPress provisioning path and status APIs.
- Domains/SSL: custom domain tracking, SSL enablement, SSL state reconciliation jobs.
- Admin tooling: user/server management, update rollout workflows, domain CRUD.
- Security controls: Helmet CSP, CSRF, rate limiting, secure sessions, webhook signature verification.

## Important notes

- `npm test` is currently a placeholder in `package.json`.
- Automated E2E tests exist under `tests/ui` (Cypress); API tests under `tests/api` are starter scaffolds and not wired into a passing test suite.
- Background jobs are started in-process from `index.js`.

## Documentation map

- [`docs/README.md`](docs/README.md) - documentation index
- [`docs/QUICKSTART.md`](docs/QUICKSTART.md) - local developer onboarding
- [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md) - required and optional env vars
- [`docs/API-REFERENCE.md`](docs/API-REFERENCE.md) - routes and webhook endpoints
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) - system design and data flows
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) - production deployment runbook
- [`docs/SECURITY.md`](docs/SECURITY.md) - security posture and operational controls
- [`docs/TESTING.md`](docs/TESTING.md) - test strategy and current gaps
- [`docs/OPERATIONS.md`](docs/OPERATIONS.md) - background jobs and routine operations
- [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md) - common failures and remediation
- [`docs/INVENTORY.md`](docs/INVENTORY.md) - documentation inventory and relevance audit
