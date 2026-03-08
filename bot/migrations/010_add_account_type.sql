-- Migration: Add account_type column to bank_accounts
-- Purpose: Distinguish bank accounts from investment accounts
-- Date: 2026-03-08

ALTER TABLE bank_accounts 
ADD COLUMN account_type TEXT NOT NULL DEFAULT 'bank';
