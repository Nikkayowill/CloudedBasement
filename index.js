// Sentry must be initialized FIRST, before any other imports
const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

require('dotenv').config();

// Initialize Sentry
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      nodeProfilingIntegration(),
    ],
    tracesSampleRate: 1.0, // Capture 100% of transactions in production (adjust as needed)
    profilesSampleRate: 1.0, // Capture 100% of profiles
    environment: process.env.NODE_ENV || 'development',
  });
  console.log('[SENTRY] Error monitoring initialized');
}

const path = require('path');
const express = require('express');
// express-rate-limit used via middleware/rateLimiter, not directly
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const pool = require('./db');
// Helpers imported by controllers directly — not needed in index.js
const { syncDigitalOceanDroplets: syncDigitalOceanDropletsService } = require('./services/digitalocean');
const { monitorSubscriptions } = require('./services/subscriptionMonitor');
const { checkAndProvisionSSL } = require('./services/autoSSL');
const { runDailyBackups } = require('./services/dailyBackups');
const { generalLimiter } = require('./middleware/rateLimiter');
const paymentController = require('./controllers/paymentController');
const githubWebhookController = require('./controllers/githubWebhookController');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');
const { runMigrations } = require('./migrations/run-migrations');
const { passport, initializeGoogleAuth } = require('./services/googleAuth');
const { nonceMiddleware } = require('./src/utils/nonce');
const { renderReactHtml: _renderReactHtml } = require('./src/utils/reactSPA');

const app = express();

// Trust reverse proxy headers from Nginx so rate limiters and HTTPS redirects work correctly
// See: https://expressjs.com/en/guide/behind-proxies.html
app.set('trust proxy', 1);

// Apply general rate limiter to all routes
app.use(generalLimiter);

// Request logger
app.use(logger);

// Generate CSP nonce per request (must be before Helmet)
app.use(nonceMiddleware);

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`, "https://cdn.jsdelivr.net", "https://js.stripe.com", "https://unpkg.com", "https://www.googletagmanager.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      frameSrc: ["https://js.stripe.com", "https://hooks.stripe.com"],
      connectSrc: ["'self'", "https://api.stripe.com", "https://m.stripe.com", "https://r.stripe.com", "https://q.stripe.com", "https://www.google-analytics.com", "https://region1.google-analytics.com"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      scriptSrcAttr: ["'none'"],
    },
  },
}));

app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'react-homepage/dist'), { index: false }));

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// Stripe webhook endpoint must be registered BEFORE express.json()
// to preserve the raw request body for signature verification
app.post('/webhook/stripe', express.raw({type: 'application/json'}), paymentController.stripeWebhook);

// GitHub webhook endpoint - needs raw body for signature verification
// Use custom middleware to capture raw body while also parsing JSON
const githubWebhookMiddleware = express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
});

// Server-wide webhook (legacy)
app.post('/webhook/github/:serverId', githubWebhookMiddleware, githubWebhookController.githubWebhook);

// Per-domain webhook (multi-site)
app.post('/webhook/github/:serverId/:domainId', githubWebhookMiddleware, githubWebhookController.githubWebhook);

app.use(express.json()); // Parse JSON request bodies

// Session configuration
app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (reduced from 30)
    httpOnly: true, // Prevents XSS access to session cookie
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax', // CSRF protection - allows Stripe redirects
    path: '/', // Cookie available across entire site
    domain: process.env.NODE_ENV === 'production' ? 'cloudedbasement.ca' : undefined
  },
  name: 'sessionId', // Rename from default 'connect.sid' for obscurity
  rolling: true // Reset expiry on each request (sliding session)
}));

// Initialize Passport for Google OAuth
initializeGoogleAuth();
app.use(passport.initialize());
app.use(passport.session());

// HTTPS redirect middleware (only in production)
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});

// ======================
// ROUTES
// ======================

// Health check (infrastructure concern — stays here, not in a router)
app.get('/health', async (req, res) => {
  try {
    const dbCheck = await pool.query('SELECT NOW()');
    res.status(200).json({
      status: 'ok',
      database: dbCheck.rows.length > 0 ? 'connected' : 'error'
    });
  } catch (error) {
    console.error('[HEALTH] Database check failed:', error.message);
    res.status(503).json({ status: 'degraded', database: 'disconnected' });
  }
});

// SSR homepage — render React to string on the server, hydrate on the client.
// Falls back to plain SPA if the server bundle hasn't been built yet.
const SSR_BUNDLE = path.join(__dirname, 'react-homepage/dist-server/entry-server.js');

let _ssrRender; // cached once per process

async function loadSSR() {
  if (_ssrRender !== undefined) return _ssrRender;
  try {
    const mod  = await import(SSR_BUNDLE);
    _ssrRender = mod.render;
  } catch {
    console.warn('[SSR] dist-server bundle not found — serving SPA fallback');
    _ssrRender = null;
  }
  return _ssrRender;
}

function renderReactHtml(req, appHtml = null) {
  return _renderReactHtml(req.res?.locals?.nonce || '', appHtml);
}

app.get(['/', '/index.html'], async (req, res) => {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  }

  const render = await loadSSR();

  if (!render) {
    return res.send(renderReactHtml(req));
  }

  try {
    const appHtml = render(req.url);
    const html = renderReactHtml(req, appHtml);
    res.send(html);
  } catch (err) {
    console.error('[SSR] Render error — falling back to SPA:', err.message);
    res.send(renderReactHtml(req));
  }
});

// Sitemap — must come before feature routers to avoid route conflicts
app.get('/sitemap.xml', (_req, res) => {
  const base = 'https://cloudedbasement.ca';
  const today = new Date().toISOString().split('T')[0];
  const pages = [
    { loc: '/',             changefreq: 'weekly',  priority: '1.0' },
    { loc: '/pricing',      changefreq: 'monthly', priority: '0.9' },
    { loc: '/compare',      changefreq: 'monthly', priority: '0.8' },
    { loc: '/docs',         changefreq: 'weekly',  priority: '0.8' },
    { loc: '/faq',          changefreq: 'monthly', priority: '0.7' },
    { loc: '/about',        changefreq: 'monthly', priority: '0.7' },
    { loc: '/is-this-safe', changefreq: 'monthly', priority: '0.6' },
    { loc: '/contact',      changefreq: 'yearly',  priority: '0.5' },
    { loc: '/terms',        changefreq: 'yearly',  priority: '0.3' },
    { loc: '/privacy',      changefreq: 'yearly',  priority: '0.3' },
  ];
  const urls = pages.map(p => `
  <url>
    <loc>${base}${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('');
  res.header('Content-Type', 'application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`);
});

// Feature routers
app.use(require('./routes/pages'));
app.use(require('./routes/auth'));
app.use(require('./routes/dashboard'));
app.use(require('./routes/servers'));
app.use(require('./routes/payments'));
app.use(require('./routes/wordpress'));
app.use(require('./routes/onboarding'));
app.use(require('./routes/gettingStarted'));
app.use('/admin', require('./routes/admin'));

// 404 error page - must be last route
app.use((req, res) => {
  res.status(404).send(`
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Page Not Found</title>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { background: #0a0812; color: #e0e6f0; font-family: 'JetBrains Mono', monospace; --glow: #88FE00; }
        body { display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
        .container { text-align: center; max-width: 500px; }
        h1 { font-size: 120px; color: var(--glow); text-shadow: 0 0 40px rgba(136, 254, 0, 0.5); margin-bottom: 20px; }
        h2 { font-size: 24px; margin-bottom: 16px; }
        p { color: #8892a0; line-height: 1.6; margin-bottom: 32px; }
        a { display: inline-block; padding: 14px 32px; background: var(--glow); color: #0a0812; text-decoration: none; border-radius: 4px; font-weight: 600; transition: all 0.3s; }
        a:hover { box-shadow: 0 0 30px rgba(136, 254, 0, 0.6); transform: translateY(-2px); }
    </style>
</head>
<body>
    <div class="container">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist or has been moved. Let's get you back on track.</p>
        <a href="/">Go Home</a>
    </div>
</body>
</html>
  `);
});

// Run sync every hour (3600000 ms)
setInterval(syncDigitalOceanDropletsService, 3600000);

// Run sync on startup (after 30 seconds to let server initialize)
setTimeout(syncDigitalOceanDropletsService, 30000);

// Monitor subscriptions every 6 hours (check for expired trials and failed payments)
setInterval(monitorSubscriptions, 6 * 60 * 60 * 1000);

// Run subscription monitor on startup (after 60 seconds)
setTimeout(monitorSubscriptions, 60000);

// Auto-SSL: Check every 5 minutes for domains ready for SSL
setInterval(checkAndProvisionSSL, 5 * 60 * 1000);

// Run auto-SSL check on startup (after 2 minutes to let server initialize)
setTimeout(checkAndProvisionSSL, 2 * 60 * 1000);

// SSL Verification: Reconcile SSL states every 30 minutes
const { reconcileAllSSLStates } = require('./services/sslVerification');
setInterval(reconcileAllSSLStates, 30 * 60 * 1000);

// Run SSL verification on startup (after 3 minutes)
setTimeout(reconcileAllSSLStates, 3 * 60 * 1000);

// Daily backups: Snapshot Premium droplets every 24 hours
setInterval(runDailyBackups, 24 * 60 * 60 * 1000);

// Run daily backup check on startup (after 5 minutes)
setTimeout(runDailyBackups, 5 * 60 * 1000);

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Run database migrations before starting server
runMigrations().then(() => {
  const server = app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));

  // Graceful shutdown handler to cleanup polling intervals
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close(() => {
      console.log('HTTP server closed');
      pool.end(() => {
        console.log('Database pool closed');
        process.exit(0);
      });
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    
    // Cleanup polling intervals
    const { cleanupPolls } = require('./services/digitalocean');
    cleanupPolls();
    
    server.close(() => {
      console.log('HTTP server closed');
      pool.end(() => {
        console.log('Database pool closed');
        process.exit(0);
      });
    });
  });
}).catch(error => {
  console.error('Failed to run migrations:', error);
  process.exit(1);
});
