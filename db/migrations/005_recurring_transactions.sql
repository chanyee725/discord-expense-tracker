-- Migration: Create recurring_transactions table for recurring transaction templates
-- Purpose: Store templates for transactions that recur on specific dates
-- Date: 2026-02-22

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create recurring_transactions table
CREATE TABLE IF NOT EXISTS recurring_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL DEFAULT 'expense',
    day_of_month INTEGER NOT NULL CHECK (day_of_month >= 1 AND day_of_month <= 31),
    name TEXT NOT NULL,
    amount INTEGER NOT NULL,
    category TEXT,
    bank_account TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Create index on type for filtering by transaction type
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_type 
ON recurring_transactions (type);
