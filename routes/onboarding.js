'use strict';

// routes/onboarding.js
// Post-payment onboarding — server type choice page.

const { Router } = require('express');
const csrf = require('../middleware/csrf');
const { requireAuth } = require('../middleware/auth');
const { deploymentLimiter } = require('../middleware/rateLimiter');
const onboardingController = require('../controllers/onboardingController');

const router = Router();

// Choice page — shown after payment, before any server is provisioned
router.get('/onboarding/choose', requireAuth, csrf, onboardingController.showChoice);

// Node.js provisioning — rate-limited and CSRF-protected
router.post(
  '/onboarding/provision-nodejs',
  requireAuth,
  deploymentLimiter,
  csrf,
  onboardingController.provisionNodejs
);

module.exports = router;
