# Security

## Implemented controls

### HTTP security headers (Helmet)
- Configured in `index.js` via `helmet()`.
- **Content-Security-Policy**: per-request nonce injected by `src/utils/nonce.js` before Helmet runs. Nonce applied to inline scripts. External script sources whitelisted: `cdn.jsdelivr.net`, `js.stripe.com`, `unpkg.com`, `googletagmanager.com`.
- HSTS, X-Frame-Options, X-Content-Type-Options, and other Helmet defaults applied.

### CSRF protection (`csrf-csrf`)
- CSRF tokens are now session-bound using a session identifier (see `getSessionIdentifier`). After `req.session.regenerate()` is called on login, a new CSRF token is immediately issued for the new session. A short grace period may be implemented to accept both old and new tokens during the session transition to avoid breaking in-flight requests.
- Token accepted from: `X-CSRF-Token`, `CSRF-Token`, `X-XSRF-Token` headers, or `_csrf` body field.
- Applied to all state-changing routes (POST/PUT/DELETE) except webhook endpoints.
- React forms fetch a fresh token from `GET /api/csrf-token` on mount.

### Rate limiting (`express-rate-limit`)
- `generalLimiter`: applied to all routes globally.
- `loginLimiter`: tightened limit on `POST /login`.
- `registrationLimiter`: tightened limit on `POST /register`.
- `emailVerifyLimiter`: applied to confirm-email, resend, and password-reset flows.
- `twoFALimiter`: applied to 2FA verify routes.
- `contactLimiter`: applied to `POST /api/contact`.

### Session hardening
- Server-side sessions stored in PostgreSQL via `connect-pg-simple`.
- Cookie options: `httpOnly: true`, `sameSite: 'lax'`, `secure: true` in production.
- `req.session.regenerate()` called on successful login (session fixation protection).

### Webhook integrity
- **Stripe**: raw body preserved before `express.json()` (registered before body parsers). Verified with `stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)`.
- **GitHub**: HMAC SHA-256 signature verified on every incoming webhook using `X-Hub-Signature-256` header against the per-server `github_webhook_secret` stored in the `servers` table. Rejects requests with missing or invalid signatures.

### Access control
- `requireAuth`: checks `req.session.userId` — applied to all dashboard, account, and server routes.
- `requireAdmin`: validates `role = 'admin'` from the database on every admin request (not from session, preventing role escalation via session tampering).
- API keys (`cbk_*`): Bearer token auth for `/api/deploy` and `/api/keys`. Keys stored as SHA-256 hashes — raw value shown only once at creation.

### Password security
- bcrypt hashing in `authController` (password registration and login).
- Minimum password length: 8 characters.
- Time-limited, single-use password reset tokens.

### Credential encryption
- WordPress credentials encrypted at rest with **AES-256-GCM** using `WP_ENCRYPTION_KEY`.
- Non-WordPress SSH passwords stored in plaintext in the database (see known concerns below).

---

## Operational security requirements

- Use TLS termination at the reverse proxy (Nginx) — never expose Express directly on port 80/443.
- Rotate all secrets (`SESSION_SECRET`, `CSRF_SECRET`, `STRIPE_WEBHOOK_SECRET`, `WP_ENCRYPTION_KEY`) before production deployment.
- Restrict the PostgreSQL user to the minimum privileges needed (no `SUPERUSER`, no `CREATEDB`).
- Protect `.env` with file-system least privilege — readable only by the app user.
- Monitor Sentry and application logs for 5xx spikes, CSRF rejection bursts, and rate-limit hits.
- Webhook endpoints should be fronted by Nginx with connection limits to prevent amplification.

---

## Sensitive data handling

- Documentation and code templates must never include real API keys, passwords, or tokens.
- SSH and database credentials are only returned through authenticated API endpoints (`GET /api/credentials`, `GET /wordpress/credentials/:siteId`) after session validation.
- Deployment build logs (`deployments.output`) may contain secrets if the user's build scripts echo env vars. Sanitization exists but is not exhaustive — users should be advised not to print secrets in build output.
- `.env` is in `.gitignore`. Never commit it.

### Secret scanning

- Run `npm run check:secrets` to scan tracked files for likely hardcoded secrets.
- Run `npm run security:check` to run secret scanning plus the system audit.
- If CI is configured, add `npm run check:secrets` as a required step.

### Local git hook enforcement (Husky)

- `pre-commit` runs `pnpm run check:secrets` and blocks commits if a potential secret is detected.
- `pre-push` blocks direct pushes to `main` and `master`.
- `pre-push` also runs `pnpm run check:secrets` before allowing non-protected-branch pushes.
- `commit-msg` enforces Conventional Commits format (for example: `feat: ...`, `fix(scope): ...`).

Recommended workflow:

1. Create a feature branch.
2. Commit locally (hooks run automatically).
3. Push the feature branch.
4. Open a PR to `main`.

### Key rotation checklist

If any secret is exposed, rotate immediately in this order:

1. Stripe secret key (`STRIPE_SECRET_KEY`) in Stripe Dashboard.
2. Stripe webhook secret (`STRIPE_WEBHOOK_SECRET`) for each endpoint.
3. DigitalOcean token (`DIGITALOCEAN_TOKEN`) in DO API tokens page.
4. Session/CSRF/app secrets (`SESSION_SECRET`, `CSRF_SECRET`, other app signing keys).
5. SMTP/API provider keys.

After rotation:

1. Update environment variables in each environment (local, staging, production).
2. Restart application processes.
3. Verify webhook signature validation and payment flows.
4. Re-run `npm run check:secrets` to confirm no tracked leakage remains.

---

## Known concerns

- **Plaintext SSH passwords**: Non-WordPress server SSH passwords are stored unencrypted in the `servers` table. The WordPress path uses AES-256-GCM. A migration to encrypt all SSH credentials is the appropriate remediation.
- **In-process background jobs**: Background jobs share the web process. A job that blocks the event loop degrades request handling. No job isolation or worker thread separation is currently implemented.
- **No automated security test suite**: Cypress E2E tests cover some flows but there is no dedicated security regression suite. CSRF, auth bypass, and injection scenarios should be added.
