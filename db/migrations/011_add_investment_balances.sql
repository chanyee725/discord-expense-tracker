-- Migration: Add deposit_balance and investment_balance columns
-- Purpose: Separate cash deposit and investment evaluation amounts for investment accounts
-- Date: 2026-03-08

ALTER TABLE bank_accounts
ADD COLUMN deposit_balance INTEGER NOT NULL DEFAULT 0;

ALTER TABLE bank_accounts
ADD COLUMN investment_balance INTEGER NOT NULL DEFAULT 0;
