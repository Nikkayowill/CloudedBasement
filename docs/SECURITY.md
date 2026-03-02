# Security

## Implemented controls

- HTTP security headers via Helmet with CSP configured in `index.js`.
- CSRF protection via `csurf` middleware on protected form routes.
- Rate limiting:
- global non-GET limiter
- auth/payment/contact/deployment-specific limiters
- Session hardening:
- server-side sessions in PostgreSQL
- `httpOnly` cookie
- `sameSite=lax`
- `secure` in production
- Webhook integrity:
- Stripe signature verification with raw request body
- GitHub HMAC signature verification
- Access control:
- `requireAuth` checks session
- `requireAdmin` validates role from DB on each admin request
- Password security:
- bcrypt hashing in auth flow
- WordPress credentials encrypted at rest with AES-256-GCM (`WP_ENCRYPTION_KEY`)

## Operational security requirements

- Use TLS termination at reverse proxy.
- Rotate all secrets before production deployment.
- Restrict DB user privileges.
- Protect `.env`/host secret store with least privilege.
- Monitor logs and Sentry if enabled.

## Sensitive data handling

- Documentation and templates must never include real API keys/passwords.
- SSH/database credentials should only be exposed through authenticated flows.
- Deployment logs should be reviewed for secret leakage (sanitization exists but is not absolute).

## Known concerns to track

- `csurf` is deprecated upstream; migration plan should be maintained.
- Some legacy docs/scripts previously exposed sensitive values; this documentation set removes those references.
- Plaintext SSH credentials are stored for non-WordPress server flows; WordPress path uses encrypted credentials.
