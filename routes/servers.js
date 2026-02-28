const { Router } = require('express');
const csrf = require('../middleware/csrf');
const { requireAuth } = require('../middleware/auth');
const { deploymentLimiter } = require('../middleware/rateLimiter');
const serverController = require('../controllers/serverController');
const githubWebhookController = require('../controllers/githubWebhookController');

const router = Router();

// Server lifecycle
router.post('/server-action', requireAuth, csrf, serverController.serverAction);
router.post('/delete-server', requireAuth, csrf, serverController.deleteServer);

// Deployments
router.post('/deploy', requireAuth, deploymentLimiter, csrf, serverController.deploy);
router.post('/delete-deployment', requireAuth, csrf, serverController.deleteDeployment);

// Domains
router.post('/add-domain', requireAuth, csrf, serverController.addDomain);
router.post('/delete-domain', requireAuth, csrf, serverController.deleteDomain);

// SSL
router.post('/enable-ssl', requireAuth, csrf, serverController.enableSSL);

// Auto-deploy
router.post('/enable-auto-deploy', requireAuth, csrf, githubWebhookController.enableAutoDeploy);
router.post('/disable-auto-deploy', requireAuth, csrf, githubWebhookController.disableAutoDeploy);
router.post('/enable-domain-autodeploy', requireAuth, csrf, serverController.enableDomainAutoDeploy);
router.post('/disable-domain-autodeploy', requireAuth, csrf, serverController.disableDomainAutoDeploy);

// Database setup
router.post('/setup-database', requireAuth, csrf, serverController.setupDatabase);

// Server provisioning
router.post('/request-server', requireAuth, deploymentLimiter, csrf, serverController.requestServer);
router.post('/start-trial', requireAuth, deploymentLimiter, csrf, serverController.startTrial);

module.exports = router;
