# Documentation Inventory and Audit

Audit date: 2026-03-02  
Method: file inventory + code cross-check against `index.js`, `routes/`, `controllers/`, `services/`, `.env.example`, and startup scripts.

## Current canonical documentation set

| File | Purpose | Last Updated | Relevance |
|---|---|---|---|
| `README.md` | Project overview and entrypoint to docs | 2026-03-02 | High |
| `docs/README.md` | Documentation index | 2026-03-02 | High |
| `docs/QUICKSTART.md` | Local onboarding flow | 2026-03-02 | High |
| `docs/ENVIRONMENT.md` | Env var reference from code usage | 2026-03-02 | High |
| `docs/API-REFERENCE.md` | Route and webhook reference | 2026-03-02 | High |
| `docs/ARCHITECTURE.md` | Architecture and runtime behavior | 2026-03-02 | High |
| `docs/DEPLOYMENT.md` | Production deployment runbook | 2026-03-02 | High |
| `docs/SECURITY.md` | Security posture and controls | 2026-03-02 | High |
| `docs/TESTING.md` | Test workflow and testing gaps | 2026-03-02 | High |
| `docs/OPERATIONS.md` | Background jobs and operations | 2026-03-02 | High |
| `docs/TROUBLESHOOTING.md` | Incident/debug quick references | 2026-03-02 | High |
| `docs/INVENTORY.md` | Audit trail and maintenance baseline | 2026-03-02 | High |

## In-code documentation inventory

| File/Area | Type | Last Reviewed | Relevance |
|---|---|---|---|
| `index.js` | Inline architecture and middleware-order comments | 2026-03-02 | High |
| `services/wordpress.js` | Extensive JSDoc for provisioning pipeline and security handling | 2026-03-02 | High |
| `src/utils/encryption.js` | JSDoc describing AES-GCM key/IV/tag model | 2026-03-02 | High |
| `src/utils/db-helpers.js` | Helper docs for common DB operations | 2026-03-02 | Medium |
| `cypress.config.js` + `tests/ui/*.cy.js` | Test-flow and task behavior comments | 2026-03-02 | Medium |
| `controllers/pages/docsController.js` | User-facing in-app documentation page content | 2026-03-02 | High |

## Legacy files removed during overhaul

The following files were removed because they were redundant, outdated, historical, or unsafe (contained secrets/credentials):

- `DEPLOYMENT.md` (root duplicate was replaced with a pointer to `docs/DEPLOYMENT.md`)
- `PRE-LAUNCH-CHECKLIST.md`
- `SESSION-HANDOFF-FEB9.md`
- `docs/DATABASE-BACKUPS.md`
- `docs/DATABASE-SETUP.md`
- `docs/DEV-CHEATSHEET.md`
- `docs/ENHANCEMENT-ROADMAP.md`
- `docs/FLOWBITE-COMPONENTS.md`
- `docs/MODULARIZATION-ANALYSIS.md`
- `docs/password for Web Application server.md` (sensitive credential exposure)
- `docs/PAYMENT-DEBUGGING.md`
- `docs/PRODUCTION-SECURITY.md`
- `docs/REFACTORING.md`
- `docs/REVENUE-STREAMS.md`
- `docs/SECURITY-AUDIT-FEB2026.md`
- `docs/SECURITY-AUDIT-READINESS.md`
- `docs/STRIPE-WEBHOOKS.md`
- `docs/TECHNICAL-DOCUMENTATION.md`
- `docs/TESTING-GUIDE.md`
- `docs/concepts/*` (educational references, not source-of-truth implementation docs)

## Flagged items requiring follow-up (code-level)

1. `src/utils/constants.js` pricing values are inconsistent with active pricing in `controllers/paymentController.js` and `services/digitalocean.js`.
2. `scripts/setup-db.js`, `scripts/setup-session.js`, and `scripts/set-admin.js` import `./db` from within `scripts/` and are likely non-functional without path fixes.
3. `package.json` still has placeholder `npm test`.

## Documentation maintenance plan

1. Update `docs/API-REFERENCE.md` whenever a route file changes.
2. Update `docs/ENVIRONMENT.md` whenever new `process.env.*` keys are introduced.
3. Re-run this inventory after major refactors and before production releases.
4. Keep in-app `/docs` page aligned with markdown index links and feature scope.
