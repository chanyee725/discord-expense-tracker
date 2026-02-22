-- Migration: Create recurring_transactions table for recurring transaction templates
-- Purpose: Store templates for transactions that recur on specific dates
-- Date: 2026-02-22

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create recurring_transactions table
CREATE TABLE IF NOT EXISTS recurring_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    amount INTEGER NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
    day_of_month INTEGER NOT NULL CHECK (day_of_month >= 1 AND day_of_month <= 31),
    bank_account TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Create index on type for filtering by transaction type
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_type 
ON recurring_transactions (type);

-- Create index on day_of_month for monthly scheduling queries
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_day_of_month 
ON recurring_transactions (day_of_month);

-- Create index on is_active for filtering active recurring items
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_is_active 
ON recurring_transactions (is_active);

-- Create composite index for common query pattern (active + type)
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_active_type 
ON recurring_transactions (is_active, type);
