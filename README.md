# Clouded Basement (`server-ui`)

Clouded Basement is a Node.js/Express platform that provisions and manages DigitalOcean droplets, handles Stripe billing, and provides a React dashboard for deployment, domains, SSL, and server operations.

## Quick start

1. Install dependencies:
```bash
npm install
```
2. Copy and configure environment variables:
```bash
cp .env.example .env
# Fill in required vars — see docs/ENVIRONMENT.md
```
3. Build the React SPA (required for `/`, `/dashboard`, and all public pages):
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

---

## Core capabilities

### Authentication
- Email/password registration with bcrypt hashing
- Email confirmation (token link + 6-digit code fallback)
- Password reset via time-limited token
- Google OAuth 2.0 via Passport.js (`google_id` + `auth_provider` columns on `users`)
- Two-factor authentication (TOTP setup and verify flows)
- Session-based auth via `express-session` + `connect-pg-simple` (PostgreSQL session store)

### Billing
- Stripe Checkout Session and Payment Intent flows
- Stripe webhook handler with raw-body signature verification (`STRIPE_WEBHOOK_SECRET`)
- Three flat-rate plans: Basic ($15/mo · 2 sites), Pro ($35/mo · 5 sites), Premium ($65/mo · 10 sites)
- Annual billing option with prorated upgrades/downgrades via `POST /upgrade-plan`
- Subscription monitor background job (every 6 hours) to reconcile payment state

### Server provisioning
- Automated DigitalOcean droplet creation on payment confirmation
- Droplet lifecycle: create → provision → running → restart → delete
- Per-user server with assigned IPv4 (and optional IPv6) address
- SSH credential generation and encrypted storage
- PostgreSQL and MongoDB optional installs with credential management
- DigitalOcean sync job (hourly) to keep server state current

### Deployments
- Deploy any public GitHub, GitLab, or Bitbucket repository via Git URL
- Auto-subdomain provisioning: `{repo-name}-{userId}.cloudedbasement.ca` (DigitalOcean DNS A record)
- Per-deployment build log stored to `deployments.output` — live-polled during deploy, persisted indefinitely
- Deployment status: `pending → deploying → success / failed`
- AI diagnosis on failed deployments (Claude API, stored in `deployments.ai_diagnosis`)
- **Rollback**: revert to any past successful deployment by commit SHA (`POST /rollback`)
- **Redeploy**: re-run any existing deployment against latest commit

### Auto-deploy (GitHub webhooks)
- Webhook endpoints: `POST /webhook/github/:serverId` and `POST /webhook/github/:serverId/:domainId`
- HMAC SHA-256 signature verification on every incoming webhook (`X-Hub-Signature-256`)
- Server-wide auto-deploy: all push events to the default branch trigger a redeploy
- Domain-specific auto-deploy: scoped to a particular domain's linked repo
- Preview deployments: pushes to non-default branches automatically deploy to a preview subdomain with a `Preview` badge
- Webhook secret generated per-server with `crypto.randomBytes(32)`, stored in `servers.github_webhook_secret`
- Enable/disable via `POST /enable-auto-deploy` and `POST /disable-auto-deploy`

### Domains and SSL
- Custom domain attachment per server (`POST /add-domain`)
- Automatic SSL via Let's Encrypt (ACME HTTP-01 challenge)
- SSL state reconciliation job (every 30 minutes) to catch drift
- Auto SSL provisioning job (every 5 minutes) for pending domains
- Domain removal with DNS cleanup

### Uptime monitoring and alerts
- Uptime monitor job runs every 5 minutes (startup delay: 2 minutes)
- Monitors all successful non-preview deployments with a subdomain and all verified custom domains with SSL
- Records every check to `uptime_checks` table (status, response_ms, error_message)
- Tracks current state in `uptime_status` table (last_status, down_since, alerted_down flag)
- **Email alert on down**: sent once when a site transitions up→down (`sendUptimeAlertEmail`)
- **Email alert on recovery**: sent when site recovers, includes total downtime in minutes
- Uptime dot in the Deployments dashboard shows live up/down status per deployment

### Environment variables
- Per-account env vars stored encrypted and injected into server `.env` on every deploy
- Full CRUD via `GET/POST/DELETE /api/env-vars`
- Values masked in the UI by default

### Dev tools
- SSH credentials (username, host, password) revealed on demand via `GET /api/credentials`
- PostgreSQL connection string, host, port, database, username, password
- MongoDB connection string, host, port, database, username, password
- Credentials never stored in browser — fetched fresh on reveal

### API keys
- Create scoped API keys for programmatic deploys (`deploy` scope) and reads (`read` scope)
- Keys stored as SHA-256 hashes; plaintext shown once at creation
- Bearer token auth: `Authorization: Bearer cbk_<key>`
- Trigger deploys via `POST /api/deploy` from CI/CD pipelines or scripts
- Key list with prefix, scopes, created date, last-used date
- Revoke via `DELETE /api/keys/:id`

### WordPress
- Managed WordPress provisioning path with status tracking
- WordPress-specific credential encryption at rest (AES-256-GCM via `WP_ENCRYPTION_KEY`)
- Credentials endpoint: `GET /wordpress/credentials/:siteId`

### Admin tooling
- User management (list, delete)
- Server management (cancel provisioning, delete, destroy droplet)
- Update rollout system: create → test → release → push → retry/archive/kill-switch
- Domain CRUD (`GET/POST/PUT/DELETE /admin/domains/*`)

### Security
- HTTP security headers via Helmet with per-request CSP nonce
- CSRF protection via `csrf-csrf` (Double Submit Cookie pattern, replaces deprecated `csurf`)
- Route-level and global rate limiting (`express-rate-limit`)
- Stripe and GitHub webhook HMAC signature verification
- PostgreSQL-backed sessions with `httpOnly`, `sameSite=lax`, `secure` in production
- Admin role validated from DB on every admin request
- Sentry error tracking (when `SENTRY_DSN` is set)

---

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20+, Express 5 |
| Database | PostgreSQL 14+ |
| Session store | `connect-pg-simple` |
| React SPA | React 19, Vite 7, Tailwind v4 |
| Payments | Stripe |
| Cloud infra | DigitalOcean (Droplets + DNS) |
| Auth | Passport.js (local + Google OAuth) |
| CSRF | `csrf-csrf` (Double Submit Cookie) |
| Email | SendGrid / Gmail OAuth / Mailtrap / SMTP |
| Error tracking | Sentry |

---

## Notes

- `npm test` is currently a placeholder in `package.json`.
- Automated E2E tests exist under `tests/ui` (Cypress); API tests under `tests/api` are starter scaffolds.
- Background jobs run in-process via `setInterval`/`setTimeout` in `index.js`.

## Documentation map

- [`docs/README.md`](docs/README.md) — documentation index
- [`docs/QUICKSTART.md`](docs/QUICKSTART.md) — local developer onboarding
- [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md) — required and optional env vars
- [`docs/API-REFERENCE.md`](docs/API-REFERENCE.md) — routes and webhook endpoints
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — system design and data flows
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — production deployment runbook
- [`docs/SECURITY.md`](docs/SECURITY.md) — security posture and operational controls
- [`docs/TESTING.md`](docs/TESTING.md) — test strategy and current gaps
- [`docs/OPERATIONS.md`](docs/OPERATIONS.md) — background jobs and routine operations
- [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md) — common failures and remediation
- [`docs/INVENTORY.md`](docs/INVENTORY.md) — documentation inventory and relevance audit
