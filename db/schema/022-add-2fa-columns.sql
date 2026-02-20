-- 022-add-2fa-columns.sql
-- Adds TOTP 2FA support to users table
ALTER TABLE users
ADD COLUMN twofa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN twofa_secret TEXT;
