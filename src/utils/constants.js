// Application constants - eliminates magic strings and numbers

// Server statuses
const SERVER_STATUS = {
  PROVISIONING: 'provisioning',
  RUNNING: 'running',
  STOPPED: 'stopped',
  FAILED: 'failed',
  DELETED: 'deleted'
};

// Deployment statuses
const DEPLOYMENT_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  SUCCESS: 'success',
  FAILED: 'failed'
};

// Payment statuses
const PAYMENT_STATUS = {
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PENDING: 'pending'
};

// User roles
const USER_ROLE = {
  USER: 'user',
  ADMIN: 'admin'
};

// Timeouts (in milliseconds)
const TIMEOUTS = {
  SSH_CONNECTION: 30 * 1000,         // 30 seconds
  SSH_COMMAND: 15 * 60 * 1000,       // 15 minutes
  DEPLOYMENT: 30 * 60 * 1000,        // 30 minutes
  IP_POLLING_INTERVAL: 10 * 1000,    // 10 seconds
  IP_POLLING_MAX_DURATION: 5 * 60 * 1000,  // 5 minutes
  IP_POLLING_MAX_ATTEMPTS: 30        // 30 attempts
};

// Network ports
const PORTS = {
  SSH: 22,
  HTTP: 80,
  HTTPS: 443,
  APP_DEFAULT: 3000,
  POSTGRES: 5432,
  MYSQL: 3306,
  MONGODB: 27017
};

// Valid DigitalOcean regions
const DO_REGIONS = [
  'nyc1', 'nyc3', 'sfo3', 'sgp1', 'lon1', 
  'fra1', 'tor1', 'blr1', 'syd1'
];

// Session configuration
const SESSION_CONFIG = {
  MAX_AGE: 7 * 24 * 60 * 60 * 1000,  // 7 days
  COOKIE_NAME: 'sessionId'
};

// Email configuration
const EMAIL_CONFIG = {
  TOKEN_LENGTH: 6,
  TOKEN_EXPIRY_MINUTES: 10,
  RESET_TOKEN_EXPIRY_HOURS: 1
};

module.exports = {
  SERVER_STATUS,
  DEPLOYMENT_STATUS,
  PAYMENT_STATUS,
  USER_ROLE,
  TIMEOUTS,
  PORTS,
  DO_REGIONS,
  SESSION_CONFIG,
  EMAIL_CONFIG
};
