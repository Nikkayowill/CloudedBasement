# Environment Variables

This list is derived from `process.env.*` usage in the current codebase.

## Required for core runtime

- `SESSION_SECRET`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DIGITALOCEAN_TOKEN`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PUBLISHABLE_KEY` (required by checkout page JS in `paymentController.showCheckout`)

## Strongly recommended

- `NODE_ENV` (`development` or `production`)
- `PORT` (defaults to `3000`)
- `SENTRY_DSN` (enables Sentry initialization in `index.js`)
- `WP_ENCRYPTION_KEY` (required for WordPress credential encryption/decryption)

## Auth and identity

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

If these are missing, Google OAuth is disabled gracefully.

## Email providers

The service selects the first configured provider in this order:

1. SendGrid (`SENDGRID_API_KEY`)
2. Gmail OAuth (`GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`, `GMAIL_EMAIL`, optional `GMAIL_SMTP_PORT`)
3. Mailtrap (`MAILTRAP_USER`, `MAILTRAP_PASS`, optional `MAILTRAP_HOST`, `MAILTRAP_PORT`)
4. Generic SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`)

Additional email settings:

- `FROM_EMAIL`
- `SMTP_FROM`
- `SMTP_REPLY_TO`
- `ADMIN_EMAIL`

## Other variables referenced in code

- `DATABASE_URL` and `MONGODB_URL` appear in generated snippets in `dashboardController` and are not used as primary app connection settings.

## Security guidance

- Do not commit real keys or passwords.
- Rotate all production secrets before deployment.
- Generate `SESSION_SECRET` and `WP_ENCRYPTION_KEY` using cryptographically secure randomness.
