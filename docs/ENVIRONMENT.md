# Environment Variables

Derived from `process.env.*` usage across the codebase. Copy `.env.example` to `.env` and fill in all required values before starting the server.

---

## Required for core runtime

| Variable | Description |
|---|---|
| `SESSION_SECRET` | Secret for `express-session` cookie signing. Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `CSRF_SECRET` | Secret for `csrf-csrf` Double Submit Cookie CSRF protection. Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port (typically `5432`) |
| `DB_NAME` | PostgreSQL database name |
| `DB_USER` | PostgreSQL user |
| `DB_PASSWORD` | PostgreSQL password |
| `DIGITALOCEAN_TOKEN` | DigitalOcean personal access token — used for droplet lifecycle and DNS record management |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_live_*` in production, `sk_test_*` in dev) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key — embedded in checkout page JS |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_*`) — used by `stripe.webhooks.constructEvent` |

---

## Strongly recommended

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | Set to `production` in production. Affects cookie `secure` flag, CSP nonce behaviour, CSRF cookie name (`__Host-csrf` vs `csrf-secret`) |
| `PORT` | `3000` | HTTP listen port |
| `SENTRY_DSN` | — | Enables Sentry error tracking and profiling |
| `WP_ENCRYPTION_KEY` | — | 32-byte hex key for AES-256-GCM encryption of WordPress credentials. Required for WordPress provisioning flows. Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `APP_URL` | — | Base URL (e.g. `https://cloudedbasement.ca`). Used in email templates and OAuth callbacks |

---

## Auth and identity

| Variable | Description |
|---|---|
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 client secret |

If both are missing, Google OAuth is disabled gracefully — the strategy is never registered and the `/auth/google` route returns an error. The `google_id` and `auth_provider` columns on `users` are still required (migration `023`).

---

## Email providers

`services/email.js` selects the first fully-configured provider in this order:

### 1. SendGrid
| Variable | Description |
|---|---|
| `SENDGRID_API_KEY` | SendGrid API key (`SG.*`) |

### 2. Gmail OAuth
| Variable | Description |
|---|---|
| `GMAIL_CLIENT_ID` | Google OAuth client ID |
| `GMAIL_CLIENT_SECRET` | Google OAuth client secret |
| `GMAIL_REFRESH_TOKEN` | Long-lived refresh token |
| `GMAIL_EMAIL` | Gmail address to send from |
| `GMAIL_SMTP_PORT` | SMTP port (optional, defaults to `465`) |

### 3. Mailtrap (sandbox)
| Variable | Description |
|---|---|
| `MAILTRAP_USER` | Mailtrap SMTP username |
| `MAILTRAP_PASS` | Mailtrap SMTP password |
| `MAILTRAP_HOST` | Optional — defaults to `smtp.mailtrap.io` |
| `MAILTRAP_PORT` | Optional — defaults to `2525` |

### 4. Generic SMTP
| Variable | Description |
|---|---|
| `SMTP_HOST` | SMTP hostname |
| `SMTP_PORT` | SMTP port |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |

### Common email settings

| Variable | Description |
|---|---|
| `SMTP_FROM` | From address used in outbound mail |
| `SMTP_REPLY_TO` | Reply-to address |
| `FROM_EMAIL` | Alias for from address (fallback) |
| `ADMIN_EMAIL` | Recipient for admin/operational notifications |

---

## Other variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Not used as a primary app connection — appears in generated credential snippets shown to users in the dashboard |
| `MONGODB_URL` | Same as above |

---

## Security guidance

- Never commit `.env` to version control — it is in `.gitignore`.
- Use a separate `CSRF_SECRET` in production from the one in your local `.env`.
- Rotate all production secrets before first deployment and after any suspected compromise.
- `SESSION_SECRET` and `WP_ENCRYPTION_KEY` must be generated with cryptographically secure randomness.
- Live Stripe keys (`sk_live_*`) should only be set in production — use `sk_test_*` locally.
