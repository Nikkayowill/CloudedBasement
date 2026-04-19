const { Router } = require('express');
const csrf = require('../middleware/csrf');
const { requireAuth } = require('../middleware/auth');
const { paymentLimiter } = require('../middleware/rateLimiter');
const paymentController = require('../controllers/paymentController');
const { renderReactHtml } = require('../src/utils/reactSPA');
const { isAdminSession } = require('../src/utils/rbac');

const router = Router();

function serveCheckoutSPA(req, res) {
	res.send(renderReactHtml(res.locals.nonce));
}

// Checkout UI
router.get('/pay', requireAuth, csrf, (req, res, next) => {
	// Keep legacy demo mode path for admin tooling, but move normal users to React checkout.
	if (req.query.demo === 'true' && isAdminSession(req)) {
		return paymentController.showCheckout(req, res, next);
	}

	const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
	return res.redirect(`/checkout${query}`);
});

router.get('/checkout', requireAuth, csrf, serveCheckoutSPA);
router.get('/api/stripe/config', requireAuth, paymentController.getStripeConfig);

// Payment result pages
router.get('/payment-success', requireAuth, paymentController.paymentSuccess);
router.get('/payment-cancel', requireAuth, paymentController.paymentCancel);

// Stripe payment intents / sessions
router.post('/create-payment-intent', requireAuth, paymentLimiter, csrf, paymentController.createPaymentIntent);
router.post('/upgrade-plan', requireAuth, csrf, paymentController.upgradePlan);
router.get('/api/billing/usage', requireAuth, paymentController.getBillingUsage);

// NOTE: POST /webhook/stripe is registered in index.js BEFORE express.json()
// because it requires the raw request body for Stripe signature verification.
// Do not move it here.

module.exports = router;
