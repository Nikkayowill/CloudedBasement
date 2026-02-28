const csrf = require('csurf');

// Single shared CSRF instance — cookie-based, used across all route files.
// Import this instead of calling csrf() again in each router.
const csrfProtection = csrf({ cookie: true });

module.exports = csrfProtection;
