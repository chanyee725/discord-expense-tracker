-- Migration: Create bank_accounts table for user bank account storage
-- Purpose: Store bank account details and current balances
-- Date: 2026-02-22

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create bank_accounts table
CREATE TABLE IF NOT EXISTS bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_name TEXT NOT NULL,
    name TEXT NOT NULL,
    balance INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Create index on sort_order for display ordering
CREATE INDEX IF NOT EXISTS idx_bank_accounts_sort_order 
ON bank_accounts (sort_order ASC);
