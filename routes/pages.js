const { Router } = require('express');
const { body } = require('express-validator');
const csrf = require('../middleware/csrf');
const { contactLimiter } = require('../middleware/rateLimiter');
const pagesController = require('../controllers/pagesController');

const router = Router();

// Static public pages
router.get('/about', pagesController.showAbout);
router.get('/is-this-safe', pagesController.showSafety);
router.get('/compare', pagesController.showCompare);
router.get('/pricing', pagesController.showPricing);
router.get('/terms', pagesController.showTerms);
router.get('/privacy', pagesController.showPrivacy);
router.get('/faq', pagesController.showFaq);
router.get('/docs', pagesController.showDocs);

// Contact form
router.get('/contact', csrf, pagesController.showContact);
router.post('/contact',
  contactLimiter,
  csrf,
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
    body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 1000 }),
  ],
  pagesController.submitContact
);

module.exports = router;
