# Troubleshooting

## App starts but `/` or `/dashboard` is blank/404

Cause:
- `react-homepage/dist` was not built.

Fix:
```bash
cd react-homepage
npm install
npm run build
cd ..
```

## CSRF token errors on form POSTs

Checks:
- Session cookie present.
- Route includes `csrf` middleware where expected.
- Frontend sends `_csrf` field/token.

## Stripe webhook signature failures

Checks:
- Request must hit `POST /webhook/stripe`.
- `STRIPE_WEBHOOK_SECRET` matches configured Stripe endpoint.
- No middleware should parse body before raw webhook handler.

## GitHub auto-deploy webhook rejected

Checks:
- Correct endpoint (`/webhook/github/:serverId` or `/webhook/github/:serverId/:domainId`).
- Signature header present and secret matches stored webhook secret.
- Event type is `push` on supported branch logic.

## Provisioning stuck in `provisioning`

Checks:
- DigitalOcean API token validity and quota/rate limits.
- Droplet exists and has IP.
- Polling logs for timeout (`max 5 minutes` in digitalocean service).

## Login/session unexpectedly expires

Checks:
- `SESSION_SECRET` is stable across restarts.
- Cookie domain/security settings match environment.
- PostgreSQL `session` table exists and is writable.

## Email not sending

Checks:
- At least one provider config is valid (SendGrid, Gmail OAuth, Mailtrap, SMTP).
- Review startup/provider logs from `services/email.js`.

## Database errors on startup

Checks:
- `DB_*` environment vars.
- PostgreSQL availability/network.
- migration logs in startup output.
