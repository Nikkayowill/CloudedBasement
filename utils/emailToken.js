const crypto = require('crypto');

// Generate a secure random token
function generateEmailToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Get expiration time (24 hours from now)
function getTokenExpiration() {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);
  return expiresAt;
}

// Create token object with expiration
function createEmailToken() {
  return {
    token: generateEmailToken(),
    expiresAt: getTokenExpiration()
  };
}

// Check if token is still valid
function isTokenValid(expiresAt) {
  return new Date() < new Date(expiresAt);
}

module.exports = {
  generateEmailToken,
  getTokenExpiration,
  createEmailToken,
  isTokenValid
};
