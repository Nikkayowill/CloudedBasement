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

// ── Team roles ────────────────────────────────────────────────────────────────
// Account-level roles layered on top of the platform user/admin roles.
// owner is not stored in account_memberships — it is implied by account_owner_id.

const TEAM_ROLE_OWNER     = 'owner';
const TEAM_ROLE_ADMIN     = 'admin';
const TEAM_ROLE_DEVELOPER = 'developer';
const TEAM_ROLE_VIEWER    = 'viewer';

const TEAM_ROLE_RANK = {
  [TEAM_ROLE_OWNER]:     4,
  [TEAM_ROLE_ADMIN]:     3,
  [TEAM_ROLE_DEVELOPER]: 2,
  [TEAM_ROLE_VIEWER]:    1,
};

const VALID_TEAM_ROLES = Object.keys(TEAM_ROLE_RANK);

function teamRoleAtLeast(userTeamRole, minRole) {
  const userRank = TEAM_ROLE_RANK[userTeamRole] ?? 0;
  const minRank  = TEAM_ROLE_RANK[minRole]      ?? 99;
  return userRank >= minRank;
}

const TEAM_PERMISSIONS = {
  [TEAM_ROLE_OWNER]:     new Set(['*']),
  [TEAM_ROLE_ADMIN]:     new Set(['deploy', 'env:write', 'billing:read', 'members:manage']),
  [TEAM_ROLE_DEVELOPER]: new Set(['deploy', 'env:write', 'billing:read']),
  [TEAM_ROLE_VIEWER]:    new Set(['deploy:read', 'env:read', 'billing:read']),
};

function hasTeamPermission(teamRole, permission) {
  const perms = TEAM_PERMISSIONS[teamRole] ?? TEAM_PERMISSIONS[TEAM_ROLE_VIEWER];
  return perms.has('*') || perms.has(permission);
}

module.exports = {
  ROLE_USER,
  ROLE_ADMIN,
  PERMISSIONS,
  normalizeRole,
  hasRole,
  hasPermission,
  isAdminSession,
  TEAM_ROLE_OWNER,
  TEAM_ROLE_ADMIN,
  TEAM_ROLE_DEVELOPER,
  TEAM_ROLE_VIEWER,
  VALID_TEAM_ROLES,
  TEAM_ROLE_RANK,
  teamRoleAtLeast,
  hasTeamPermission,
};
