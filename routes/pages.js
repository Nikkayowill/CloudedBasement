const { Router } = require('express');
const { body } = require('express-validator');
const csrf = require('../middleware/csrf');
const { contactLimiter } = require('../middleware/rateLimiter');
const { renderReactHtml } = require('../src/utils/reactSPA');
const pagesController = require('../controllers/pagesController');

const router = Router();

// ---------------------------------------------------------------------------
// Helper — serve the React SPA with CSP nonce + GA injected
// ---------------------------------------------------------------------------
function serveSPA(req, res) {
  res.send(renderReactHtml(res.locals.nonce));
}

// ---------------------------------------------------------------------------
// Public site pages — all rendered by the React SPA.
// React Router handles the route; Express just sends the SPA shell.
// ---------------------------------------------------------------------------
router.get('/about',        serveSPA);
router.get('/compare',      serveSPA);
router.get('/contact',      serveSPA);
router.get('/docs',         serveSPA);
router.get('/faq',          serveSPA);
router.get('/pricing',      serveSPA);
router.get('/privacy',      serveSPA);
router.get('/terms',        serveSPA);
router.get('/is-this-safe', serveSPA);

// ---------------------------------------------------------------------------
// API: CSRF token — React Contact form fetches this before POST
// ---------------------------------------------------------------------------
router.get('/api/csrf-token', csrf, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// ---------------------------------------------------------------------------
// API: Pricing status — returns login/trial state for the Pricing page banner
// ---------------------------------------------------------------------------
router.get('/api/pricing/status', pagesController.getPricingStatus);

// ---------------------------------------------------------------------------
// API: Contact form submission (JSON)
// ---------------------------------------------------------------------------
router.post(
  '/api/contact',
  contactLimiter,
  csrf,
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
    body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 1000 }),
  ],
  pagesController.submitContactJson
);

module.exports = router;
