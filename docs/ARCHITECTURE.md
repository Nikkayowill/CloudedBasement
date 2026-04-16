# Architecture

## Runtime model

Single Node.js process (`index.js`) running:
- Express app/router stack
- Background jobs via `setInterval`/`setTimeout`
- PostgreSQL connection pool (`pg`) and session store (`connect-pg-simple`)

## Stack

| Component | Technology |
|---|---|
| Server framework | Express 5 (CommonJS) |
| Database | PostgreSQL 14+ via `pg` pool |
| Session store | `connect-pg-simple` — sessions in the `session` table |
| React SPA | React 19 + Vite 7 + Tailwind v4, built to `react-homepage/dist/` |
| Payments | Stripe (Checkout Session + Payment Intent) |
| Cloud infra | DigitalOcean API (Droplets + DNS records) |
| Auth | Passport.js — local strategy + Google OAuth 2.0 |
| CSRF | `csrf-csrf` v4 — Double Submit Cookie pattern |
| Email | SendGrid → Gmail OAuth → Mailtrap → SMTP (first configured wins) |
| Error tracking | Sentry (`@sentry/node` + profiling integration) |

## Directory structure

```
index.js              — app entry point; middleware, routes, jobs, server start
routes/               — route definitions (auth, dashboard, servers, payments, …)
controllers/          — request handlers and orchestration logic
services/             — external integrations and background workloads
middleware/           — CSRF, rate limiting, auth guards, logger, error handler
src/utils/            — nonce, reactSPA renderer, constants, encryption helpers
migrations/           — idempotent startup migration routines (001–032)
react-homepage/       — React SPA (Vite build)
  src/pages/          — route-level page components (Dashboard, Docs, Login, …)
  src/components/     — shared UI components (ResponsiveNav, Sidebar, …)
  src/sections/       — homepage marketing sections
  src/hooks/          — custom React hooks (useSearch)
  dist/               — production build output (served by Express)
  dist-server/        — SSR build output
public/               — static assets (CSS, images, fonts)
tests/                — Cypress E2E (tests/ui) and API scaffolds (tests/api)
```

## Request path

1. Global middleware applied in `index.js`:
   - General rate limiter (`express-rate-limit`)
   - Request logger (`middleware/logger.js`)
   - CSP nonce generator (`src/utils/nonce.js`) — injects `res.locals.nonce` before Helmet
   - Helmet (CSP, HSTS, X-Frame-Options, etc.)
   - Static file handlers: `public/` and `react-homepage/dist/`
   - `cookie-parser`, `express.urlencoded`
2. Stripe and GitHub webhook endpoints registered **before** `express.json()` to preserve raw body for signature verification.
3. `express-session` + Passport initialized.
4. Route modules mounted (`routes/auth`, `routes/dashboard`, `routes/servers`, etc.).
5. 404 fallback → global error handler (`middleware/errorHandler.js`).

## React SPA

All public pages and the dashboard are served as a single React SPA built with Vite. Express serves `react-homepage/dist/index.html` for all SPA routes. React Router handles client-side routing.

- SSR prerender available via `react-homepage/dist-server/entry-server.js` (used by `src/utils/reactSPA.js`)
- Code-split per route (lazy imports) — each page loads its own JS chunk
- `App.jsx` defines all routes; `DashboardLayout.jsx` composes the dashboard shell + sidebar

## Database entities

| Table | Purpose |
|---|---|
| `users` | Accounts — email, password hash, google_id, role, plan, email_confirmed, 2FA |
| `servers` | Droplet metadata — droplet_id, ip, status, plan, ssh credentials |
| `deployments` | Git deploy records — git_url, subdomain, branch, status, output (build log), commit_sha, ai_diagnosis |
| `domains` | Custom domains — domain, ssl_enabled, auto_deploy_enabled, webhook_secret |
| `environment_variables` | Per-server env vars — key, value |
| `uptime_checks` | Per-check uptime records — target_url, status, response_ms, checked_at |
| `uptime_status` | Current uptime state per URL — last_status, down_since, alerted_down |
| `api_keys` | Scoped API keys — key_hash, key_prefix, name, scopes, last_used_at |
| `payments` | Stripe payment records |
| `wordpress_sites` | Managed WP installs |
| `session` | Express session store (connect-pg-simple) |
| `admin_audit_log` | Admin action audit trail |

## Background jobs

All jobs are started in `index.js` with a startup delay to avoid hammering external APIs on cold boot.

| Job | Function | Cadence | Startup delay |
|---|---|---|---|
| DigitalOcean sync | `syncDigitalOceanDroplets` | Hourly | 30 s |
| Subscription monitor | `monitorSubscriptions` | Every 6 h | 60 s |
| Auto SSL provisioning | `checkAndProvisionSSL` | Every 5 min | 2 min |
| SSL reconciliation | `reconcileAllSSLStates` | Every 30 min | 3 min |
| Daily backups | `runDailyBackups` | Every 24 h | 5 min |
| Uptime monitor | `checkUptimeStatus` | Every 5 min | 2 min |

## Integrations

### DigitalOcean
- Droplet create/delete/restart via `services/digitalocean.js`
- DNS A record creation for `*.cloudedbasement.ca` subdomains on every deploy
- Subdomain format: `{sanitized-repo-name}-{userId}` (lowercase, non-alphanum → dash, max 30 chars)
- Droplet metrics fetched via DO API for live CPU/Memory/Disk/Uptime tiles

### Stripe
- Checkout Session and Payment Intent for initial subscription
- Webhook events processed in `paymentController.stripeWebhook`: `payment_intent.succeeded`, `checkout.session.completed`, `customer.subscription.*`
- Raw body preserved before `express.json()` for `stripe.webhooks.constructEvent` signature check

### GitHub webhooks
- `POST /webhook/github/:serverId` — server-wide: any push to default branch redeploys all repos on that server
- `POST /webhook/github/:serverId/:domainId` — domain-scoped: redeploys only the repo linked to that domain
- Signature verified with HMAC SHA-256 (`X-Hub-Signature-256` header, secret from `servers.github_webhook_secret`)
- Push to non-default branch triggers a **preview deployment** with a distinct subdomain and `is_preview = true`
- Enable/disable via `POST /enable-auto-deploy` / `POST /disable-auto-deploy`

### Email
Provider selection in `services/email.js` — first configured wins:
1. SendGrid (`SENDGRID_API_KEY`)
2. Gmail OAuth (`GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`)
3. Mailtrap (`MAILTRAP_USER`, `MAILTRAP_PASS`)
4. Generic SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`)

Email is used for: account confirmation, password reset, support tickets, uptime down/recovery alerts, admin notifications.

### Google OAuth
- Passport `google-oauth20` strategy in `services/googleAuth.js`
- On first login: creates user with `auth_provider = 'google'`, `email_confirmed = true`
- On existing email: links `google_id` to existing account
- Requires `google_id` and `auth_provider` columns (migration `023-add-google-oauth.js`)

## Known architecture risks

- Background jobs share the web process event loop — a runaway job can affect request latency.
- Some constants in `src/utils/constants.js` are stale vs. active pricing logic in `paymentController`/`digitalocean`.
- Mixed legacy and current setup scripts exist under `scripts/`.
- SSH passwords for all servers are encrypted in the database using AES-256-GCM. The encryption key is provided by the `SSH_ENCRYPTION_KEY` environment variable (or `WP_ENCRYPTION_KEY` if shared). Credentials are encrypted before storage and decrypted on retrieval. If decryption fails, access is denied and an error is logged. This applies to both WordPress and non-WordPress servers.
