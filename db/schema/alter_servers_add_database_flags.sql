-- Adds database installation flags to servers table
ALTER TABLE servers
  ADD COLUMN IF NOT EXISTS postgres_installed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS mongodb_installed BOOLEAN DEFAULT FALSE;
