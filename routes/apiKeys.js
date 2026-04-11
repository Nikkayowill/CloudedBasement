const { Router } = require('express');
const csrf = require('../middleware/csrf');
const { requireAuth } = require('../middleware/auth');
const apiKeyController = require('../controllers/apiKeyController');

const router = Router();

// Dashboard-facing (session auth + CSRF)
router.get('/api/keys', requireAuth, apiKeyController.listKeys);
router.post('/api/keys', requireAuth, csrf, apiKeyController.createKey);
router.delete('/api/keys/:id', requireAuth, csrf, apiKeyController.revokeKey);

module.exports = router;
