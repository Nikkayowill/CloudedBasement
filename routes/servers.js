const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const { requireAuth } = require('../middleware/auth');
const serverController = require('../controllers/serverController');

const csrfProtection = csrf({ cookie: true });

// Server actions (start, stop, restart)
router.post('/server-action', requireAuth, csrfProtection, serverController.serverAction);

// Delete server
router.post('/delete-server', requireAuth, csrfProtection, serverController.deleteServer);

// Deploy application
router.post('/deploy', requireAuth, csrfProtection, serverController.deploy);

// Add custom domain
router.post('/add-domain', requireAuth, csrfProtection, serverController.addDomain);

// Enable SSL for domain
router.post('/enable-ssl', requireAuth, csrfProtection, serverController.enableSSL);

module.exports = router;
