// pagesController.js - Re-export facade
// Individual controllers live in ./pages/ directory.
// Only API handlers are exported — HTML-rendering controllers have been
// replaced by React pages and are no longer called by routes.

const { submitContactJson } = require('./pages/contactController');
const { getPricingStatus }  = require('./pages/pricingController');

module.exports = {
  getPricingStatus,
  submitContactJson,
};
