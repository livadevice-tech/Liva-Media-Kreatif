-- Migration 016: Add plain_password column to admin_accounts
ALTER TABLE admin_accounts ADD COLUMN IF NOT EXISTS plain_password VARCHAR(255) NULL AFTER password_hash;

