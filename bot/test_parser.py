"""
Tests for Toss transaction parser.
"""

from datetime import datetime
from bot.parser import parse_toss_transaction


def test_parse_normal_transaction():
    text = """스타벅스 강남점
50,000원
2026.02.20 14:30
체크카드 승인"""
    
    result = parse_toss_transaction(text)
    
    assert result is not None
    assert result['amount'] == 50000
    assert result['merchant'] == '스타벅스 강남점'
    assert result['transacted_at'] == datetime(2026, 2, 20, 14, 30)
    assert result['raw_ocr_text'] == text


def test_parse_amount_with_commas():
    text = """쿠팡
1,500,000원"""
    
    result = parse_toss_transaction(text)
    
    assert result is not None
    assert result['amount'] == 1500000


def test_parse_datetime_format():
    text = """카카오택시
15,000원
2026/03/15 23:45"""
    
    result = parse_toss_transaction(text)
    
    assert result is not None
    assert result['transacted_at'] == datetime(2026, 3, 15, 23, 45)


def test_parse_unparseable_text():
    text = "This is random text with no transaction data"
    
    result = parse_toss_transaction(text)
    
    assert result is None


def test_parse_partial_no_datetime():
    text = """CU 편의점
3,500원"""
    
    result = parse_toss_transaction(text)
    
    assert result is not None
    assert result['amount'] == 3500
    assert result['merchant'] == 'CU 편의점'
    assert result['transacted_at'] is None
    assert result['raw_ocr_text'] == text


def test_parse_partial_no_merchant():
    text = """12,000원
2026.02.20 10:00"""
    
    result = parse_toss_transaction(text)
    
    assert result is not None
    assert result['amount'] == 12000
    assert result['transacted_at'] == datetime(2026, 2, 20, 10, 0)
    assert result['merchant'] is None or result['merchant'] == ''


def test_parse_empty_text():
    result = parse_toss_transaction("")
    assert result is None


def test_parse_amount_without_commas():
    text = """GS25
500원"""
    
    result = parse_toss_transaction(text)
    
    assert result is not None
    assert result['amount'] == 500


def test_parse_datetime_with_slash():
    text = """배달의민족
25,000원
2026/01/01 12:00"""
    
    result = parse_toss_transaction(text)
    
    assert result is not None
    assert result['transacted_at'] == datetime(2026, 1, 1, 12, 0)


def test_parse_datetime_with_dot():
    text = """이디야
4,500원
2026.12.31 23:59"""
    
    result = parse_toss_transaction(text)
    
    assert result is not None
    assert result['transacted_at'] == datetime(2026, 12, 31, 23, 59)
