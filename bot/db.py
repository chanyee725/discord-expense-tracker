"""
Database integration for transaction storage.

Uses asyncpg for PostgreSQL connectivity with raw SQL.
"""

import os
from typing import Any
import asyncpg


async def create_pool() -> asyncpg.Pool:
    """
    Create asyncpg connection pool.
    
    Returns:
        asyncpg.Pool instance
        
    Raises:
        ValueError: If DATABASE_URL not set
    """
    dsn = os.getenv('DATABASE_URL')
    if not dsn:
        raise ValueError("DATABASE_URL environment variable not set")
    
    return await asyncpg.create_pool(dsn)


async def insert_transaction(pool: asyncpg.Pool, data: dict[str, Any]) -> None:
    """
    Insert transaction record into database.
    
    Args:
        pool: asyncpg connection pool
        data: Transaction data dict from Gemini JSON with keys:
              - title (str, optional): Transaction title
              - amount (int or str, required): Transaction amount (coerced to int)
              - category (str, optional): Transaction category
              - deposit_destination (str, optional): Deposit destination account
              - withdrawal_source (str, optional): Withdrawal source account
              - transaction_date (str, optional): Transaction date as Korean string
              - raw_ocr_text (str, optional): Raw OCR text for debugging
              
    Note:
        - amount coerced to int to handle Gemini string/int variation
        - created_at auto-set by database with now()
        - All fields use .get() with defaults to handle missing keys gracefully
    """
    await pool.execute(
        """
        INSERT INTO transactions (title, amount, category, deposit_destination, withdrawal_source, transaction_date, raw_ocr_text)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        """,
        data.get('title'),
        int(data.get('amount', 0)),
        data.get('category'),
        data.get('deposit_destination'),
        data.get('withdrawal_source'),
        data.get('transaction_date'),
        data.get('raw_ocr_text')
    )
