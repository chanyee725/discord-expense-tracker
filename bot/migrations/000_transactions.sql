-- Migration: Create transactions table for storing all financial transactions
-- Purpose: Core table for recording income and expenses from Discord bot or manual entry
-- Date: 2026-04-07

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    amount INTEGER NOT NULL,
    category TEXT,
    deposit_destination TEXT,
    withdrawal_source TEXT,
    transaction_date TEXT,
    raw_ocr_text TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Create index on transaction_date for time-based queries
CREATE INDEX IF NOT EXISTS idx_transactions_date 
ON transactions (transaction_date DESC);

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_transactions_category 
ON transactions (category);
