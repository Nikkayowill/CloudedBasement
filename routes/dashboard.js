const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const { requireAuth } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

const csrfProtection = csrf({ cookie: true });

// Dashboard
router.get('/dashboard', requireAuth, dashboardController.showDashboard);
router.post('/submit-ticket', requireAuth, csrfProtection, dashboardController.submitSupportTicket);
router.post('/change-password', requireAuth, csrfProtection, dashboardController.changePassword);

module.exports = router;
