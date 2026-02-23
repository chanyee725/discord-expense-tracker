-- Migration: Reconcile recurring_transactions schema with application code
-- Purpose: Fix mismatch between initial migration and current code expectations
-- The table was created with "name" column but application code uses "title"
-- The "is_active" column was missing and needs to be added
-- Date: 2026-02-23

-- Idempotent RENAME: only rename if "name" column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'recurring_transactions' AND column_name = 'name'
  ) THEN
    ALTER TABLE recurring_transactions RENAME COLUMN name TO title;
  END IF;
END $$;

ALTER TABLE recurring_transactions ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
