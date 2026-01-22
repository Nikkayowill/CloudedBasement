# Database Backup System

**Last Updated:** January 22, 2026  
**Status:** ✅ Active and Automated

---

## Overview

Automated daily backups of the production PostgreSQL database to protect against data loss. Backups run every day at 2:00 AM UTC and retain the last 7 days of history.

---

## Backup Configuration

### Location
- **Server:** 68.183.203.226 (production)
- **Backup Directory:** `/home/deploy/backups/`
- **Script:** `/home/deploy/backup-basement-db.sh`

### Schedule
- **Frequency:** Daily at 2:00 AM UTC
- **Method:** Cron job (`crontab -e` on deploy user)
- **Retention:** 7 days (older backups auto-deleted)

### What's Backed Up
- Database: `webserver_db`
- All tables:
  - `users` (accounts, emails, passwords)
  - `payments` (Stripe transactions)
  - `servers` (customer VPS assignments)
  - `deployments` (Git deployment history)
  - `domains` (custom domain configurations)
  - `support_tickets` (customer support requests)
  - `session` (active user sessions)

---

## Backup Script

**File:** `/home/deploy/backup-basement-db.sh`

```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$HOME/backups"
mkdir -p $BACKUP_DIR

# Source environment variables
if [ -f ~/server-ui/.env ]; then
    export $(grep -v '^#' ~/server-ui/.env | xargs)
fi

PGPASSWORD="$DB_PASSWORD" pg_dump -U "$DB_USER" -h "$DB_HOST" "$DB_NAME" > $BACKUP_DIR/backup_$TIMESTAMP.sql 2>&1

if [ $? -eq 0 ] && [ -s $BACKUP_DIR/backup_$TIMESTAMP.sql ]; then
    SIZE=$(du -h $BACKUP_DIR/backup_$TIMESTAMP.sql | cut -f1)
    echo "$(date): ✅ Backup completed - backup_$TIMESTAMP.sql ($SIZE)" >> $BACKUP_DIR/backup.log
else
    echo "$(date): ❌ Backup failed" >> $BACKUP_DIR/backup.log
fi

# Delete backups older than 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

---

## Database Credentials

**⚠️ Credentials stored in:** `/home/deploy/server-ui/.env`

**Access credentials:**
- Database: `webserver_db`
- User: `webserver_user`
- Password: *Stored in `.env` file on production server*
- Host: `localhost`
- Port: `5432`

**Security:**
- `.env` file is **NOT** in git (gitignored)
- Only accessible by `deploy` user on production server
- Password is 32-character secure random string
- Never share these credentials
- Change immediately if compromised

**To get credentials when needed:**
```bash
ssh deploy@68.183.203.226
grep DB_PASSWORD ~/server-ui/.env
```

---

## How to Restore a Backup

### If Database Gets Corrupted/Deleted

**SSH into production:**
```bash
ssh deploy@68.183.203.226
cd ~/backups
ls -lht backup_*.sql | head -5  # View recent backups
```

**Choose backup to restore:**
```bash
# Stop the application first
cd ~/server-ui
pm2 stop cloudedbasement

# Restore database (password from .env)
export $(grep -v '^#' ~/server-ui/.env | xargs)
PGPASSWORD="$DB_PASSWORD" psql -U webserver_user -h localhost webserver_db < ~/backups/backup_YYYYMMDD_HHMMSS.sql

# Restart application
pm2 start cloudedbasement
pm2 logs cloudedbasement
```

**Test restoration worked:**
```bash
export $(grep -v '^#' ~/server-ui/.env | xargs)
PGPASSWORD="$DB_PASSWORD" psql -U webserver_user -h localhost webserver_db -c "SELECT COUNT(*) FROM users;"
```

---

## Manual Backup

**If you need to backup before a risky operation:**
```bash
ssh deploy@68.183.203.226
~/backup-basement-db.sh
```

**Verify backup:**
```bash
ls -lh ~/backups/backup_*.sql | tail -1
cat ~/backups/backup.log | tail -1
```

---

## Monitoring Backups

### Check if backups are running:
```bash
ssh deploy@68.183.203.226
crontab -l | grep backup  # Confirm cron job exists
cat ~/backups/backup.log | tail -10  # View recent backup attempts
```

### Expected output:
```
Thu Jan 22 14:49:56 UTC 2026: ✅ Backup completed - backup_20260122_144956.sql (28K)
```

### If backup failed:
- Check log: `cat ~/backups/backup.log`
- Check database is running: `systemctl status postgresql`
- Test manually: `~/backup-basement-db.sh`
- Check credentials in `.env` file

---

## Backup Size Guidelines

**Current size:** ~28KB (small test database)

**Expected growth:**
- 10 users: ~100KB
- 50 users: ~500KB
- 100 users: ~1-2MB
- 500 users: ~5-10MB

**Storage available:** 8.65GB on production server (plenty of room)

---

## Important Notes

1. **7-day retention only** - If you need older backups, copy them elsewhere
2. **No off-site backup** - Backups are on same server (single point of failure)
3. **No encryption** - Backup files are plain SQL (secure server access only)
4. **Manual restore required** - No automatic restore process yet

---

## Future Improvements

### High Priority
- [ ] Off-site backup to AWS S3 or DigitalOcean Spaces
- [ ] Automated restore testing (verify backups actually work)
- [ ] Email alerts if backup fails

### Medium Priority
- [ ] Encrypted backups (GPG)
- [ ] 30-day retention for important milestones
- [ ] Backup before major migrations

### Low Priority
- [ ] Point-in-time recovery (WAL archiving)
- [ ] Multiple backup locations (geo-redundancy)

---

## Disaster Recovery Scenarios

### Scenario 1: Accidental DELETE query
**Impact:** Some data deleted but database intact  
**Solution:** Restore from most recent backup (max 24hr data loss)  
**Time:** 5-10 minutes

### Scenario 2: Database corruption
**Impact:** Database won't start  
**Solution:** Restore from last working backup  
**Time:** 10-15 minutes

### Scenario 3: Server hard drive failure
**Impact:** ALL data lost (no off-site backup yet)  
**Solution:** Restore from off-site backup (NOT IMPLEMENTED)  
**Time:** N/A - data loss permanent ⚠️

### Scenario 4: Hacked/ransomware
**Impact:** Database encrypted or deleted  
**Solution:** Restore from backup before attack  
**Time:** 15-30 minutes

---

## Contact for Issues

If backups fail or you need help restoring:
1. Check backup log first: `ssh deploy@68.183.203.226 'cat ~/backups/backup.log'`
2. Test manual backup: `ssh deploy@68.183.203.226 '~/backup-basement-db.sh'`
3. If still broken, restore from known-good backup

---

## Backup History

| Date | Action | Notes |
|------|--------|-------|
| Jan 22, 2026 | Initial setup | 7-day retention, daily at 2 AM UTC |
| Jan 22, 2026 | First successful backup | 28KB backup file created |

