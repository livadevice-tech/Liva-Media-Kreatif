-- ==========================================================
-- Migration 006
-- Add dashboard_settings to client_brands
-- ==========================================================

ALTER TABLE client_brands
ADD COLUMN dashboard_settings JSON NULL;
