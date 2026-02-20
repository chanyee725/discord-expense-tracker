"""
Toss transaction text parser.

Extracts structured transaction data from OCR text of Toss receipt images.
"""

import re
from datetime import datetime
from typing import Optional


def parse_toss_transaction(text: str) -> Optional[dict]:
    """
    Parse Toss transaction text and extract structured data.
    
    Args:
        text: Raw OCR text from Toss receipt image
        
    Returns:
        dict with keys: amount (int), merchant (str), transacted_at (datetime), raw_ocr_text (str)
        Returns None if parsing completely fails (no amount found)
        
    Note:
        - Amount extraction is required (returns None if not found)
        - Datetime and merchant are optional (can be None in result)
        - Always includes raw_ocr_text for debugging
    """
    if not text or not text.strip():
        return None
    
    result = {
        'raw_ocr_text': text,
        'amount': None,
        'merchant': None,
        'transacted_at': None
    }
    
    # Extract amount (required)
    # Pattern: "50,000원" or "1,500원" or "500원"
    amount_pattern = r'([\d,]+)\s*원'
    amount_match = re.search(amount_pattern, text)
    
    if amount_match:
        amount_str = amount_match.group(1).replace(',', '')
        try:
            result['amount'] = int(amount_str)
        except ValueError:
            # If amount parsing fails, treat as complete failure
            return None
    else:
        # No amount found = parsing failed
        return None
    
    # Extract datetime (optional)
    # Pattern: "2026.02.20 14:30" or "2026/02/20 14:30"
    datetime_pattern = r'(\d{4})[\./](\d{1,2})[\./](\d{1,2})\s+(\d{1,2}):(\d{2})'
    datetime_match = re.search(datetime_pattern, text)
    
    if datetime_match:
        try:
            year = int(datetime_match.group(1))
            month = int(datetime_match.group(2))
            day = int(datetime_match.group(3))
            hour = int(datetime_match.group(4))
            minute = int(datetime_match.group(5))
            result['transacted_at'] = datetime(year, month, day, hour, minute)
        except (ValueError, OverflowError):
            # Invalid datetime values, leave as None
            pass
    
    # Extract merchant (optional, heuristic-based)
    # Toss format typically has merchant name above amount line
    # Simple heuristic: Look for non-empty lines before amount line
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    if amount_match and lines:
        # Find the line containing the amount
        amount_text = amount_match.group(0)
        for i, line in enumerate(lines):
            if amount_text in line:
                # Merchant is typically the line before amount
                if i > 0:
                    # Use previous line as merchant
                    result['merchant'] = lines[i - 1]
                else:
                    # Amount is on first line, try to extract merchant from same line
                    # Remove amount part to get merchant
                    merchant_candidate = line.replace(amount_text, '').strip()
                    if merchant_candidate:
                        result['merchant'] = merchant_candidate
                break
    
    return result
