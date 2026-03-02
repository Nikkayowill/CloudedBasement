# Operations

## Scheduled jobs

Configured in `index.js`:

- DigitalOcean sync (`syncDigitalOceanDroplets`)
- cadence: hourly
- startup delay: 30 seconds

- Subscription monitor (`monitorSubscriptions`)
- cadence: every 6 hours
- startup delay: 60 seconds

- Auto SSL provisioning (`checkAndProvisionSSL`)
- cadence: every 5 minutes
- startup delay: 2 minutes

- SSL reconciliation (`reconcileAllSSLStates`)
- cadence: every 30 minutes
- startup delay: 3 minutes

- Daily backup workflow (`runDailyBackups`)
- cadence: every 24 hours
- startup delay: 5 minutes

## Health checks

- `GET /health` validates DB connectivity and returns:
- `200 {status: "ok"}`
- `503 {status: "degraded"}` on DB failure

## Logging

- Request logging middleware: `middleware/logger.js`
- App/process logs: stdout/stderr (journalctl/systemd if deployed via systemd)
- Error tracking: Sentry if `SENTRY_DSN` is set

## Graceful shutdown

- `SIGTERM` and `SIGINT` handlers close HTTP server and PostgreSQL pool.
- `cleanupPolls()` is invoked on `SIGINT` for active polling cleanup.

## Recommended operational checks

1. Confirm `/health` status after deploy.
2. Confirm migration logs show startup success.
3. Verify webhook endpoints return 2xx for valid signatures.
4. Verify no runaway intervals or unhandled promise errors in logs.
