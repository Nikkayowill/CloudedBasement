const express = require('express');
const router = express.Router();
const csrf = require('../middleware/csrf');
const { requireAuth } = require('../middleware/auth');
const gettingStartedController = require('../controllers/gettingStartedController');

// Show onboarding page
router.get('/getting-started', requireAuth, csrf, gettingStartedController.showGettingStarted);

// POST /resend-confirmation (secure: uses session userId)
router.post('/resend-confirmation', requireAuth, csrf, gettingStartedController.resendConfirmation);

module.exports = router;
