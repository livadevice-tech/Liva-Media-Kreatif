-- Migration 014: Add proof_image column to attendance_logs table
ALTER TABLE attendance_logs ADD COLUMN IF NOT EXISTS proof_image LONGTEXT NULL;
