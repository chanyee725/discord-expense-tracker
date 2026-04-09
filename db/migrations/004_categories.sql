-- Migration: Create categories table for expense and income categories
-- Purpose: Store category definitions with type (expense, income, both)
-- Date: 2026-02-22

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('expense', 'income', 'both')),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Create index on type for filtering by category type
CREATE INDEX IF NOT EXISTS idx_categories_type 
ON categories (type);

-- Create index on sort_order for display ordering
CREATE INDEX IF NOT EXISTS idx_categories_sort_order 
ON categories (sort_order);

-- Seed default categories (16 expense, 1 both, 3 income)
INSERT INTO categories (name, type, sort_order)
VALUES 
    ('식비', 'expense', 1),
    ('쇼핑', 'expense', 2),
    ('장보기', 'expense', 3),
    ('공과금', 'expense', 4),
    ('문화생활', 'expense', 5),
    ('의료', 'expense', 6),
    ('교통', 'expense', 7),
    ('구독료', 'expense', 8),
    ('생활용품', 'expense', 9),
    ('선물', 'expense', 10),
    ('여행', 'expense', 11),
    ('주거', 'expense', 12),
    ('통신', 'expense', 13),
    ('보험', 'expense', 14),
    ('교육', 'expense', 15),
    ('기타', 'both', 16),
    ('월급', 'income', 17),
    ('부수입', 'income', 18),
    ('이자', 'income', 19),
    ('기타수입', 'income', 20)
ON CONFLICT (name) DO NOTHING;
