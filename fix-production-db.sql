-- Fix production database constraints and missing columns
-- Run this on production: psql -U webserver_user -d webserver_db -f fix-production-db.sql

BEGIN;

-- Add missing droplet_name column
ALTER TABLE servers ADD COLUMN IF NOT EXISTS droplet_name VARCHAR(255);

-- Drop old status constraint
ALTER TABLE servers DROP CONSTRAINT IF EXISTS servers_status_check;

-- Add new status constraint with 'failed' and 'deleted'
ALTER TABLE servers ADD CONSTRAINT servers_status_check
  CHECK (status IN ('provisioning', 'running', 'stopped', 'error', 'failed', 'deleted'));

-- Verify
SELECT 'Columns:' as info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'servers' AND column_name = 'droplet_name';

SELECT 'Constraints:' as info;
SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'servers'::regclass AND conname = 'servers_status_check';

COMMIT;

SELECT '✓ Database fixed!' as result;
