# Clouded Basement - AI Agent Instructions

## Project summary

Clouded Basement is an Express/PostgreSQL platform for managed server provisioning and deployment workflows on DigitalOcean, with Stripe billing and dashboard/admin tooling.

## Source-of-truth docs

- `README.md`
- `docs/README.md`
- `docs/QUICKSTART.md`
- `docs/ENVIRONMENT.md`
- `docs/API-REFERENCE.md`
- `docs/ARCHITECTURE.md`
- `docs/DEPLOYMENT.md`
- `docs/SECURITY.md`
- `docs/TESTING.md`
- `docs/OPERATIONS.md`
- `docs/TROUBLESHOOTING.md`
- `docs/INVENTORY.md`

Do not reference removed legacy docs.

## Engineering rules

1. Treat code as the final source of truth when docs conflict.
2. Never include real secrets in docs, code comments, or commits.
3. Keep middleware order in `index.js` stable unless intentionally changing security behavior.
4. Preserve webhook raw-body requirements for Stripe and GitHub endpoints.
5. Use parameterized SQL for all DB access.

## Current known implementation gaps

- `npm test` is a placeholder in `package.json`.
- Legacy `scripts/*.js` setup scripts require path cleanup before they are reliable.
- Pricing constants are duplicated; active pricing lives in payment/provisioning logic.
