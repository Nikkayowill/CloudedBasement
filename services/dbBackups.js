const { Client } = require('ssh2');
const pool = require('../db');
const { decryptSshPassword } = require('../src/utils/sshCrypto');
const { sendEmail } = require('./email');
const { BACKUP_RETENTION_DAYS } = require('./backupConfig');

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

/**
 * Run pg_dump or mongodump on a user's server over SSH and store the backup
 * in /root/db-backups/ on the droplet. Keeps the last 7 daily backups.
 * Called by the scheduler (or manually via API). Non-fatal — errors are logged.
 */
async function backupDatabase(server, dbType) {
  const conn = await sshConnect(server);
  try {
    const date  = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const dir   = '/root/db-backups';
    await execSSH(conn, `mkdir -p ${dir}`);

    if (dbType === 'postgres') {
      const dbUser = server.postgres_db_user || 'basement_user';
      const dbName = server.postgres_db_name || 'app_db';
      if (!/^[A-Za-z0-9_]+$/.test(dbUser) || !/^[A-Za-z0-9_]+$/.test(dbName)) {
        throw new Error('Invalid database user or name: only alphanumeric and underscores allowed');
      }
      const file   = `${dir}/pg-${dbName}-${date}.sql.gz`;
      await execSSH(conn, `PGPASSWORD='${server.postgres_db_password.replace(/'/g, "'\\''")}' pg_dump -U ${dbUser} -d ${dbName} | gzip > ${file}`);
      await execSSH(conn, `find ${dir} -name 'pg-${dbName}-*.sql.gz' -mtime +${BACKUP_RETENTION_DAYS} -delete`);
      return { success: true, file };
    }

    if (dbType === 'mongodb') {
      const file = `${dir}/mongo-${date}.tar.gz`;
      const mongoUser     = process.env.MONGO_USER     || server.mongo_user     || '';
      const mongoPassword = process.env.MONGO_PASSWORD || server.mongo_password || '';
      const mongoAuthDb   = process.env.MONGO_AUTH_DB  || 'admin';

      // Validate user and authDb — only alphanumeric and underscores
      if (mongoUser && !/^[A-Za-z0-9_]+$/.test(mongoUser)) {
        throw new Error('Invalid MongoDB user: only alphanumeric and underscores allowed');
      }
      if (!/^[A-Za-z0-9_]+$/.test(mongoAuthDb)) {
        throw new Error('Invalid MongoDB authenticationDatabase: only alphanumeric and underscores allowed');
      }

      let mongodumpCmd = `mongodump --out=${dir}/mongo-dump-${date}`;
      if (mongoUser && mongoPassword) {
        // Pass password via MONGODUMP_PASSWORD env var to avoid shell history exposure
        const escapedPassword = mongoPassword.replace(/'/g, "'\\''");
        mongodumpCmd = `MONGODUMP_PASSWORD='${escapedPassword}' mongodump --out=${dir}/mongo-dump-${date} --username=${mongoUser} --password="$MONGODUMP_PASSWORD" --authenticationDatabase=${mongoAuthDb}`;
      }
      mongodumpCmd += ` && tar czf ${file} -C ${dir} mongo-dump-${date} && rm -rf ${dir}/mongo-dump-${date}`;
      await execSSH(conn, mongodumpCmd);
      await execSSH(conn, `find ${dir} -name 'mongo-*.tar.gz' -mtime +${BACKUP_RETENTION_DAYS} -delete`);
      return { success: true, file };
    }

    return { success: false, error: 'Unknown db type' };
  } finally {
    conn.end();
  }
}

/**
 * Runs scheduled database backups for all servers with DB credentials.
 * Called by the cron in index.js every 24 hours.
 */
async function runScheduledDbBackups() {
  try {
    const result = await pool.query(`
      SELECT s.id, s.ip_address, s.ssh_username, s.ssh_password, s.ssh_password_iv,
             s.postgres_installed, s.postgres_db_user, s.postgres_db_name, s.postgres_db_password,
             s.mongodb_installed,
             u.email
        FROM servers s
        JOIN users u ON u.id = s.user_id
       WHERE s.status = 'running'
         AND (s.postgres_installed = TRUE OR s.mongodb_installed = TRUE)
    `);

    for (const server of result.rows) {
      if (server.postgres_installed && server.postgres_db_password) {
        try {
          await backupDatabase(server, 'postgres');
          console.log(`[DB-Backup] Postgres backup OK — server ${server.id}`);
        } catch (err) {
          console.error(`[DB-Backup] Postgres backup failed — server ${server.id}:`, err.message);
          if (server.email) {
            sendEmail(
              server.email,
              '⚠️ PostgreSQL scheduled backup failed',
              `<p>Your scheduled PostgreSQL backup failed.</p><p><strong>Error:</strong> ${err.message}</p><p>Please check your server health or contact support.</p>`,
              `Your scheduled PostgreSQL backup failed.\n\nError: ${err.message}\n\nPlease check your server health or contact support.`
            ).catch(() => {});
          }
        }
      }
      if (server.mongodb_installed) {
        try {
          await backupDatabase(server, 'mongodb');
          console.log(`[DB-Backup] MongoDB backup OK — server ${server.id}`);
        } catch (err) {
          console.error(`[DB-Backup] MongoDB backup failed — server ${server.id}:`, err.message);
          if (server.email) {
            sendEmail(
              server.email,
              '⚠️ MongoDB scheduled backup failed',
              `<p>Your scheduled MongoDB backup failed.</p><p><strong>Error:</strong> ${err.message}</p><p>Please check your server health or contact support.</p>`,
              `Your scheduled MongoDB backup failed.\n\nError: ${err.message}\n\nPlease check your server health or contact support.`
            ).catch(() => {});
          }
        }
      }
    }
  } catch (err) {
    console.error('[DB-Backup] Scheduler error:', err.message);
  }
}

/**
 * Trigger a backup for a specific user's server on-demand.
 * Returns { success, message } — used by the dashboard API.
 */
async function triggerBackup(userId, dbType) {
  if (!['postgres', 'mongodb'].includes(dbType)) return { success: false, error: 'Unknown db type' };
  const result = await pool.query(
    `SELECT s.*, u.email
       FROM servers s
       JOIN users u ON u.id = s.user_id
      WHERE s.user_id = $1 AND s.status = 'running' LIMIT 1`,
    [userId]
  );
  const server = result.rows[0];
  if (!server) return { success: false, error: 'No running server found.' };
  if (dbType === 'postgres' && !server.postgres_installed) return { success: false, error: 'PostgreSQL not installed on this server.' };
  if (dbType === 'mongodb'  && !server.mongodb_installed)  return { success: false, error: 'MongoDB not installed on this server.' };

  try {
    const { file } = await backupDatabase(server, dbType);
    const label = dbType === 'postgres' ? 'PostgreSQL' : 'MongoDB';
    setImmediate(async () => {
      try {
        const text = `Your ${label} database backup completed successfully.\n\nFile stored on your server at: ${file}\n\nBackups older than 7 days are automatically removed.`;
        const html = `<p>Your <strong>${label}</strong> database backup completed successfully.</p><p>File stored on your server at: <code>${file}</code></p><p>Backups older than 7 days are automatically removed.</p>`;
        await sendEmail(server.email, `✅ ${label} backup completed`, html, text);
      } catch (emailErr) {
        console.error('[DB-Backup] Failed to send backup notification email:', emailErr.message);
      }
    });
    return { success: true, message: `Backup saved to ${file}` };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

module.exports = { runScheduledDbBackups, triggerBackup };
