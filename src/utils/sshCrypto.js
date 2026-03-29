'use strict';

// src/utils/sshCrypto.js
// Encrypt/decrypt SSH passwords stored in the `servers` table.
//
// Storage layout:
//   servers.ssh_password     TEXT  — hex-encoded [ ciphertext || authTag(16B) ]
//   servers.ssh_password_iv  BYTEA — 12-byte GCM IV
//
// Backward compatibility:
//   Rows provisioned before encryption was enabled have ssh_password_iv = NULL.
//   decryptSshPassword() returns the raw TEXT value unchanged for those rows.
//
// Key setup:
//   SSH_ENCRYPTION_KEY must be a 64-char hex string (32 bytes).
//   Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

const { createEncryptor } = require('./encryption');

let _encryptor = null;
function getEncryptor() {
  if (!_encryptor) _encryptor = createEncryptor('SSH_ENCRYPTION_KEY');
  return _encryptor;
}

/**
 * Encrypt an SSH password for storage.
 *
 * Returns { encrypted: string, iv: Buffer|null }.
 * If SSH_ENCRYPTION_KEY is not set, returns the plaintext unchanged with iv=null
 * (so existing behaviour is preserved in envs that haven't set the key yet).
 *
 * @param {string} plaintext
 * @returns {{ encrypted: string, iv: Buffer|null }}
 */
function encryptSshPassword(plaintext) {
  if (!process.env.SSH_ENCRYPTION_KEY) {
    console.warn('[sshCrypto] SSH_ENCRYPTION_KEY not set — storing SSH password in plaintext');
    return { encrypted: plaintext, iv: null };
  }
  const { encrypt } = getEncryptor();
  const { encrypted, iv } = encrypt(plaintext);
  return { encrypted: encrypted.toString('hex'), iv };
}

/**
 * Decrypt an SSH password read from the database.
 *
 * @param {string}        sshPassword   — value from servers.ssh_password column
 * @param {Buffer|null}   sshPasswordIv — value from servers.ssh_password_iv column
 * @returns {string} plaintext password
 */
function decryptSshPassword(sshPassword, sshPasswordIv) {
  // Legacy plaintext row — iv column is null
  if (!sshPasswordIv) return sshPassword;

  if (!process.env.SSH_ENCRYPTION_KEY) {
    console.error('[sshCrypto] ssh_password_iv is set but SSH_ENCRYPTION_KEY env var is missing — cannot decrypt');
    return sshPassword; // will be wrong, but avoids an unhandled crash
  }

  const { decrypt } = getEncryptor();
  const encryptedBuf = Buffer.from(sshPassword, 'hex');
  const ivBuf = Buffer.isBuffer(sshPasswordIv) ? sshPasswordIv : Buffer.from(sshPasswordIv);
  return decrypt(encryptedBuf, ivBuf);
}

module.exports = { encryptSshPassword, decryptSshPassword };
