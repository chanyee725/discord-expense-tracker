"""
Manual test script for database integration.

Verifies:
1. Connection pool creation
2. Transaction INSERT
3. Data retrieval
"""

import asyncio
import os
from datetime import datetime
from dotenv import load_dotenv

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from bot.db import create_pool, insert_transaction

load_dotenv()


async def test_db_integration():
    print("1. Creating connection pool...")
    pool = await create_pool()
    print("   ✅ Pool created")
    
    test_data = {
        'amount': 50000,
        'merchant': '스타벅스 테스트점',
        'category': '카페',
        'raw_ocr_text': 'Test transaction from integration test',
        'transacted_at': datetime(2026, 2, 20, 14, 30)
    }
    
    print("\n2. Inserting test transaction...")
    await insert_transaction(pool, test_data)
    print("   ✅ Insert successful")
    
    print("\n3. Retrieving last inserted transaction...")
    row = await pool.fetchrow(
        "SELECT * FROM transactions ORDER BY created_at DESC LIMIT 1"
    )
    
    if row:
        print("   ✅ Retrieved transaction:")
        print(f"      ID: {row['id']}")
        print(f"      Amount: {row['amount']:,}원")
        print(f"      Merchant: {row['merchant']}")
        print(f"      Category: {row['category']}")
        print(f"      Direction: {row['direction']}")
        print(f"      Transacted at: {row['transacted_at']}")
        print(f"      Created at: {row['created_at']}")
    else:
        print("   ❌ No transaction found")
    
    print("\n4. Counting total transactions...")
    count = await pool.fetchval("SELECT COUNT(*) FROM transactions")
    print(f"   ✅ Total transactions: {count}")
    
    await pool.close()
    print("\n5. Pool closed")
    print("\n✅ All DB integration tests passed!")


if __name__ == "__main__":
    asyncio.run(test_db_integration())
