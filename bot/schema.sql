-- Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount INTEGER NOT NULL,
    merchant TEXT,
    category TEXT,
    source TEXT,
    direction TEXT NOT NULL DEFAULT 'EXPENSE',
    raw_ocr_text TEXT,
    transacted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
