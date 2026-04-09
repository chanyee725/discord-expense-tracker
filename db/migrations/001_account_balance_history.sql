-- Migration: Create account_balance_history table for monthly bank account snapshots
-- Purpose: Store monthly balance snapshots to track asset growth over time
-- Date: 2026-02-22

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create account_balance_history table
CREATE TABLE IF NOT EXISTS account_balance_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL,
    account_name TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    balance INTEGER NOT NULL,
    snapshot_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Create index on snapshot_date for time-series queries (latest first)
CREATE INDEX IF NOT EXISTS idx_account_balance_history_snapshot_date 
ON account_balance_history (snapshot_date DESC);

-- Create index on account_id for filtering by specific account
CREATE INDEX IF NOT EXISTS idx_account_balance_history_account_id 
ON account_balance_history (account_id);

-- Create unique constraint to prevent duplicate snapshots for same account and date
CREATE UNIQUE INDEX IF NOT EXISTS idx_account_balance_history_unique_snapshot 
ON account_balance_history (account_id, snapshot_date);

-- Create composite index for common query pattern (account + date range)
CREATE INDEX IF NOT EXISTS idx_account_balance_history_account_snapshot 
ON account_balance_history (account_id, snapshot_date DESC);
