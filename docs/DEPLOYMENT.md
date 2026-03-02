# Deployment Runbook

This is the canonical deployment guide for the current server architecture.

## Target stack

- Ubuntu host
- Node.js runtime
- PostgreSQL
- Nginx reverse proxy
- systemd service for the Node app

## 1. Prepare host

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git nginx postgresql postgresql-contrib
```

Install Node.js (LTS) and npm using your preferred package source.

## 2. Deploy code

```bash
cd /var/www
git clone <your-repo-url> server-ui
cd server-ui
npm install --production
```

Build frontend assets:

```bash
cd react-homepage
npm install
npm run build
cd ..
```

## 3. Configure environment

- Use `.env` or secure host-level environment variables.
- Required keys are documented in [`ENVIRONMENT.md`](./ENVIRONMENT.md).
- Never commit real production secrets.

## 4. Database setup

- Create PostgreSQL database/user with least-privilege credentials.
- Configure `DB_*` vars.
- Start app once so `runMigrations()` applies startup migrations.

## 5. systemd service

Example unit (`/etc/systemd/system/cloudedbasement.service`):

```ini
[Unit]
Description=Clouded Basement
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/server-ui
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable:

```bash
sudo systemctl daemon-reload
sudo systemctl enable cloudedbasement
sudo systemctl start cloudedbasement
```

## 6. Nginx reverse proxy

Proxy `443/80` to `localhost:3000`, and forward headers:

- `Host`
- `X-Forwarded-For`
- `X-Forwarded-Proto`

`index.js` sets `app.set('trust proxy', 1)` and enforces HTTPS in production based on forwarded proto.

## 7. Verify deployment

```bash
curl -i http://localhost:3000/health
sudo systemctl status cloudedbasement
sudo journalctl -u cloudedbasement -n 200 --no-pager
```

## 8. Stripe webhook configuration

Configure endpoint in Stripe dashboard:

- `https://<your-domain>/webhook/stripe`

Set `STRIPE_WEBHOOK_SECRET` from Stripe.

## 9. Post-deploy checklist

- Health endpoint returns HTTP 200 and DB connected.
- Homepage and dashboard load (with built `react-homepage/dist` assets).
- Login/register flows work.
- Stripe webhook signature validates.
- Background jobs start without throwing.
