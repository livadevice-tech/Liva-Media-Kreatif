-- Migration 013: Add proof_url column to attendance_logs table
ALTER TABLE attendance_logs ADD COLUMN proof_url TEXT NULL;
