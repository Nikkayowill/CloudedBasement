const { Router } = require('express');
const csrf = require('../middleware/csrf');
const { requireAuth } = require('../middleware/auth');
const { paymentLimiter } = require('../middleware/rateLimiter');
const paymentController = require('../controllers/paymentController');

const router = Router();

// Checkout UI
router.get('/pay', requireAuth, csrf, paymentController.showCheckout);

// Payment result pages
router.get('/payment-success', requireAuth, paymentController.paymentSuccess);
router.get('/payment-cancel', requireAuth, paymentController.paymentCancel);

// Stripe payment intents / sessions
router.post('/create-payment-intent', requireAuth, paymentLimiter, csrf, paymentController.createPaymentIntent);
router.post('/create-checkout-session', requireAuth, paymentLimiter, csrf, paymentController.createCheckoutSession);
router.post('/upgrade-plan', requireAuth, csrf, paymentController.upgradePlan);

// NOTE: POST /webhook/stripe is registered in index.js BEFORE express.json()
// because it requires the raw request body for Stripe signature verification.
// Do not move it here.

module.exports = router;
