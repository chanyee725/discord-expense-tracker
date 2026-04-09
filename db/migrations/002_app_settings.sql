-- Migration: Create app_settings table for application configuration
-- Purpose: Store application-wide configuration as key-value pairs
-- Date: 2026-02-22

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create app_settings table
CREATE TABLE IF NOT EXISTS app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Create index on key for fast lookups
CREATE INDEX IF NOT EXISTS idx_app_settings_key 
ON app_settings (key);

-- Seed default configuration values
INSERT INTO app_settings (key, value)
VALUES 
    ('monthly_budget', '2000000')
ON CONFLICT (key) DO NOTHING;
