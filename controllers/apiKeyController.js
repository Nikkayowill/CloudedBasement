const crypto = require('crypto');
const pool = require('../db');
const { logSecurityEvent, getClientIp } = require('../services/securityLog');

const VALID_SCOPES = ['deploy', 'read'];
const MAX_KEYS_PER_USER = 10;

function generateKey() {
  const raw = crypto.randomBytes(32).toString('hex'); // 64 hex chars
  const key = `cbk_${raw}`;
  const prefix = `cbk_${raw.slice(0, 6)}`;
  const hash = crypto.createHash('sha256').update(key).digest('hex');
  return { key, prefix, hash };
}

// GET /api/keys
exports.listKeys = async (req, res) => {
  try {
    // Verify authentication
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const userId = req.session.userId;
    const result = await pool.query(
      `SELECT id, name, key_prefix, scopes, last_used_at, expires_at, created_at
       FROM api_keys
       WHERE user_id = $1 AND is_active = TRUE
       ORDER BY created_at DESC`,
      [userId]
    );
    res.json({ keys: result.rows });
  } catch (err) {
    console.error('[API KEYS] listKeys error:', err);
    res.status(500).json({ error: 'Failed to load API keys' });
  }
};

// POST /api/keys
exports.createKey = async (req, res) => {
  try {
    // Verify authentication
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const userId = req.session.userId;
    const { name, scopes, expires_at } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Key name is required' });
    }
    if (name.trim().length > 100) {
      return res.status(400).json({ error: 'Key name must be 100 characters or fewer' });
    }

    const requestedScopes = Array.isArray(scopes) ? scopes : [];
    const invalidScopes = requestedScopes.filter(s => !VALID_SCOPES.includes(s));
    if (invalidScopes.length > 0) {
      return res.status(400).json({ error: `Invalid scopes: ${invalidScopes.join(', ')}. Valid: ${VALID_SCOPES.join(', ')}` });
    }
    if (requestedScopes.length === 0) {
      return res.status(400).json({ error: 'At least one scope is required' });
    }

    let expiresAt = null;
    if (expires_at) {
      const parsed = new Date(expires_at);
      if (isNaN(parsed.getTime()) || parsed <= new Date()) {
        return res.status(400).json({ error: 'expires_at must be a valid future date' });
      }
      expiresAt = parsed;
    }

    const { key, prefix, hash } = generateKey();

    // Use transaction with advisory lock to prevent TOCTOU race
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Acquire advisory lock scoped to this user
      await client.query('SELECT pg_advisory_xact_lock($1)', [userId]);
      
      // Re-check key limit inside transaction
      const countResult = await client.query(
        'SELECT COUNT(*) FROM api_keys WHERE user_id = $1 AND is_active = TRUE',
        [userId]
      );
      if (parseInt(countResult.rows[0].count) >= MAX_KEYS_PER_USER) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Maximum of ${MAX_KEYS_PER_USER} active API keys allowed` });
      }
      
      // Insert key inside transaction
      await client.query(
        `INSERT INTO api_keys (user_id, name, key_hash, key_prefix, scopes, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, name.trim(), hash, prefix, requestedScopes, expiresAt]
      );
      
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    console.log(`[API KEYS] Created key "${name.trim()}" for user ${userId} with scopes: ${requestedScopes.join(', ')}`);

    // Return the plaintext key ONCE — it is never stored
    res.json({ key, prefix, scopes: requestedScopes, name: name.trim() });
  } catch (err) {
    console.error('[API KEYS] createKey error:', err);
    res.status(500).json({ error: 'Failed to create API key' });
  }
};

// DELETE /api/keys/:id
exports.revokeKey = async (req, res) => {
  try {
    // Verify authentication
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const userId = req.session.userId;
    const keyId = parseInt(req.params.id, 10);
    if (isNaN(keyId)) {
      return res.status(400).json({ error: 'Invalid key ID' });
    }

    const result = await pool.query(
      'UPDATE api_keys SET is_active = FALSE WHERE id = $1 AND user_id = $2 RETURNING id',
      [keyId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'API key not found' });
    }

    console.log(`[API KEYS] Revoked key #${keyId} for user ${userId}`);
    res.json({ success: true });
  } catch (err) {
    console.error('[API KEYS] revokeKey error:', err);
    res.status(500).json({ error: 'Failed to revoke API key' });
  }
};

// POST /api/keys/:id/rotate
exports.rotateKey = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.session.userId;
    const keyId = parseInt(req.params.id, 10);
    if (isNaN(keyId)) {
      return res.status(400).json({ error: 'Invalid key ID' });
    }

    const { key, prefix, hash } = generateKey();

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // Advisory lock scoped to this user prevents concurrent rotate/create races
      await client.query('SELECT pg_advisory_xact_lock($1)', [userId]);

      // Swap credentials in-place; preserve id, name, scopes, expiry
      const result = await client.query(
        `UPDATE api_keys
           SET key_hash = $1, key_prefix = $2, last_used_at = NULL, created_at = NOW()
         WHERE id = $3 AND user_id = $4 AND is_active = TRUE
         RETURNING id, name, scopes, expires_at`,
        [hash, prefix, keyId, userId]
      );

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'API key not found or already revoked' });
      }

      await client.query('COMMIT');

      const { name, scopes, expires_at } = result.rows[0];
      console.log(`[API KEYS] Rotated key #${keyId} for user ${userId}`);

      logSecurityEvent({
        userId,
        eventType: 'API_KEY_ROTATED',
        ip: getClientIp(req),
        userAgent: req.headers['user-agent'],
        details: { keyId, keyName: name },
      }).catch(() => {});

      // Return new plaintext key ONCE — it is never stored
      res.json({ key, prefix, name, scopes, expires_at });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[API KEYS] rotateKey error:', err);
    res.status(500).json({ error: 'Failed to rotate API key' });
  }
};
