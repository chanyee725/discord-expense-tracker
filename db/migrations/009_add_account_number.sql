-- Migration: Add account_number field to bank_accounts table
-- Purpose: Store account numbers for income/expense classification in Discord bot
-- Date: 2026-02-24

-- Add account_number column (nullable for existing records)
ALTER TABLE bank_accounts
ADD COLUMN IF NOT EXISTS account_number TEXT;

-- Create index for account number lookups
CREATE INDEX IF NOT EXISTS idx_bank_accounts_account_number 
ON bank_accounts (account_number);

-- Add comment
COMMENT ON COLUMN bank_accounts.account_number IS 'Account number for matching transactions from Discord bot';
