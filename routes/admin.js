const { Router } = require('express');
const csrf = require('../middleware/csrf');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const adminUpdatesController = require('../controllers/adminUpdatesController');
const domainController = require('../controllers/domainController');

const router = Router();

// Apply auth + admin guard to every route in this file
router.use(requireAuth, requireAdmin);

// ── Admin dashboard ───────────────────────────────────────────────────────────
router.get('/', csrf, adminController.listUsers);
router.post('/delete-user/:id', csrf, adminController.deleteUser);
router.post('/cancel-provisioning/:id', csrf, adminController.cancelProvisioning);
router.post('/delete-server/:id', csrf, adminController.deleteServer);
router.post('/destroy-droplet/:id', csrf, adminController.destroyDroplet);

// ── Server updates ────────────────────────────────────────────────────────────
router.get('/updates', csrf, adminUpdatesController.showUpdates);
router.get('/updates/:id', csrf, adminUpdatesController.showUpdateDetail);
router.post('/updates/create', csrf, adminUpdatesController.createUpdate);
router.post('/updates/kill-switch', csrf, adminUpdatesController.toggleKillSwitch);
router.post('/updates/:id/test', csrf, adminUpdatesController.testUpdate);
router.post('/updates/:id/release', csrf, adminUpdatesController.releaseUpdate);
router.post('/updates/:id/push', csrf, adminUpdatesController.pushUpdate);
router.post('/updates/:id/retry', csrf, adminUpdatesController.retryFailedServers);
router.post('/updates/:id/archive', csrf, adminUpdatesController.archiveUpdate);
router.post('/updates/:id/delete', csrf, adminUpdatesController.deleteUpdate);

// ── Domain management API ─────────────────────────────────────────────────────
router.get('/domains/list', domainController.listDomains);
router.post('/domains', csrf, domainController.addDomain);
router.put('/domains/:id', csrf, domainController.updateDomain);
router.delete('/domains/:id', csrf, domainController.deleteDomain);

module.exports = router;
