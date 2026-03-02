# Quickstart

## Prerequisites

- Node.js 20+ recommended
- npm
- PostgreSQL 14+
- A configured `.env` file (see [`ENVIRONMENT.md`](./ENVIRONMENT.md))

## Local setup

1. Install root dependencies:
```bash
npm install
```
2. Install and build React homepage assets (served by Express from `react-homepage/dist`):
```bash
cd react-homepage
npm install
npm run build
cd ..
```
3. Create `.env` from template:
```bash
cp .env.example .env
```
4. Start the server:
```bash
npm run dev
```
5. Open `http://localhost:3000`.

## Initial database notes

- The app uses PostgreSQL for application data and session storage.
- `index.js` calls `runMigrations()` at startup. Missing columns/tables are added by migration scripts.
- Legacy setup scripts under `scripts/` exist but currently contain path issues (`require('./db')` from `scripts/`), so migrations-on-startup are the supported path.

## Development workflow

- Backend entrypoint: `index.js`
- Route modules: `routes/`
- Controllers: `controllers/`
- Services/integrations: `services/`
- Utilities/constants: `src/utils/`
- Frontend source: `react-homepage/src/`

## Frontend development

For iterative UI work:

```bash
cd react-homepage
npm run dev
```

When testing integrated Express behavior, rebuild homepage assets:

```bash
cd react-homepage
npm run build
cd ..
```
