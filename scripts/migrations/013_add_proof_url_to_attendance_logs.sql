-- Migration 013: Add proof_url column to attendance_logs table
ALTER TABLE attendance_logs ADD COLUMN IF NOT EXISTS proof_url TEXT NULL;
