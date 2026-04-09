CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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
