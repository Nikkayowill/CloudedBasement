const path = require('path');
const { Router } = require('express');
const csrf = require('../middleware/csrf');
const { requireAuth } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');
const gettingStartedController = require('../controllers/gettingStartedController');
const { triggerBackup } = require('../services/dbBackups');

const router = Router();

// ── Dashboard UI ──────────────────────────────────────────────────────────────
// React SPA — auth guard here; client-side routing handles sub-pages
router.get('/dashboard', requireAuth, csrf, (_req, res) =>
  res.sendFile(path.join(__dirname, '..', 'react-homepage/dist/index.html'))
);

// User actions
router.post('/submit-ticket', requireAuth, csrf, dashboardController.submitSupportTicket);
router.post('/change-password', requireAuth, csrf, dashboardController.changePassword);
router.post('/apply-updates', requireAuth, csrf, dashboardController.applyUpdates);
router.post('/set-notify-webhook', requireAuth, csrf, dashboardController.setNotifyWebhook);
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

// VPS metrics — proxied so the DO API key never reaches the client
router.get('/api/metrics', requireAuth, dashboardController.getMetrics);

// Historical metrics for graphing (24h, 7d, 30d)
router.get('/api/metrics/history', requireAuth, dashboardController.getMetricsHistory);

// Resource alert rules
router.get('/api/alert-rules', requireAuth, dashboardController.getAlertRules);
router.post('/api/alert-rules', requireAuth, csrf, dashboardController.setAlertRule);
router.delete('/api/alert-rules/:metric', requireAuth, csrf, dashboardController.deleteAlertRule);
router.post('/api/alert-rules/:id/snooze', requireAuth, csrf, dashboardController.snoozeAlertRule);

// Alert history
router.get('/api/alert-history', requireAuth, dashboardController.getAlertHistory);
router.post('/api/alert-history/:id/dismiss', requireAuth, csrf, dashboardController.dismissAlertHistory);

// Notification channels (Slack, Discord)
router.post('/api/notification-channels', requireAuth, csrf, dashboardController.setNotificationChannels);

// Deployment status polling
router.get('/api/deployment-status/:id', requireAuth, dashboardController.getDeploymentStatus);

// On-demand database backup
router.post('/api/backup-database', requireAuth, csrf, async (req, res) => {
  const { db_type } = req.body;
  if (!['postgres', 'mongodb'].includes(db_type)) return res.status(400).json({ error: 'db_type must be postgres or mongodb.' });
  try {
    const result = await triggerBackup(req.session.userId, db_type);
    if (result.success) res.json(result);
    else res.status(400).json(result);
  } catch (err) {
    console.error('[backup-database] Unexpected error:', err.message);
    res.status(500).json({ error: 'backup failed', details: err.message });
  }
});

// Getting started guide
router.get('/getting-started', requireAuth, gettingStartedController.showGettingStarted);

module.exports = router;
