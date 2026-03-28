const { Router } = require('express');
const { body } = require('express-validator');
const csrf = require('../middleware/csrf');
const { emailVerifyLimiter, loginLimiter, registrationLimiter, twoFALimiter } = require('../middleware/rateLimiter');
const { requireAuth } = require('../middleware/auth');
const authController = require('../controllers/authController');
const { passport } = require('../services/googleAuth');
const { renderReactHtml } = require('../src/utils/reactSPA');

const router = Router();

function serveSPA(req, res) {
  res.send(renderReactHtml(res.locals.nonce));
}

function generateBotCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ── Bot challenge — React register page fetches this to get the human-check code
router.get('/api/auth/bot-challenge', (req, res) => {
  const botCode = generateBotCode();
  req.session.botCode = botCode;
  res.json({ botCode });
});

// ── Registration ──────────────────────────────────────────────────────────────
router.get('/register', serveSPA);
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
router.get('/login', serveSPA);
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

// ── 2FA ───────────────────────────────────────────────────────────────────────
router.get('/auth/2fa/prompt', authController.show2FAPrompt);
router.post('/auth/2fa/verify-login', twoFALimiter, authController.verify2FALogin);
router.get('/auth/2fa/setup', requireAuth, authController.show2FASetup);
router.post('/auth/2fa/verify', requireAuth, twoFALimiter, authController.verify2FASetup);
router.post('/auth/2fa/disable', requireAuth, twoFALimiter, authController.disable2FA);

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
