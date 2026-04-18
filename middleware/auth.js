const pool = require('../db');
const { hasRole, hasPermission, normalizeRole } = require('../src/utils/rbac');

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    if (isApiRequest(req)) {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    res.redirect('/login?warning=Please login to continue');
  }
}

async function getUserRoleFromDb(userId) {
  const result = await pool.query(
    'SELECT role FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return normalizeRole(result.rows[0].role);
}

async function getRoleForRequest(req) {
  if (req.currentUserRole) {
    return req.currentUserRole;
  }

  const actualRole = await getUserRoleFromDb(req.session.userId);
  if (!actualRole) {
    return null;
  }

  req.currentUserRole = actualRole;
  req.session.userRole = actualRole;
  return actualRole;
}

function isApiRequest(req) {
  const acceptsJson = req.headers['accept']?.includes('application/json');
  const isApiPath = req.path.startsWith('/api') || req.path === '/create-payment-intent' || req.xhr;
  return acceptsJson || isApiPath;
}

function destroySessionAndRedirect(req, res, location) {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err);
    }
    return res.redirect(location);
  });
}

function denyRoleAccess(req, res, denyMessage, redirectPath) {
  if (isApiRequest(req)) {
    return res.status(403).json({ error: denyMessage });
  }

  return res.redirect(`${redirectPath}?error=${encodeURIComponent(denyMessage)}`);
}

function requireRole(allowedRoles, options = {}) {
  const {
    denyMessage = 'Access denied',
    denyRedirect = '/dashboard'
  } = options;

  return async (req, res, next) => {
    if (!req.session.userId) {
      return denyRoleAccess(req, res, denyMessage, denyRedirect);
    }

    try {
      const actualRole = await getRoleForRequest(req);

      if (!actualRole) {
        return destroySessionAndRedirect(req, res, '/login?error=Session invalid');
      }

      if (!hasRole(actualRole, allowedRoles)) {
        return denyRoleAccess(req, res, denyMessage, denyRedirect);
      }

      return next();
    } catch (error) {
      console.error('Role auth error:', error);
      return res.status(500).send('Authentication error');
    }
  };
}

function requirePermission(permission, options = {}) {
  const {
    denyMessage = 'Permission denied',
    denyRedirect = '/dashboard'
  } = options;

  return async (req, res, next) => {
    if (!req.session.userId) {
      return denyRoleAccess(req, res, denyMessage, denyRedirect);
    }

    try {
      const actualRole = await getRoleForRequest(req);

      if (!actualRole) {
        return destroySessionAndRedirect(req, res, '/login?error=Session invalid');
      }

      if (!hasPermission(actualRole, permission)) {
        return denyRoleAccess(req, res, denyMessage, denyRedirect);
      }

      return next();
    } catch (error) {
      console.error('Permission auth error:', error);
      return res.status(500).send('Authentication error');
    }
  };
}

// Admin-only guard (always checks database for security)
const requireAdmin = requireRole(['admin'], {
  denyMessage: 'Admin access required',
  denyRedirect: '/dashboard'
});

module.exports = { requireAuth, requireAdmin, requireRole, requirePermission };
