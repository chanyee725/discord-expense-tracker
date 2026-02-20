"""
Database integration for transaction storage.

Uses asyncpg for PostgreSQL connectivity with raw SQL.
"""

import os
from typing import Optional
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


async def insert_transaction(pool: asyncpg.Pool, data: dict) -> None:
    """
    Insert transaction record into database.
    
    Args:
        pool: asyncpg connection pool
        data: Transaction data dict with keys:
              - amount (int, required)
              - merchant (str, optional)
              - category (str, optional)
              - raw_ocr_text (str, optional)
              - transacted_at (datetime, optional)
              
    Note:
        - direction defaults to 'EXPENSE' (schema default)
        - source defaults to NULL (schema allows NULL)
        - created_at auto-set by database
    """
    await pool.execute(
        """
        INSERT INTO transactions (amount, merchant, category, direction, raw_ocr_text, transacted_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        """,
        data.get('amount'),
        data.get('merchant'),
        data.get('category'),
        'EXPENSE',
        data.get('raw_ocr_text'),
        data.get('transacted_at')
    )
