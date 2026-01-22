# Database Migration Required

## Manual Step for Production

The database migration for `postgres_installed` and `mongodb_installed` columns needs to be run manually on the production server.

### Option 1: Via SSH (Recommended)
```bash
ssh deploy@68.183.203.226
sudo su - postgres
psql webserver_db
```

Then run:
```sql
ALTER TABLE servers 
ADD COLUMN IF NOT EXISTS postgres_installed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS mongodb_installed BOOLEAN DEFAULT FALSE;
```

### Option 2: Via Application Code (After Deploy)
```bash
ssh deploy@68.183.203.226
cd ~/server-ui
node -e "require('dotenv').config(); const pool = require('./db'); pool.query('ALTER TABLE servers ADD COLUMN IF NOT EXISTS postgres_installed BOOLEAN DEFAULT FALSE, ADD COLUMN IF NOT EXISTS mongodb_installed BOOLEAN DEFAULT FALSE;').then(() => { console.log('✓ Migration complete'); process.exit(0); }).catch(e => { console.error(e); process.exit(1); });"
```

### Verify Migration
```sql
\d servers
```

Should show:
- `postgres_installed | boolean | default false`
- `mongodb_installed | boolean | default false`

### Status
- ⚠️ **Not yet run on production database**
- Required for database installation feature to work correctly
- Safe to run multiple times (`IF NOT EXISTS` prevents errors)
