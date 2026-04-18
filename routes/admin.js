const { Router } = require('express');
const csrf = require('../middleware/csrf');
const { requireAuth, requireAdmin, requirePermission } = require('../middleware/auth');
const { PERMISSIONS } = require('../src/utils/rbac');
const adminController = require('../controllers/adminController');
const adminUpdatesController = require('../controllers/adminUpdatesController');
const domainController = require('../controllers/domainController');
const { renderReactHtml } = require('../src/utils/reactSPA');

const router = Router();

// Apply auth + admin guard to every route in this file
router.use(requireAuth, requireAdmin);

const canReadAdminDashboard = requirePermission(PERMISSIONS.ADMIN_DASHBOARD_READ, {
  denyMessage: 'Admin dashboard access required',
  denyRedirect: '/dashboard'
});
const canManageUsers = requirePermission(PERMISSIONS.ADMIN_USERS_MANAGE, {
  denyMessage: 'User management permission required',
  denyRedirect: '/dashboard'
});
const canManageServers = requirePermission(PERMISSIONS.ADMIN_SERVERS_MANAGE, {
  denyMessage: 'Server management permission required',
  denyRedirect: '/dashboard'
});
const canManageUpdates = requirePermission(PERMISSIONS.ADMIN_UPDATES_MANAGE, {
  denyMessage: 'Updates management permission required',
  denyRedirect: '/dashboard'
});
const canManageDomains = requirePermission(PERMISSIONS.ADMIN_DOMAINS_MANAGE, {
  denyMessage: 'Domain management permission required',
  denyRedirect: '/dashboard'
});
const canReadAuditLog = requirePermission(PERMISSIONS.ADMIN_AUDIT_READ, {
  denyMessage: 'Audit log access required',
  denyRedirect: '/admin'
});

// ── Admin dashboard ───────────────────────────────────────────────────────────
// Serve React SPA for the admin UI
router.get('/', canReadAdminDashboard, (req, res) => {
  res.send(renderReactHtml(res.locals.nonce || ''));
});

// JSON API for the React admin dashboard
router.get('/data', canReadAdminDashboard, csrf, adminController.getAdminData);
router.post('/delete-user/:id', canManageUsers, csrf, adminController.deleteUser);
router.post('/cancel-provisioning/:id', canManageServers, csrf, adminController.cancelProvisioning);
router.post('/delete-server/:id', canManageServers, csrf, adminController.deleteServer);
router.post('/destroy-droplet/:id', canManageServers, csrf, adminController.destroyDroplet);

// ── Server updates ────────────────────────────────────────────────────────────
router.get('/updates', canManageUpdates, (req, res) => {
  res.send(renderReactHtml(res.locals.nonce || ''));
});
router.get('/updates/data', canManageUpdates, csrf, adminUpdatesController.getUpdatesData);
router.get('/updates/:id', canManageUpdates, csrf, adminUpdatesController.showUpdateDetail);
router.post('/updates/create', canManageUpdates, csrf, adminUpdatesController.createUpdate);
router.post('/updates/kill-switch', canManageUpdates, csrf, adminUpdatesController.toggleKillSwitch);
router.post('/updates/:id/test', canManageUpdates, csrf, adminUpdatesController.testUpdate);
router.post('/updates/:id/release', canManageUpdates, csrf, adminUpdatesController.releaseUpdate);
router.post('/updates/:id/push', canManageUpdates, csrf, adminUpdatesController.pushUpdate);
router.post('/updates/:id/retry', canManageUpdates, csrf, adminUpdatesController.retryFailedServers);
router.post('/updates/:id/archive', canManageUpdates, csrf, adminUpdatesController.archiveUpdate);
router.post('/updates/:id/delete', canManageUpdates, csrf, adminUpdatesController.deleteUpdate);

// ── Domain management API ─────────────────────────────────────────────────────
router.get('/domains/list', canManageDomains, csrf, domainController.listDomains);
router.post('/domains', canManageDomains, csrf, domainController.addDomain);
router.put('/domains/:id', canManageDomains, csrf, domainController.updateDomain);
router.delete('/domains/:id', canManageDomains, csrf, domainController.deleteDomain);

// ── Audit log ─────────────────────────────────────────────────────────────────
router.get('/audit-log/data', canReadAuditLog, csrf, adminController.getAuditLogData);

// ── Billing reconciliation ────────────────────────────────────────────────────
// Read-only: compares DB billing state against Stripe. Returns structured drift report.
router.get('/billing/reconcile', canReadAdminDashboard, adminController.getBillingReconciliation);

// ── Security analytics ────────────────────────────────────────────────────────
// Read-only: aggregates security_events into threshold-flagged signals.
// Also dispatches notifier alerts for any triggered thresholds (fire-and-forget).
router.get('/security/analytics', canReadAdminDashboard, adminController.getSecurityAnalytics);

// Filterable security event query API — supports ?event_type, ?ip, ?user_id, ?email, ?window_hours.
// Returns aggregates, hourly trend (chartable), top offenders, and recent events.
// Every call is written to the admin audit log.
router.get('/security-events/analytics', canReadAdminDashboard, adminController.getSecurityEventAnalytics);

module.exports = router;
