// services/backupRestore.js
// Lists available backup files and executes restore operations on the user's
// server over SSH. Restore jobs are tracked in the restore_jobs table.
//
// Restore is destructive — the existing database is dropped and recreated.
// The caller must confirm intent before calling restoreDatabase().

'use strict';

const crypto = require('crypto');
const { Client } = require('ssh2');
const pool = require('../db');
const { decryptSshPassword } = require('../src/utils/sshCrypto');

// ── SSH helpers (mirrored from dbBackups.js) ──────────────────────────────────

function execSSH(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = '', errOut = '';
      stream.on('data', d => { out += d; });
      stream.stderr.on('data', d => { errOut += d; });
      stream.on('close', code => {
        if (code !== 0) return reject(new Error(errOut.trim() || `Exit code ${code}`));
        resolve(out.trim());
      });
    });
  });
}

function shQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function normalizeBackupFilePath(backupFile, dbType) {
  if (!backupFile || typeof backupFile !== 'string') {
    throw new Error('Invalid backup file path');
  }

  const fileName = backupFile.trim().split('/').filter(Boolean).pop();
  if (!fileName) {
    throw new Error('Invalid backup file path');
  }

  const pgPattern = /^pg-[A-Za-z0-9_-]+-\d{4}-\d{2}-\d{2}\.sql\.gz$/;
  const mongoPattern = /^mongo-\d{4}-\d{2}-\d{2}\.tar\.gz$/;

  if (dbType === 'postgres' && !pgPattern.test(fileName)) {
    throw new Error('Invalid PostgreSQL backup filename');
  }

  if (dbType === 'mongodb' && !mongoPattern.test(fileName)) {
    throw new Error('Invalid MongoDB backup filename');
  }

  if (dbType !== 'postgres' && dbType !== 'mongodb') {
    throw new Error('Unknown db type');
  }

  return `/root/db-backups/${fileName}`;
}

function sshConnect(server) {
  const conn = new Client();
  return new Promise((resolve, reject) => {
    conn.on('ready', () => resolve(conn));
    conn.on('error', reject);
    conn.connect({
      host: server.ip_address,
      port: 22,
      username: server.ssh_username || 'root',
      password: decryptSshPassword(server.ssh_password, server.ssh_password_iv),
      readyTimeout: 20000,
    });
  });
}

// ── Server lookup ─────────────────────────────────────────────────────────────

async function getRunningServer(userId) {
  const result = await pool.query(
    `SELECT s.*
       FROM servers s
      WHERE s.user_id = $1 AND s.status = 'running'
      LIMIT 1`,
    [userId]
  );
  return result.rows[0] || null;
}

// ── List available backups ────────────────────────────────────────────────────

/**
 * SSH into the user's server, list backup files under /root/db-backups/,
 * and return them sorted newest-first.
 *
 * Each entry: { file, dbType, date, sizeBytes }
 */
async function listBackups(userId) {
  const server = await getRunningServer(userId);
  if (!server) return { success: false, error: 'No running server found.' };

  const conn = await sshConnect(server);
  try {
    const raw = await execSSH(
      conn,
      "ls -1t /root/db-backups/ 2>/dev/null | grep -E '\\.(sql\\.gz|tar\\.gz)$' || true"
    );
    if (!raw) return { success: true, backups: [] };

    const sizeRaw = await execSSH(
      conn,
      "ls -1st /root/db-backups/ 2>/dev/null | grep -E '\\.(sql\\.gz|tar\\.gz)$' || true"
    );

    const sizeMap = {};
    for (const line of sizeRaw.split('\n')) {
      const m = line.trim().match(/^(\d+)\s+(.+)$/);
      if (m) sizeMap[m[2].trim()] = parseInt(m[1], 10) * 512;
    }

    const backups = raw.split('\n').filter(Boolean).map(name => {
      name = name.trim();
      const isPg    = name.startsWith('pg-');
      const isMongo = name.startsWith('mongo-');
      const dateM   = name.match(/(\d{4}-\d{2}-\d{2})/);
      return {
        file:      `/root/db-backups/${name}`,
        name,
        dbType:    isPg ? 'postgres' : isMongo ? 'mongodb' : 'unknown',
        date:      dateM ? dateM[1] : null,
        sizeBytes: sizeMap[name] || null,
      };
    }).filter(b => b.dbType !== 'unknown');

    return { success: true, backups };
  } finally {
    conn.end();
  }
}

// ── Execute restore ───────────────────────────────────────────────────────────

/**
 * Runs the actual pg_restore or mongorestore command over SSH.
 * Called from within the job runner — job row must already exist and be 'running'.
 */
async function _executeRestore(server, backupFile, dbType) {
  const normalizedBackupFile = normalizeBackupFilePath(backupFile, dbType);

  const conn = await sshConnect(server);
  try {
    if (dbType === 'postgres') {
      const dbUser = server.postgres_db_user || 'basement_user';
      const dbName = server.postgres_db_name || 'app_db';
      if (!/^[A-Za-z0-9_]+$/.test(dbUser) || !/^[A-Za-z0-9_]+$/.test(dbName)) {
        throw new Error('Invalid database user or name');
      }
      const quotedPwd = shQuote(server.postgres_db_password || '');
      const quotedBackupPath = shQuote(normalizedBackupFile);
      // Drop + recreate, then restore. Runs as the DB owner — requires superuser or same-role.
      await execSSH(conn, [
        `PGPASSWORD=${quotedPwd}`,
        `psql -U ${dbUser} -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='${dbName}' AND pid<>pg_backend_pid();"`,
        `2>/dev/null; PGPASSWORD=${quotedPwd}`,
        `dropdb -U ${dbUser} --if-exists ${dbName}`,
        `&& PGPASSWORD=${quotedPwd}`,
        `createdb -U ${dbUser} ${dbName}`,
        `&& gunzip -c ${quotedBackupPath} | PGPASSWORD=${quotedPwd} psql -U ${dbUser} -d ${dbName}`,
      ].join(' '));
    } else if (dbType === 'mongodb') {
      const mongoUser     = process.env.MONGO_USER     || server.mongo_user     || '';
      const mongoPassword = process.env.MONGO_PASSWORD || server.mongo_password || '';
      const mongoAuthDb   = process.env.MONGO_AUTH_DB  || 'admin';

      if (mongoUser && !/^[A-Za-z0-9_]+$/.test(mongoUser)) throw new Error('Invalid MongoDB user');
      if (!/^[A-Za-z0-9_]+$/.test(mongoAuthDb)) throw new Error('Invalid MongoDB authenticationDatabase');

      const tmpDir = `/tmp/mongo-restore-${Date.now()}`;
      const quotedTmpDir = shQuote(tmpDir);
      const quotedBackupPath = shQuote(normalizedBackupFile);
      let restoreCmd = [
        `mkdir -p ${quotedTmpDir}`,
        `&& tar xzf ${quotedBackupPath} -C ${quotedTmpDir}`,
      ];

      if (mongoUser && mongoPassword) {
        const quotedPwd = shQuote(mongoPassword);
        restoreCmd.push(
          `&& MONGORESTORE_PASSWORD=${quotedPwd} mongorestore --drop --dir=${quotedTmpDir}`,
          `--username=${mongoUser} --password="$MONGORESTORE_PASSWORD"`,
          `--authenticationDatabase=${mongoAuthDb}`
        );
      } else {
        restoreCmd.push(`&& mongorestore --drop --dir=${quotedTmpDir}`);
      }
      restoreCmd.push(`; rm -rf ${quotedTmpDir}`);
      await execSSH(conn, restoreCmd.join(' '));
    } else {
      throw new Error('Unknown db type');
    }
  } finally {
    conn.end();
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Creates a restore_jobs row and runs the restore asynchronously.
 * Returns { success: true, jobId } immediately — poll /api/backups/restore-status/:id.
 */
async function initiateRestore(userId, backupFile, dbType) {
  if (!['postgres', 'mongodb'].includes(dbType)) {
    return { success: false, error: 'db_type must be postgres or mongodb' };
  }
  if (!backupFile || typeof backupFile !== 'string') {
    return { success: false, error: 'backup_file is required' };
  }

  const server = await getRunningServer(userId);
  if (!server) return { success: false, error: 'No running server found.' };

  if (dbType === 'postgres' && !server.postgres_installed) {
    return { success: false, error: 'PostgreSQL not installed on this server.' };
  }
  if (dbType === 'mongodb' && !server.mongodb_installed) {
    return { success: false, error: 'MongoDB not installed on this server.' };
  }

  const idempotencyKey = crypto
    .createHash('sha256')
    .update(`${userId}:${backupFile}:${Date.now()}`)
    .digest('hex');

  const ins = await pool.query(
    `INSERT INTO restore_jobs (user_id, server_id, backup_file, db_type, idempotency_key)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [userId, server.id, backupFile, dbType, idempotencyKey]
  );
  const jobId = ins.rows[0].id;

  // Run restore in background — do not await
  setImmediate(async () => {
    try {
      await pool.query(
        `UPDATE restore_jobs SET status = 'running', started_at = NOW() WHERE id = $1`,
        [jobId]
      );
      await _executeRestore(server, backupFile, dbType);
      await pool.query(
        `UPDATE restore_jobs SET status = 'success', finished_at = NOW() WHERE id = $1`,
        [jobId]
      );
      console.log(`[BackupRestore] Job ${jobId} succeeded (${dbType} — ${backupFile})`);
    } catch (err) {
      await pool.query(
        `UPDATE restore_jobs SET status = 'failed', finished_at = NOW(), error_message = $2 WHERE id = $1`,
        [jobId, err.message]
      );
      console.error(`[BackupRestore] Job ${jobId} failed:`, err.message);
    }
  });

  return { success: true, jobId };
}

/**
 * Returns the current status of a restore job belonging to the user.
 */
async function getRestoreJobStatus(userId, jobId) {
  const result = await pool.query(
    `SELECT id, backup_file, db_type, status, error_message, initiated_at, started_at, finished_at
       FROM restore_jobs
      WHERE id = $1 AND user_id = $2`,
    [jobId, userId]
  );
  if (!result.rows[0]) return null;
  return result.rows[0];
}

/**
 * Returns the N most recent restore jobs for a user.
 */
async function listRestoreJobs(userId, limit = 10) {
  const result = await pool.query(
    `SELECT id, backup_file, db_type, status, error_message, initiated_at, started_at, finished_at
       FROM restore_jobs
      WHERE user_id = $1
      ORDER BY initiated_at DESC
      LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}

module.exports = {
  listBackups,
  initiateRestore,
  getRestoreJobStatus,
  listRestoreJobs,
  _executeRestore,
  normalizeBackupFilePath,
};
