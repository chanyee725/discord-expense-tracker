"""
Database integration for transaction storage.

Uses asyncpg for PostgreSQL connectivity with raw SQL.
"""

import os
import re
from datetime import datetime
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


def parse_korean_date(date_str: str) -> datetime | None:
    """
    Parse Korean date format to datetime.
    
    Formats supported:
    - "2026년 2월 22일" (with year)
    - "2월 22일" (no year, uses current year)
    - "02월 22일" (with leading zeros)
    
    Args:
        date_str: Korean date string from Gemini
        
    Returns:
        datetime object at midnight of the date, or None if parsing fails
        
    Examples:
        >>> parse_korean_date("2월 22일")
        datetime(2026, 2, 22, 0, 0)
        >>> parse_korean_date("2026년 2월 22일")
        datetime(2026, 2, 22, 0, 0)
        >>> parse_korean_date(None)
        None
    """
    if not date_str:
        return None
    
    try:
        # Pattern 1: "2026년 2월 22일" (with year)
        match = re.search(r'(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일', date_str)
        if match:
            year, month, day = match.groups()
            return datetime(int(year), int(month), int(day))
        
        # Pattern 2: "2월 22일" (no year, use current year)
        match = re.search(r'(\d{1,2})월\s*(\d{1,2})일', date_str)
        if match:
            month, day = match.groups()
            current_year = datetime.now().year
            return datetime(current_year, int(month), int(day))
        
        return None
    except (ValueError, AttributeError):
        return None


async def check_duplicate_transaction(
    pool: asyncpg.Pool, 
    data: dict[str, Any]
) -> bool:
    """
    Check if a duplicate transaction exists for the same date.
    
    Duplicate criteria:
    - Same transaction_date (exact match)
    - Same amount
    - Same category
    - Same deposit_destination OR withdrawal_source (either one matches)
    
    Args:
        pool: asyncpg connection pool
        data: Transaction data dict from Gemini JSON
        
    Returns:
        True if duplicate found, False otherwise
    """
    result = await pool.fetchrow(
        """
        SELECT id FROM transactions
        WHERE transaction_date = $1
          AND amount = $2
          AND category = $3
          AND (
              deposit_destination = $4 
              OR withdrawal_source = $5
          )
        LIMIT 1
        """,
        data.get('transaction_date'),
        int(data.get('amount', 0)),
        data.get('category'),
        data.get('deposit_destination'),
        data.get('withdrawal_source')
    )
    
    return result is not None


async def insert_transaction(pool: asyncpg.Pool, data: dict[str, Any]) -> None:
    """
    Insert transaction record into database.
    
    Args:
        pool: asyncpg connection pool
        data: Transaction data dict from Gemini JSON with keys:
              - title (str, optional): Transaction title
              - amount (int or str, required): Transaction amount (coerced to int)
              - type (str, required): Transaction type ("지출" or "수입")
              - category (str, optional): Transaction category
              - deposit_destination (str, optional): Deposit destination account
              - withdrawal_source (str, optional): Withdrawal source account
              - transaction_date (str, optional): Transaction date as Korean string
              - raw_ocr_text (str, optional): Raw OCR text for debugging
              
    Note:
        - amount coerced to int to handle Gemini string/int variation
        - created_at auto-set by database with now()
        - All fields use .get() with defaults to handle missing keys gracefully
        - Automatically updates bank_accounts.balance for linked accounts
    """
    amount = int(data.get('amount', 0))
    trans_type = data.get('type')
    withdrawal_source = data.get('withdrawal_source')
    deposit_destination = data.get('deposit_destination')
    
    parsed_date = parse_korean_date(data.get('transaction_date') or '')
    if not parsed_date:
        parsed_date = datetime.now()
    
    await pool.execute(
        """
        INSERT INTO transactions (title, amount, type, category, deposit_destination, withdrawal_source, transaction_date, raw_ocr_text, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        """,
        data.get('title'),
        amount,
        trans_type,
        data.get('category'),
        deposit_destination,
        withdrawal_source,
        data.get('transaction_date'),
        data.get('raw_ocr_text'),
        parsed_date
    )
    
    if trans_type == '지출' and withdrawal_source:
        await pool.execute(
            """
            UPDATE bank_accounts
            SET balance = balance - $1, updated_at = now()
            WHERE name = $2
            """,
            amount, withdrawal_source
        )
    
    if trans_type == '수입' and deposit_destination:
        await pool.execute(
            """
            UPDATE bank_accounts
            SET balance = balance + $1, updated_at = now()
            WHERE name = $2
            """,
            amount, deposit_destination
        )
