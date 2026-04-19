const path = require('path');
const { Router } = require('express');
const csrf = require('../middleware/csrf');
const { requireAuth } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');
const gettingStartedController = require('../controllers/gettingStartedController');
const { triggerBackup } = require('../services/dbBackups');
const { listBackups, initiateRestore, getRestoreJobStatus, listRestoreJobs } = require('../services/backupRestore');
const { getGuardrails, updateGuardrails, getSpendForecast } = require('../services/billingGuardrails');
const teamController = require('../controllers/teamController');

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
    res.status(500).json({ error: 'backup failed' });
  }
});

// ── Backup restore ────────────────────────────────────────────────────────────

// List available backup files on the user's server
router.get('/api/backups/list', requireAuth, csrf, async (req, res) => {
  try {
    const result = await listBackups(req.session.userId);
    if (result.success) res.json(result);
    else res.status(400).json(result);
  } catch (err) {
    console.error('[backups/list] Unexpected error:', err.message);
    res.status(500).json({ error: 'Failed to list backups' });
  }
});

// Initiate a restore (destructive — client must confirm)
router.post('/api/backups/restore', requireAuth, csrf, async (req, res) => {
  const { backup_file, db_type } = req.body;
  if (!backup_file || !db_type) {
    return res.status(400).json({ error: 'backup_file and db_type are required' });
  }
  try {
    const result = await initiateRestore(req.session.userId, backup_file, db_type);
    if (result.success) res.json(result);
    else res.status(400).json(result);
  } catch (err) {
    console.error('[backups/restore] Unexpected error:', err.message);
    res.status(500).json({ error: 'Failed to start restore' });
  }
});

// Poll restore job status
router.get('/api/backups/restore-status/:jobId', requireAuth, async (req, res) => {
  const jobId = parseInt(req.params.jobId, 10);
  if (!Number.isFinite(jobId)) return res.status(400).json({ error: 'Invalid job ID' });
  try {
    const job = await getRestoreJobStatus(req.session.userId, jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (err) {
    console.error('[backups/restore-status] Unexpected error:', err.message);
    res.status(500).json({ error: 'Failed to get job status' });
  }
});

// List recent restore jobs
router.get('/api/backups/restore-jobs', requireAuth, async (req, res) => {
  try {
    const jobs = await listRestoreJobs(req.session.userId);
    res.json({ jobs });
  } catch (err) {
    console.error('[backups/restore-jobs] Unexpected error:', err.message);
    res.status(500).json({ error: 'Failed to list restore jobs' });
  }
});

// ── Billing guardrails ────────────────────────────────────────────────────────

router.get('/api/billing/guardrails', requireAuth, async (req, res) => {
  try {
    const guardrail = await getGuardrails(req.session.userId);
    res.json(guardrail);
  } catch (err) {
    console.error('[billing/guardrails GET] Error:', err.message);
    res.status(500).json({ error: 'Failed to load guardrails' });
  }
});

router.put('/api/billing/guardrails', requireAuth, csrf, async (req, res) => {
  try {
    const updated = await updateGuardrails(req.session.userId, req.body);
    res.json({ success: true, guardrail: updated });
  } catch (err) {
    if (err.message.includes('must be')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('[billing/guardrails PUT] Error:', err.message);
    res.status(500).json({ error: 'Failed to update guardrails' });
  }
});

router.get('/api/billing/forecast', requireAuth, async (req, res) => {
  try {
    const forecast = await getSpendForecast(req.session.userId);
    res.json(forecast);
  } catch (err) {
    console.error('[billing/forecast] Error:', err.message);
    res.status(500).json({ error: 'Failed to calculate forecast' });
  }
});

// ── Team management ───────────────────────────────────────────────────────────

router.get('/api/team/members',             requireAuth,       teamController.listMembers);
router.post('/api/team/invite',             requireAuth, csrf, teamController.inviteMember);
router.get('/api/team/invite/accept',                          teamController.previewInviteAcceptance); // no requireAuth — handles redirect to login
router.post('/api/team/invite/accept',      requireAuth, csrf, teamController.acceptInvite);
router.patch('/api/team/members/:id/role',  requireAuth, csrf, teamController.updateMemberRole);
router.delete('/api/team/members/:id',      requireAuth, csrf, teamController.removeMember);
router.delete('/api/team/invites/:id',      requireAuth, csrf, teamController.revokeInvite);

// Getting started guide
router.get('/getting-started', requireAuth, gettingStartedController.showGettingStarted);

module.exports = router;
