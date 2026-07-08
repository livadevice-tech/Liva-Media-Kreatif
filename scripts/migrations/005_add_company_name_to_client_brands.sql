-- ==========================================================
-- Migration 005
-- Add company_name to client_brands
-- ==========================================================

ALTER TABLE client_brands
ADD COLUMN company_name VARCHAR(150) NULL AFTER name;
