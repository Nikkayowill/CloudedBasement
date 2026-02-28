const path = require('path');
const { Router } = require('express');
const csrf = require('../middleware/csrf');
const { requireAuth } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');
const gettingStartedController = require('../controllers/gettingStartedController');

const router = Router();

// ── Dashboard UI ──────────────────────────────────────────────────────────────
// React SPA — auth guard here; client-side routing handles sub-pages
router.get('/dashboard', requireAuth, csrf, (_req, res) =>
  res.sendFile(path.join(__dirname, '..', 'react-homepage/dist/index.html'))
);

// Classic server-rendered dashboard (kept as fallback)
router.get('/old-dashboard', requireAuth, csrf, dashboardController.showDashboard);

// User actions
router.post('/submit-ticket', requireAuth, csrf, dashboardController.submitSupportTicket);
router.post('/change-password', requireAuth, csrf, dashboardController.changePassword);
router.post('/apply-updates', requireAuth, csrf, dashboardController.applyUpdates);
router.post('/dashboard/dismiss-next-steps', requireAuth, csrf, (req, res) => {
  req.session.dismissedNextSteps = true;
  res.json({ success: true });
});

// ── Dashboard API ─────────────────────────────────────────────────────────────
router.get('/api/dashboard', requireAuth, csrf, dashboardController.getDashboardData);

// Credentials fetched on-demand — never embedded in main API response
router.get('/api/credentials', requireAuth, dashboardController.getCredentials);

// Environment variable management
router.get('/api/env-vars', requireAuth, csrf, dashboardController.getEnvVars);
router.post('/api/env-vars', requireAuth, csrf, dashboardController.createEnvVar);
router.delete('/api/env-vars/:id', requireAuth, csrf, dashboardController.deleteEnvVar);

// Deployment status polling
router.get('/api/deployment-status/:id', requireAuth, dashboardController.getDeploymentStatus);

// Getting started guide
router.get('/getting-started', requireAuth, gettingStartedController.showGettingStarted);

module.exports = router;
