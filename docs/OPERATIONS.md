# Operations

## Background jobs

All jobs are started in `index.js` using `setInterval`. Each has a startup delay to avoid hammering external APIs on cold boot.

### DigitalOcean sync (`syncDigitalOceanDroplets`)
- **Cadence**: every 60 minutes
- **Startup delay**: 30 seconds
- **What it does**: Queries the DigitalOcean API for all droplets associated with the account. Reconciles `servers` table status, IP addresses, and droplet IDs against live state. Marks servers as offline if their droplet no longer exists.

### Subscription monitor (`monitorSubscriptions`)
- **Cadence**: every 6 hours
- **Startup delay**: 60 seconds
- **What it does**: Checks Stripe subscription status for all paying users. Cancels or flags servers for users whose subscriptions have lapsed, expired, or been cancelled in Stripe but not yet reflected locally.

### Auto SSL provisioning (`checkAndProvisionSSL`)
- **Cadence**: every 5 minutes
- **Startup delay**: 2 minutes
- **What it does**: Scans `domains` table for entries with `ssl_enabled = false`. For each, attempts Let's Encrypt HTTP-01 ACME challenge. On success, sets `ssl_enabled = true` and records the certificate. Skips domains whose DNS A record doesn't resolve to the server IP.

### SSL reconciliation (`reconcileAllSSLStates`)
- **Cadence**: every 30 minutes
- **Startup delay**: 3 minutes
- **What it does**: Cross-checks SSL certificate state on the server against `domains.ssl_enabled` in the database. Corrects drift where SSL is active on the server but not reflected in the DB (or vice versa).

### Daily backups (`runDailyBackups`)
- **Cadence**: every 24 hours
- **Startup delay**: 5 minutes
- **What it does**: Triggers backup procedures for user databases and configuration. Exact scope defined in `services/dailyBackups.js`.

### Uptime monitor (`checkUptimeStatus`)
- **Cadence**: every 5 minutes
- **Startup delay**: 2 minutes
- **What it does**:
  1. Queries all successful non-preview deployments with a subdomain, plus all verified custom domains with SSL enabled.
  2. Issues an HTTP request to each target URL.
  3. Records the result (`up` / `down`, response time, error message) to the `uptime_checks` table.
  4. Updates current state in the `uptime_status` table.
  5. **On up→down transition**: sends a downtime alert email to the account owner via `sendUptimeAlertEmail`. Sets `alerted_down = true`.
  6. **On down→up recovery**: sends a recovery email including total downtime in minutes (only if a downtime alert was previously sent). Resets `alerted_down`.
  - Email provider: uses the same `services/email.js` chain (SendGrid → Gmail OAuth → Mailtrap → SMTP).

---

## Health checks

- `GET /health` validates DB connectivity:
  - `200 { status: "ok" }` — DB reachable
  - `503 { status: "degraded" }` — DB query failed

Use this endpoint in Nginx upstream checks, load balancer health probes, or uptime monitors.

---

## Logging

- **Request log**: `middleware/logger.js` — logs method, path, status, duration, and auth state to stdout.
- **App/process logs**: stdout/stderr — captured by systemd (`journalctl -u server-ui -f`) in production.
- **Error tracking**: Sentry (`@sentry/node`) initialized in `index.js` if `SENTRY_DSN` is set. Captures unhandled errors with stack traces, environment tag, and profiling data.

---

## Graceful shutdown

- `SIGTERM` and `SIGINT` handlers close the HTTP server and PostgreSQL pool.
- `cleanupPolls()` is now invoked on both `SIGINT` and `SIGTERM` to stop any active server-polling loops before shutdown. See the shutdown handlers and `cleanupPolls()` implementation for details.

---

## Recommended checks after deploy

1. Confirm `GET /health` returns `200`.
2. Confirm startup migration logs show success (no `[MIGRATION] Error` lines).
3. Confirm background job startup lines appear in logs (`[SYNC]`, `[UPTIME]`, etc.).
4. Send a test webhook and verify `2xx` response with valid signature.
5. Check Sentry for any new unhandled errors.
6. Verify no runaway `setInterval` calls or unhandled promise rejections in logs.
