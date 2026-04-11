const crypto = require('crypto');
const pool = require('../db');

/**
 * Middleware: authenticate via Bearer token API key.
 * Sets req.userId and req.apiKey on success.
 */
async function requireApiKey(req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or malformed Authorization header. Use: Bearer <api_key>' });
    }

    const token = auth.slice(7).trim();
    if (!token) {
      return res.status(401).json({ error: 'Empty API key' });
    }

    const hash = crypto.createHash('sha256').update(token).digest('hex');

    const result = await pool.query(
      `SELECT id, user_id, name, scopes, expires_at
       FROM api_keys
       WHERE key_hash = $1
         AND is_active = TRUE
         AND (expires_at IS NULL OR expires_at > NOW())`,
      [hash]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired API key' });
    }

    const apiKey = result.rows[0];
    req.userId = apiKey.user_id;
    req.apiKey = apiKey;

    // Fire-and-forget last_used_at update
    pool.query('UPDATE api_keys SET last_used_at = NOW() WHERE id = $1', [apiKey.id]).catch(() => {});

    next();
  } catch (err) {
    console.error('[API KEY AUTH] Error:', err);
    res.status(500).json({ error: 'Authentication error' });
  }
}

/**
 * Middleware factory: require a specific scope on the API key.
 * Must be used after requireApiKey.
 */
function requireScope(scope) {
  return (req, res, next) => {
    if (!req.apiKey?.scopes?.includes(scope)) {
      return res.status(403).json({ error: `API key is missing required scope: ${scope}` });
    }
    next();
  };
}

module.exports = { requireApiKey, requireScope };
