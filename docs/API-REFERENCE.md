# API Reference

Routes derived from `index.js`, files in `routes/`, and controllers. All state-changing routes require CSRF unless noted.

---

## Infrastructure and webhooks

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | none | DB health probe — `200 {status:"ok"}` or `503 {status:"degraded"}` |
| POST | `/webhook/stripe` | Stripe sig | Stripe webhook — raw body, `stripe.webhooks.constructEvent` verification |
| POST | `/webhook/github/:serverId` | HMAC sig | GitHub webhook — server-wide auto-deploy on push to default branch |
| POST | `/webhook/github/:serverId/:domainId` | HMAC sig | GitHub webhook — domain-scoped auto-deploy |

Webhook authentication is signature-based, not session-based. Stripe uses `STRIPE_WEBHOOK_SECRET`; GitHub uses a per-server secret stored in `servers.github_webhook_secret` (HMAC SHA-256, `X-Hub-Signature-256` header).

---

## Public pages (React SPA)

All routes below serve `react-homepage/dist/index.html` — React Router handles client-side routing.

- `GET /` — homepage (or redirect to `/dashboard` if logged in)
- `GET /about`
- `GET /compare`
- `GET /contact`
- `GET /docs`
- `GET /faq`
- `GET /is-this-safe`
- `GET /pricing`
- `GET /privacy`
- `GET /terms`

### Contact form API

- `GET /api/csrf-token` — returns `{ csrfToken }` for React form submissions
- `POST /api/contact` — contact form submission (rate limited, validated)
- `GET /api/pricing/status` — returns login/trial state for the Pricing page banner

---

## Auth

| Method | Path | Notes |
|---|---|---|
| GET | `/register` | serves React SPA |
| POST | `/register` | email + password, rate limited, CSRF |
| GET | `/login` | serves React SPA |
| POST | `/login` | email + password, rate limited, CSRF |
| GET | `/logout` | clears session |
| POST | `/logout` | clears session (CSRF) |
| GET | `/auth/google` | begins Google OAuth flow |
| GET | `/auth/google/callback` | OAuth callback — sets session, redirects to `/dashboard` |
| GET | `/confirm-email/:token` | email token confirmation |
| GET | `/verify-email` | 6-digit code form |
| POST | `/verify-email` | submits 6-digit code |
| POST | `/resend-code` | re-sends 6-digit code |
| GET | `/resend-confirmation` | re-sends confirmation email link |
| GET | `/forgot-password` | password reset form |
| POST | `/forgot-password` | sends reset email |
| GET | `/reset-password/:token` | new password form |
| POST | `/reset-password/:token` | saves new password |
| GET | `/auth/2fa/prompt` | 2FA verify-on-login form |
| POST | `/auth/2fa/verify-login` | verifies TOTP on login |
| GET | `/auth/2fa/setup` | 2FA setup (requires auth) |
| POST | `/auth/2fa/verify` | saves 2FA setup |
| POST | `/auth/2fa/disable` | disables 2FA |

### Auth status API

- `GET /api/auth/status` — returns `{ loggedIn: true|false }` based on session. Used by `ResponsiveNav` to show Dashboard vs Sign in buttons.
- `GET /api/auth/bot-challenge` — returns `{ botCode }` for the register page human-check field.

---

## Dashboard and account

| Method | Path | Notes |
|---|---|---|
| GET | `/dashboard` | serves React SPA (requireAuth) |
| GET | `/old-dashboard` | legacy Express-rendered dashboard |
| GET | `/getting-started` | onboarding page (requireAuth) |
| POST | `/resend-confirmation` | re-sends confirmation email (requireAuth, CSRF) |
| POST | `/submit-ticket` | support ticket submission (requireAuth) |
| POST | `/change-password` | returns JSON `{ success, message }` (requireAuth) |
| POST | `/apply-updates` | triggers server update push (requireAuth) |
| POST | `/dashboard/dismiss-next-steps` | dismisses getting-started card (requireAuth) |

### Dashboard APIs

| Method | Path | Description |
|---|---|---|
| GET | `/api/dashboard` | Full dashboard data object — server, deployments, domains, plan, env summary, uptime status, api keys |
| GET | `/api/metrics` | Live server metrics: `{ available, cpu, memory, disk, uptime }` — polled every 30s by Overview |
| GET | `/api/credentials` | SSH + database credentials (requireAuth) — `?type=all` returns ssh, postgres, mongodb |
| GET | `/api/env-vars` | Lists environment variables for the user's server |
| POST | `/api/env-vars` | Creates or updates an env var — body: `{ key, value }` |
| DELETE | `/api/env-vars/:id` | Deletes an env var |
| GET | `/api/deployment-status/:id` | Deployment output + status — polled live during deploy by build log |

---

## API key management

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/keys` | session | Lists all API keys for the user (metadata only — no raw key) |
| POST | `/api/keys` | session + CSRF | Creates a new API key — body: `{ name, scopes[] }`. Returns `{ key: "cbk_..." }` once |
| DELETE | `/api/keys/:id` | session + CSRF | Revokes an API key immediately |
| POST | `/api/keys/:id/rotate` | session + CSRF | Rotates an active API key in place. Returns new raw key once and invalidates old secret immediately |

### Programmatic deploy endpoint

```
POST /api/deploy
Authorization: Bearer cbk_<your_key>
Content-Type: application/json

{ "git_url": "https://github.com/user/repo" }
```

Requires a key with `deploy` scope. Triggers the same pipeline as the dashboard deploy form.

---

## Payments and billing

| Method | Path | Notes |
|---|---|---|
| GET | `/pay` | Checkout/pricing page |
| GET | `/payment-success` | Post-payment success redirect |
| GET | `/payment-cancel` | Post-payment cancel redirect |
| POST | `/create-payment-intent` | Creates Stripe PaymentIntent, returns `clientSecret` |
| POST | `/create-checkout-session` | Creates Stripe Checkout Session, returns `url` |
| POST | `/upgrade-plan` | Upgrades or downgrades plan with Stripe proration — body: `{ plan }` |
| GET | `/api/billing/usage` | Returns billing snapshot for dashboard: current plan/status, total paid, monthly totals, recent payments |

---

## Provisioning and server management

| Method | Path | Description |
|---|---|---|
| POST | `/server-action` | Server actions — body: `{ action: "restart" }` |
| POST | `/delete-server` | Cancels plan and destroys droplet (destructive, confirmed in UI) |
| POST | `/deploy` | Deploys a Git repo — body: `{ git_url }`. Creates subdomain, DNS record, runs build pipeline |
| POST | `/rollback` | Rolls back to a previous deployment — body: `{ deploymentId }`. Re-deploys the exact `commit_sha` |
| POST | `/delete-deployment` | Deletes a deployment — body: `{ deploymentId }` |
| POST | `/add-domain` | Adds a custom domain — body: `{ domain }` |
| POST | `/delete-domain` | Removes a domain — body: `{ domain_id }` |
| POST | `/enable-ssl` | Triggers Let's Encrypt cert provisioning for a domain |
| POST | `/enable-auto-deploy` | Generates webhook secret, enables auto-deploy for the server |
| POST | `/disable-auto-deploy` | Disables server-wide auto-deploy |
| POST | `/enable-domain-autodeploy` | Enables auto-deploy for a specific domain |
| POST | `/disable-domain-autodeploy` | Disables domain-scoped auto-deploy |
| POST | `/setup-database` | Installs PostgreSQL or MongoDB on the server |
| POST | `/request-server` | Requests manual server provisioning |
| POST | `/start-trial` | Starts a free trial |

---

## Onboarding

- `GET /onboarding/choose` — choose server type (Node.js / WordPress)
- `POST /onboarding/provision-nodejs` — begins Node.js server provisioning

---

## WordPress

- `POST /wordpress/create` — provisions a managed WordPress site
- `GET /wordpress/status/:siteId` — returns provisioning status
- `GET /wordpress/credentials/:siteId` — returns decrypted WP credentials (AES-256-GCM)

---

## Admin (`/admin/*`)

All routes require `requireAuth` + `requireAdmin` (role validated from DB on every request).

| Method | Path | Description |
|---|---|---|
| GET | `/admin/` | Admin dashboard |
| POST | `/admin/delete-user/:id` | Deletes a user account |
| POST | `/admin/cancel-provisioning/:id` | Cancels an in-progress provisioning |
| POST | `/admin/delete-server/:id` | Deletes a server record |
| POST | `/admin/destroy-droplet/:id` | Destroys the DigitalOcean droplet |
| GET | `/admin/updates` | Lists server update jobs |
| GET | `/admin/updates/:id` | Update job detail |
| POST | `/admin/updates/create` | Creates a new update job |
| POST | `/admin/updates/kill-switch` | Emergency kill switch for active rollout |
| POST | `/admin/updates/:id/test` | Runs update on test server |
| POST | `/admin/updates/:id/release` | Releases update to production |
| POST | `/admin/updates/:id/push` | Pushes update to all servers |
| POST | `/admin/updates/:id/retry` | Retries a failed update |
| POST | `/admin/updates/:id/archive` | Archives an update job |
| POST | `/admin/updates/:id/delete` | Deletes an update job |
| GET | `/admin/domains/list` | Lists all domains |
| POST | `/admin/domains` | Creates a domain record |
| PUT | `/admin/domains/:id` | Updates a domain record |
| DELETE | `/admin/domains/:id` | Deletes a domain record |
| GET | `/admin/audit-log/data` | Paginated admin audit events — query: `limit`, `offset` |

---

## Middleware summary

| Middleware | Applied to |
|---|---|
| `requireAuth` | All dashboard, server, account, API routes |
| `requireAdmin` | All `/admin/*` routes |
| `csrf` | All state-changing routes (POST/PUT/DELETE) except webhooks and endpoints authenticated via API keys (Bearer token) — excludes API key management routes |
|        | **Note:** API key management routes (e.g., `POST /api/keys`, `DELETE /api/keys/:id`) require session authentication and CSRF protection. Endpoints authenticated via API keys (e.g., `POST /api/deploy`) are exempt from CSRF. |
| `generalLimiter` | All routes |
| `loginLimiter` | `POST /login` |
| `registrationLimiter` | `POST /register` |
| `emailVerifyLimiter` | Confirm email, resend, forgot/reset password routes |
| `twoFALimiter` | 2FA verify routes |
| `contactLimiter` | `POST /api/contact` |
