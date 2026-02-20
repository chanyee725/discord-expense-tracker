"""
Category mapping for transaction merchants.

Maps merchant keywords to spending categories.
"""

CATEGORY_MAP = {
    "스타벅스": "카페",
    "이디야": "카페",
    "투썸": "카페",
    "투썸플레이스": "카페",
    "빽다방": "카페",
    "메가커피": "카페",
    "CU": "편의점",
    "GS25": "편의점",
    "세븐일레븐": "편의점",
    "이마트24": "편의점",
    "쿠팡": "쇼핑",
    "네이버": "쇼핑",
    "무신사": "쇼핑",
    "배달의민족": "배달",
    "요기요": "배달",
    "쿠팡이츠": "배달",
    "카카오택시": "교통",
    "타다": "교통",
    "우버": "교통",
    "지하철": "교통",
    "버스": "교통",
}


def get_category(merchant: str) -> str:
    """
    Determine category for a merchant.
    
    Args:
        merchant: Merchant name/description
        
    Returns:
        Category name (str), defaults to "기타" if no match
    """
    if not merchant:
        return "기타"
    
    for keyword, category in CATEGORY_MAP.items():
        if keyword in merchant:
            return category
    
    return "기타"
