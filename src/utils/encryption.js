'use strict';

// src/utils/encryption.js
// AES-256-GCM symmetric encryption for at-rest credential storage.
//
// Used by the WordPress provisioning flow to encrypt WP admin and MySQL
// passwords before writing them to the wordpress_sites BYTEA columns.
//
// Algorithm: AES-256-GCM
//   - 256-bit key loaded from WP_ENCRYPTION_KEY env var (64-char hex)
//   - 96-bit IV generated fresh per encryption (standard for GCM)
//   - 128-bit GCM auth tag appended to ciphertext in the stored buffer
//     so a tampered ciphertext is rejected at decrypt time
//
// Storage layout (what goes into BYTEA):
//   encrypted column = [ ciphertext || authTag(16 bytes) ]
//   iv column        = [ iv(12 bytes) ]
//
// Key rotation: bump encrypted_*_version and re-encrypt credentials
// if the key ever changes (the version column exists for this purpose).

const crypto = require('crypto');

const ALGORITHM  = 'aes-256-gcm';
const IV_BYTES   = 12;  // 96-bit IV — recommended for GCM
const TAG_BYTES  = 16;  // 128-bit auth tag — GCM default

// ── Encryptor factory ─────────────────────────────────────────────────────────

/**
 * Create an { encrypt, decrypt } pair bound to a specific env var key.
 * Throws a clear error at the point of use (not at require-time) if the key
 * is missing or malformed, so callers can decide how to handle it.
 *
 * @param {string} keyEnvVar - Name of the environment variable holding the 64-char hex key
 * @returns {{ encrypt: Function, decrypt: Function }}
 */
function createEncryptor(keyEnvVar) {
  function getKey() {
    const hex = process.env[keyEnvVar];
    const hexPattern = /^[0-9a-fA-F]{64}$/;
    if (!hex || hex.length !== 64 || !hexPattern.test(hex)) {
      throw new Error(
        `${keyEnvVar} must be set to a 64-character hex string (32 bytes). ` +
        'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
      );
    }
    return Buffer.from(hex, 'hex');
  }

  /**
   * Encrypt a plaintext string with AES-256-GCM.
   * @param {string} plaintext
   * @returns {{ encrypted: Buffer, iv: Buffer }}
   */
  function encrypt(plaintext) {
    const key = getKey();
    const iv  = crypto.randomBytes(IV_BYTES);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const ciphertext = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final()
    ]);
    const authTag = cipher.getAuthTag();

    return { encrypted: Buffer.concat([ciphertext, authTag]), iv };
  }

  /**
   * Decrypt a value produced by encrypt().
   * Throws if the auth tag doesn't match (tampered data).
   * @param {Buffer} encryptedBuf
   * @param {Buffer} ivBuf
   * @returns {string} plaintext
   */
  function decrypt(encryptedBuf, ivBuf) {
    if (!Buffer.isBuffer(encryptedBuf)) throw new TypeError('encryptedBuf must be a Buffer');
    if (!Buffer.isBuffer(ivBuf))        throw new TypeError('ivBuf must be a Buffer');
    if (encryptedBuf.length < TAG_BYTES) throw new RangeError(`encryptedBuf must be at least ${TAG_BYTES} bytes`);
    if (ivBuf.length !== IV_BYTES)       throw new RangeError(`ivBuf must be exactly ${IV_BYTES} bytes`);

    const key        = getKey();
    const authTag    = encryptedBuf.slice(encryptedBuf.length - TAG_BYTES);
    const ciphertext = encryptedBuf.slice(0, encryptedBuf.length - TAG_BYTES);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuf);
    decipher.setAuthTag(authTag);

    return Buffer.concat([
      decipher.update(ciphertext),
      decipher.final()
    ]).toString('utf8');
  }

  return { encrypt, decrypt };
}

// ── Exports ───────────────────────────────────────────────────────────────────

// WordPress encryptor (backward-compat named exports)
const _wp = createEncryptor('WP_ENCRYPTION_KEY');

module.exports = { encrypt: _wp.encrypt, decrypt: _wp.decrypt, createEncryptor };
