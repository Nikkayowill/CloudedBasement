// 2FA prompt page
router.get('/2fa/prompt', authController.show2FAPrompt);
// 2FA setup (GET QR, POST verify, POST disable, POST login verify)
router.get('/2fa/setup', authController.show2FASetup);
router.post('/2fa/verify', authController.verify2FASetup);
router.post('/2fa/disable', authController.disable2FA);
router.post('/2fa/verify-login', authController.verify2FALogin);
const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const authController = require('../controllers/authController');
const { body } = require('express-validator');

const csrfProtection = csrf({ cookie: true });

// GET /register
router.get('/register', csrfProtection, authController.showRegister);

// POST /register
router.post('/register',
  csrfProtection,
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  authController.register
);

// GET /login
router.get('/login', csrfProtection, authController.showLogin);

// POST /login
router.post('/login',
  csrfProtection,
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  authController.login
);

// GET /logout
router.get('/logout', authController.logout);

module.exports = router;
