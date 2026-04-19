const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

const STATIC_ASSET_PREFIXES = ['/assets/'];
const STATIC_ASSET_EXTENSIONS = /\.(?:avif|bmp|css|eot|gif|ico|jpe?g|js|json|map|mjs|otf|png|svg|ttf|txt|webmanifest|webp|woff2?|xml)$/i;

function isStaticAssetRequest(req) {
  const method = (req.method || '').toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') {
    return false;
  }

  const rawPath = req.path || req.url || '';
  const pathname = rawPath.split('?')[0];
  if (!pathname || pathname === '/') {
    return false;
  }

  return STATIC_ASSET_PREFIXES.some((prefix) => pathname.startsWith(prefix))
    || STATIC_ASSET_EXTENSIONS.test(pathname);
}

function logRateLimitHit(req, scope) {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const userId = req.session?.userId || 'guest';
  console.warn(`[RATE_LIMIT] ${scope} ${req.method} ${req.path} ip=${ip} user=${userId}`);
}

function createReadLimiter({ windowMs, max, message, scope }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message,
    handler: (req, res, _next, options) => {
      logRateLimitHit(req, scope);
      res.status(options.statusCode).send(options.message);
    }
  });
}

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  // Apply the global limiter to dynamic GET requests as well, but never to
  // static assets or CORS preflight traffic.
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS' || isStaticAssetRequest(req),
  message: 'Too many requests, please try again later.'
});

const statusReadLimiter = createReadLimiter({
  windowMs: 15 * 60 * 1000,
  max: 120,
  message: 'Too many status checks, please try again later.',
  scope: 'status-read'
});

const csrfTokenReadLimiter = createReadLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: 'Too many CSRF token requests, please try again later.',
  scope: 'csrf-token-read'
});

const botChallengeLimiter = createReadLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many verification code requests, please try again later.',
  scope: 'bot-challenge-read'
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 contact form submissions per hour
  message: 'Too many contact submissions, please try again later.'
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 payment attempts per 15 minutes
  message: 'Too many payment attempts, please try again later.'
});

const emailVerifyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 verification attempts per hour
  message: 'Too many verification attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

const deploymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 deployments per hour per user
  message: 'Too many deployments, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.session?.userId || req.userId)?.toString() || ipKeyGenerator(req) || 'anonymous'
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 8, // 8 login attempts per 15 minutes per IP
  message: 'Too many login attempts, please try again in 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false
});

const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 registration attempts per hour per IP
  message: 'Too many registration attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

const twoFALimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 TOTP attempts per 15 minutes per IP
  message: 'Too many 2FA attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  isStaticAssetRequest,
  generalLimiter,
  statusReadLimiter,
  csrfTokenReadLimiter,
  botChallengeLimiter,
  contactLimiter,
  paymentLimiter,
  emailVerifyLimiter,
  deploymentLimiter,
  loginLimiter,
  registrationLimiter,
  twoFALimiter
};
