-- Migration: Create recurring_transaction_log table for tracking generated transactions
-- Purpose: Store log of generated recurring transactions to prevent duplicate generation
-- Date: 2026-02-23

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create recurring_transaction_log table
CREATE TABLE IF NOT EXISTS recurring_transaction_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recurring_transaction_id UUID NOT NULL REFERENCES recurring_transactions(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    generated_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE(recurring_transaction_id, year, month)
);

-- Create index on recurring_transaction_id for quick lookups
CREATE INDEX IF NOT EXISTS idx_recurring_transaction_log_recurring_id
ON recurring_transaction_log (recurring_transaction_id);

-- Create index on (year, month) for periodic queries
CREATE INDEX IF NOT EXISTS idx_recurring_transaction_log_year_month
ON recurring_transaction_log (year, month);
