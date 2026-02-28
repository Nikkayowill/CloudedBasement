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

// ── Key loading ───────────────────────────────────────────────────────────────

/**
 * Load and validate the encryption key from env.
 * Throws a clear error at startup if the key is missing or malformed
 * so the server refuses to boot rather than silently storing plaintext.
 *
 * @returns {Buffer} 32-byte key
 */
function getKey() {
  const hex = process.env.WP_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      'WP_ENCRYPTION_KEY must be set to a 64-character hex string (32 bytes). ' +
      'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }
  return Buffer.from(hex, 'hex');
}

// ── Encrypt ───────────────────────────────────────────────────────────────────

/**
 * Encrypt a plaintext string with AES-256-GCM.
 *
 * @param {string} plaintext
 * @returns {{ encrypted: Buffer, iv: Buffer }}
 *   encrypted — ciphertext + 16-byte GCM auth tag concatenated (store in BYTEA)
 *   iv        — 12-byte initialization vector (store in separate BYTEA column)
 */
function encrypt(plaintext) {
  const key = getKey();
  const iv  = crypto.randomBytes(IV_BYTES);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ]);
  const authTag = cipher.getAuthTag(); // always 16 bytes for GCM

  // Append auth tag to ciphertext — both are needed to decrypt
  const encrypted = Buffer.concat([ciphertext, authTag]);

  return { encrypted, iv };
}

// ── Decrypt ───────────────────────────────────────────────────────────────────

/**
 * Decrypt a value produced by encrypt().
 * Throws if the auth tag doesn't match (tampered data).
 *
 * @param {Buffer} encryptedBuf — the BYTEA value from the database
 * @param {Buffer} ivBuf        — the IV BYTEA value from the database
 * @returns {string} plaintext
 */
function decrypt(encryptedBuf, ivBuf) {
  const key = getKey();

  // Split off the 16-byte auth tag that was appended during encrypt()
  const authTag    = encryptedBuf.slice(encryptedBuf.length - TAG_BYTES);
  const ciphertext = encryptedBuf.slice(0, encryptedBuf.length - TAG_BYTES);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuf);
  decipher.setAuthTag(authTag);

  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final()   // throws ERR_CRYPTO_GCM_AUTH_TAG_MISMATCH if tampered
  ]);

  return plaintext.toString('utf8');
}

// ── Exports ───────────────────────────────────────────────────────────────────

module.exports = { encrypt, decrypt };
