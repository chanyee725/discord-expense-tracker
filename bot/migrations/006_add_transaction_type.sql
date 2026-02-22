-- Migration: Add type column to transactions table
-- Purpose: Distinguish between income (수입) and expense (지출) transactions
-- Date: 2026-02-23

-- Add type column to transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS type TEXT;

-- Set default value for existing rows (지출 as default)
UPDATE transactions SET type = '지출' WHERE type IS NULL;
