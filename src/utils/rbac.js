const ROLE_USER = 'user';
const ROLE_ADMIN = 'admin';

const PERMISSIONS = {
  DASHBOARD_READ: 'dashboard:read',
  SERVER_MANAGE_SELF: 'server:manage:self',
  DOMAIN_MANAGE_SELF: 'domain:manage:self',
  APIKEY_MANAGE_SELF: 'apikey:manage:self',
  BILLING_MANAGE_SELF: 'billing:manage:self',
  ADMIN_DASHBOARD_READ: 'admin:dashboard:read',
  ADMIN_USERS_MANAGE: 'admin:users:manage',
  ADMIN_SERVERS_MANAGE: 'admin:servers:manage',
  ADMIN_UPDATES_MANAGE: 'admin:updates:manage',
  ADMIN_DOMAINS_MANAGE: 'admin:domains:manage',
  ADMIN_AUDIT_READ: 'admin:audit:read'
};

const ROLE_PERMISSIONS = {
  [ROLE_USER]: new Set([
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.SERVER_MANAGE_SELF,
    PERMISSIONS.DOMAIN_MANAGE_SELF,
    PERMISSIONS.APIKEY_MANAGE_SELF,
    PERMISSIONS.BILLING_MANAGE_SELF
  ]),
  [ROLE_ADMIN]: new Set(['*'])
};

function normalizeRole(role) {
  return role === ROLE_ADMIN ? ROLE_ADMIN : ROLE_USER;
}

function hasRole(userRole, allowedRoles) {
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    return false;
  }

  const normalizedUserRole = normalizeRole(userRole);
  return allowedRoles.map(normalizeRole).includes(normalizedUserRole);
}

function hasPermission(userRole, permission) {
  const normalizedUserRole = normalizeRole(userRole);
  const permissions = ROLE_PERMISSIONS[normalizedUserRole] || ROLE_PERMISSIONS[ROLE_USER];

  return permissions.has('*') || permissions.has(permission);
}

function isAdminSession(req) {
  return hasRole(req?.session?.userRole, [ROLE_ADMIN]);
}

module.exports = {
  ROLE_USER,
  ROLE_ADMIN,
  PERMISSIONS,
  normalizeRole,
  hasRole,
  hasPermission,
  isAdminSession
};
