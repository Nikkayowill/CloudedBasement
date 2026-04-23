'use strict';

// routes/wordpress.js
// WordPress site creation and status polling.

const { Router } = require('express');
const csrf = require('../middleware/csrf');
const { requireAuth } = require('../middleware/auth');
const { deploymentLimiter } = require('../middleware/rateLimiter');
const wordpressController = require('../controllers/wordpressController');

const router = Router();

// Create a new WordPress site — rate-limited, CSRF-protected
router.post(
  '/wordpress/create',
  requireAuth,
  deploymentLimiter,
  csrf,
  wordpressController.createSite
);


// Parameter validation middleware for :siteId
function validateSiteId(req, res, next) {
  const siteIdRaw = req.params.siteId;
  const siteId = parseInt(siteIdRaw, 10);
  if (!Number.isInteger(siteId) || siteId <= 0) {
    return res.status(400).json({ error: 'Invalid site ID.' });
  }
  next();
}

// Poll deployment status — no CSRF needed for GET
router.get(
  '/wordpress/status/:siteId',
  requireAuth,
  validateSiteId,
  wordpressController.getSiteStatus
);

// Decrypt + return WP admin credentials — only callable on live sites
router.get(
  '/wordpress/credentials/:siteId',
  requireAuth,
  deploymentLimiter,
  validateSiteId,
  wordpressController.getWpCredentials
);

// Run `wp core update` on a live site — SSH operation, rate-limited
router.post(
  '/wordpress/update-core/:siteId',
  requireAuth,
  deploymentLimiter,
  csrf,
  validateSiteId,
  wordpressController.updateCore
);

// Configure msmtp SMTP relay on the droplet — SSH + DB write, rate-limited
router.post(
  '/wordpress/configure-smtp/:siteId',
  requireAuth,
  deploymentLimiter,
  csrf,
  validateSiteId,
  wordpressController.configureSMTP
);

module.exports = router;
