'use strict';

// middleware/csrf.js
// CSRF protection via the Double Submit Cookie pattern (csrf-csrf v4).
//
// Replaces the deprecated csurf package while maintaining the same
// req.csrfToken() interface so all controllers work without changes.
//
// Required env var:
//   CSRF_SECRET — any long random string (min 32 chars recommended)
//   Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

const { doubleCsrf } = require('csrf-csrf');

const isProduction = process.env.NODE_ENV === 'production';

const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => {
    const secret = process.env.CSRF_SECRET;
    if (!secret) throw new Error('CSRF_SECRET env var is not set');
    return secret;
  },

  // Bind token to the session — prevents token reuse across sessions
  getSessionIdentifier: (req) => req.session?.id || '',

  // Use __Host- prefix in production (requires HTTPS) for extra cookie security.
  // Plain name in development to avoid issues with non-HTTPS localhost.
  cookieName: isProduction ? '__Host-csrf' : 'csrf-secret',

  cookieOptions: {
    sameSite: 'lax',   // lax allows Stripe/OAuth redirects to POST back
    path: '/',
    secure: isProduction,
    httpOnly: true,
  },

  // Accept the token from any of the locations csurf used to read from
  getCsrfTokenFromRequest: (req) =>
    req.headers['x-csrf-token'] ||
    req.headers['csrf-token'] ||
    req.headers['x-xsrf-token'] ||
    req.body?._csrf,

  size: 32,

  errorConfig: {
    statusCode: 403,
    message: 'Invalid CSRF token',
    code: 'EBADCSRFTOKEN',   // same code as csurf — errorHandler already handles it
  },
});

// Single shared middleware — used across all route files.
// Attaches req.csrfToken() shim so controllers can call it without changes.
const csrfProtection = (req, res, next) => {
  req.csrfToken = () => generateCsrfToken(req, res);
  doubleCsrfProtection(req, res, next);
};

module.exports = csrfProtection;
