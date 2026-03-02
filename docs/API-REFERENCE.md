# API Reference

This reference is generated from `index.js` and files in `routes/`.

## Infrastructure and webhooks

- `GET /health` - DB health probe.
- `POST /webhook/stripe` - Stripe webhook endpoint (raw body required).
- `POST /webhook/github/:serverId` - GitHub webhook (server-wide auto-deploy).
- `POST /webhook/github/:serverId/:domainId` - GitHub webhook (domain-specific auto-deploy).

## Public pages

- `GET /` - serves `react-homepage/dist/index.html` for guests, redirects logged-in users to `/dashboard`.
- `GET /about`
- `GET /is-this-safe`
- `GET /compare`
- `GET /pricing`
- `GET /terms`
- `GET /privacy`
- `GET /faq`
- `GET /docs`
- `GET /contact`
- `POST /contact`

## Auth

- `GET /register`
- `POST /register`
- `GET /login`
- `POST /login`
- `GET /logout`
- `GET /auth/google`
- `GET /auth/google/callback`
- `GET /confirm-email/:token`
- `GET /verify-email`
- `POST /verify-email`
- `POST /resend-code`
- `GET /resend-confirmation`
- `GET /forgot-password`
- `POST /forgot-password`
- `GET /reset-password/:token`
- `POST /reset-password/:token`

## Dashboard and account

- `GET /dashboard`
- `GET /old-dashboard`
- `POST /submit-ticket`
- `POST /change-password`
- `POST /apply-updates`
- `POST /dashboard/dismiss-next-steps`
- `GET /getting-started`
- `POST /resend-confirmation` (from `routes/gettingStarted.js`)

### Dashboard APIs

- `GET /api/dashboard`
- `GET /api/credentials`
- `GET /api/env-vars`
- `POST /api/env-vars`
- `DELETE /api/env-vars/:id`
- `GET /api/deployment-status/:id`

## Payments and billing

- `GET /pay`
- `GET /payment-success`
- `GET /payment-cancel`
- `POST /create-payment-intent`
- `POST /create-checkout-session`
- `POST /upgrade-plan`

## Provisioning and server management

- `POST /server-action`
- `POST /delete-server`
- `POST /deploy`
- `POST /delete-deployment`
- `POST /add-domain`
- `POST /delete-domain`
- `POST /enable-ssl`
- `POST /enable-auto-deploy`
- `POST /disable-auto-deploy`
- `POST /enable-domain-autodeploy`
- `POST /disable-domain-autodeploy`
- `POST /setup-database`
- `POST /request-server`
- `POST /start-trial`

## Onboarding

- `GET /onboarding/choose`
- `POST /onboarding/provision-nodejs`

## WordPress

- `POST /wordpress/create`
- `GET /wordpress/status/:siteId`
- `GET /wordpress/credentials/:siteId`

## Admin (`/admin/*`)

Guarded by `requireAuth` + `requireAdmin`.

- `GET /admin/`
- `POST /admin/delete-user/:id`
- `POST /admin/cancel-provisioning/:id`
- `POST /admin/delete-server/:id`
- `POST /admin/destroy-droplet/:id`
- `GET /admin/updates`
- `GET /admin/updates/:id`
- `POST /admin/updates/create`
- `POST /admin/updates/kill-switch`
- `POST /admin/updates/:id/test`
- `POST /admin/updates/:id/release`
- `POST /admin/updates/:id/push`
- `POST /admin/updates/:id/retry`
- `POST /admin/updates/:id/archive`
- `POST /admin/updates/:id/delete`
- `GET /admin/domains/list`
- `POST /admin/domains`
- `PUT /admin/domains/:id`
- `DELETE /admin/domains/:id`

## Middleware behavior summary

- CSRF is applied to most state-changing routes via shared `middleware/csrf.js`.
- Route-level rate limiting is configured in `middleware/rateLimiter.js`.
- Session-auth guards: `requireAuth`.
- Admin guard: `requireAdmin` (database role check on every request).
