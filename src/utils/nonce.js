const { AsyncLocalStorage } = require('async_hooks');
const crypto = require('crypto');

const nonceStorage = new AsyncLocalStorage();

/**
 * CSP Nonce Utility
 * Uses AsyncLocalStorage to provide a per-request nonce
 * accessible from helpers without parameter passing.
 */

// Middleware: generates a nonce and runs the rest of the request inside the store
function nonceMiddleware(req, res, next) {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce;
  nonceStorage.run(nonce, next);
}

// Get the current request's nonce (callable from helpers, controllers, etc.)
function getNonce() {
  return nonceStorage.getStore() || '';
}

module.exports = { nonceMiddleware, getNonce };
