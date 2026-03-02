# Architecture

## Runtime model

- Single Node.js process (`index.js`) running:
- Express app/router stack.
- Background jobs via `setInterval`/`setTimeout`.
- PostgreSQL connection pool and session store.

## Main components

- `routes/` - route definitions and middleware composition.
- `controllers/` - request handlers and orchestration.
- `services/` - external integrations and background workloads.
- `middleware/` - security and cross-cutting request concerns.
- `src/utils/` - shared helpers, constants, nonce/encryption utilities.
- `migrations/` - startup migration routines.
- `react-homepage/` - React SPA build served from `react-homepage/dist`.

## Request path

1. Global middleware in `index.js`:
- general rate limiter
- request logger
- CSP nonce middleware
- Helmet
- static handlers
- cookie/body parsers
2. Webhooks are registered before `express.json()` where raw body is required.
3. Sessions and Passport are initialized.
4. Route modules are mounted.
5. 404 fallback and global error handler execute last.

## Data and state

- Primary datastore: PostgreSQL.
- Session store: `connect-pg-simple` table `session`.
- Notable entities: users, servers, payments, deployments, domains, wordpress_sites, admin update tables.

## Background jobs configured in `index.js`

- DigitalOcean sync: hourly + startup delay.
- Subscription monitor: every 6 hours + startup delay.
- Auto SSL provisioning: every 5 minutes + startup delay.
- SSL reconciliation: every 30 minutes + startup delay.
- Daily backups service: every 24 hours + startup delay.

## Integrations

- Stripe: payment flows and webhook events in `paymentController`.
- DigitalOcean: droplet lifecycle, DNS records, power actions.
- GitHub webhooks: HMAC verification and auto-deploy triggers.
- Email providers: SendGrid/Gmail OAuth/Mailtrap/SMTP fallback chain.
- Google OAuth: Passport strategy.

## Known architecture risks

- Background jobs share the web process event loop.
- Some constants in `src/utils/constants.js` are stale compared with active pricing logic in `paymentController`/`digitalocean`.
- Mixed legacy and current setup scripts exist under `scripts/`.
