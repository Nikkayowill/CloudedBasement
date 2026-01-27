// Database helper functions to reduce duplication across controllers
const pool = require('../db');

/**
 * Get user's server (most commonly used query - appears 15+ times)
 * @param {number} userId - User ID
 * @param {object} options - Query options
 * @returns {object|null} Server object or null
 */
async function getUserServer(userId, options = {}) {
  const { includeDeleted = false } = options;
  
  const query = includeDeleted
    ? 'SELECT * FROM servers WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1'
    : 'SELECT * FROM servers WHERE user_id = $1 AND status NOT IN ($2, $3) ORDER BY created_at DESC LIMIT 1';
  
  const params = includeDeleted ? [userId] : [userId, 'deleted', 'failed'];
  
  const result = await pool.query(query, params);
  return result.rows[0] || null;
}

/**
 * Check if user owns a server (authorization helper)
 * @param {number} serverId - Server ID
 * @param {number} userId - User ID
 * @returns {boolean} True if user owns server
 */
async function verifyServerOwnership(serverId, userId) {
  const result = await pool.query(
    'SELECT id FROM servers WHERE id = $1 AND user_id = $2',
    [serverId, userId]
  );
  return result.rows.length > 0;
}

/**
 * Check if user has a successful payment
 * @param {number} userId - User ID
 * @returns {boolean} True if user has paid
 */
async function hasSuccessfulPayment(userId) {
  const result = await pool.query(
    'SELECT id FROM payments WHERE user_id = $1 AND status = $2 LIMIT 1',
    [userId, 'succeeded']
  );
  return result.rows.length > 0;
}

/**
 * Get user by ID
 * @param {number} userId - User ID
 * @returns {object|null} User object or null
 */
async function getUserById(userId) {
  const result = await pool.query(
    'SELECT id, email, email_confirmed, role, created_at FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0] || null;
}

/**
 * Get user by email
 * @param {string} email - User email
 * @returns {object|null} User object or null
 */
async function getUserByEmail(email) {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

/**
 * Update server status
 * @param {number} serverId - Server ID
 * @param {string} status - New status
 */
async function updateServerStatus(serverId, status) {
  await pool.query(
    'UPDATE servers SET status = $1 WHERE id = $2',
    [status, serverId]
  );
}

/**
 * Update deployment output (for real-time logs)
 * @param {number} deploymentId - Deployment ID
 * @param {string} output - Output text to append
 */
async function appendDeploymentOutput(deploymentId, output) {
  try {
    await pool.query(
      'UPDATE deployments SET output = output || $1 WHERE id = $2',
      [output, deploymentId]
    );
  } catch (err) {
    console.error('[DB] Failed to update deployment output:', err.message);
  }
}

/**
 * Update deployment status
 * @param {number} deploymentId - Deployment ID
 * @param {string} status - New status (pending, in-progress, success, failed)
 */
async function updateDeploymentStatus(deploymentId, status) {
  const column = status === 'success' || status === 'failed' ? 'deployed_at' : null;
  
  if (column) {
    await pool.query(
      `UPDATE deployments SET status = $1, ${column} = NOW() WHERE id = $2`,
      [status, deploymentId]
    );
  } else {
    await pool.query(
      'UPDATE deployments SET status = $1 WHERE id = $2',
      [status, deploymentId]
    );
  }
}

module.exports = {
  getUserServer,
  verifyServerOwnership,
  hasSuccessfulPayment,
  getUserById,
  getUserByEmail,
  updateServerStatus,
  appendDeploymentOutput,
  updateDeploymentStatus
};
