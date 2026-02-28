const { Router } = require('express');
const { body } = require('express-validator');
const csrf = require('../middleware/csrf');
const { emailVerifyLimiter, loginLimiter, registrationLimiter } = require('../middleware/rateLimiter');
const authController = require('../controllers/authController');
const { passport } = require('../services/googleAuth');

const router = Router();

// ── Registration ──────────────────────────────────────────────────────────────
router.get('/register', csrf, authController.showRegister);
router.post('/register',
  registrationLimiter,
  csrf,
  [
    body('email').trim().isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('confirmPassword').custom((value, { req }) => value === req.body.password),
  ],
  authController.handleRegister
);

// ── Login / logout ────────────────────────────────────────────────────────────
router.get('/login', csrf, authController.showLogin);
router.post('/login',
  loginLimiter,
  csrf,
  [
    body('email').trim().isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  authController.handleLogin
);
router.get('/logout', authController.handleLogout);

// ── Google OAuth ──────────────────────────────────────────────────────────────
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=Google authentication failed' }),
  (req, res) => {
    req.session.userId = req.user.id;
    req.session.userEmail = req.user.email;
    req.session.userRole = req.user.role;
    req.session.emailConfirmed = req.user.email_confirmed;
    res.redirect(req.user.role === 'admin' ? '/admin' : '/dashboard');
  }
);

// ── Email verification ────────────────────────────────────────────────────────
router.get('/confirm-email/:token', emailVerifyLimiter, authController.confirmEmail);
router.get('/verify-email', csrf, authController.showVerifyEmail);
router.post('/verify-email', emailVerifyLimiter, csrf, authController.verifyEmailCode);
router.post('/resend-code', emailVerifyLimiter, csrf, authController.resendCode);
router.get('/resend-confirmation', emailVerifyLimiter, authController.resendConfirmation);

// ── Password reset ────────────────────────────────────────────────────────────
router.get('/forgot-password', csrf, authController.showForgotPassword);
router.post('/forgot-password',
  csrf,
  emailVerifyLimiter,
  [body('email').trim().isEmail().normalizeEmail()],
  authController.handleForgotPassword
);
router.get('/reset-password/:token', csrf, authController.showResetPassword);
router.post('/reset-password/:token',
  csrf,
  [
    body('password').isLength({ min: 8 }),
    body('confirmPassword').custom((value, { req }) => value === req.body.password),
  ],
  authController.handleResetPassword
);

module.exports = router;
