import json
import os
import io

from dotenv import load_dotenv
load_dotenv()

from google.cloud import vision
from google import genai
from PIL import Image
import numpy as np


def is_blue_text(image_bytes: bytes, bbox: list) -> bool:
    """
    Detect if text in the given bounding box region is blue.
    
    Korean bank apps use text color to indicate transaction type:
    - Blue text = Income (money received)
    - White/Black text = Expense (money sent)
    
    Args:
        image_bytes: Raw image bytes from Discord attachment
        bbox: List of (x, y) coordinates defining the bounding box polygon
              Example: [(x1, y1), (x2, y2), (x3, y3), (x4, y4)]
              
    Returns:
        True if the text region contains predominantly blue pixels (likely income),
        False otherwise (likely expense)
        
    Note:
        - Uses HSV color space for blue detection
        - Samples pixels from the bounding box (excluding edges to avoid background)
        - Blue detection range: Hue 190-260°, Saturation > 0.35, Value > 0.2
        - Threshold: 8% of pixels must be blue to classify as blue text
        - May need tuning per bank app theme (light mode, dark mode, etc.)
    """
    try:
        # Load image from bytes
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        arr = np.array(img)
        
        # Extract bounding box coordinates
        xs = [p[0] for p in bbox]
        ys = [p[1] for p in bbox]
        x1, x2 = max(min(xs), 0), min(max(xs), arr.shape[1] - 1)
        y1, y2 = max(min(ys), 0), min(max(ys), arr.shape[0] - 1)
        
        # Crop to bounding box region
        crop = arr[y1:y2+1, x1:x2+1]
        
        if crop.size == 0:
            return False
        
        # Convert RGB to HSV
        crop = crop.astype(np.float32) / 255.0
        r, g, b = crop[..., 0], crop[..., 1], crop[..., 2]
        mx = np.max(crop, axis=-1)
        mn = np.min(crop, axis=-1)
        diff = mx - mn + 1e-6
        
        # Calculate Hue
        hue = np.zeros_like(mx)
        mask = diff > 1e-3
        hue[mask & (mx == r)] = (60 * ((g - b) / diff) % 360)[mask & (mx == r)]
        hue[mask & (mx == g)] = (60 * ((b - r) / diff) + 120)[mask & (mx == g)]
        hue[mask & (mx == b)] = (60 * ((r - g) / diff) + 240)[mask & (mx == b)]
        
        # Calculate Saturation and Value
        sat = diff / (mx + 1e-6)
        val = mx
        
        # Blue detection: Hue 190-260°, Saturation > 0.35, Value > 0.2
        blue_mask = (hue > 190) & (hue < 260) & (sat > 0.35) & (val > 0.2)
        blue_ratio = blue_mask.mean()
        
        # Return True if more than 8% of pixels are blue
        return blue_ratio > 0.08
        
    except Exception as e:
        print(f"Error in is_blue_text: {e}")
        return False


class ExpenseParser:
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY")
        self.vision_client = vision.ImageAnnotatorClient()
        self.genai_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        self.model_name = "gemini-2.5-flash" 

    def _extract_text_from_image(self, image_bytes: bytes) -> str:
        try:
            image = vision.Image(content=image_bytes)
            image_context = vision.ImageContext(language_hints=['ko'])
            
            response = self.vision_client.document_text_detection(
                image=image,
                image_context=image_context
            )
            
            if response.error.message:
                raise Exception(f"Vision API error: {response.error.message}")
            
            return response.text_annotations[0].description if response.text_annotations else ""
        except Exception as e:
            raise Exception(f"OCR 추출 실패: {str(e)}")

    def _parse_text_to_json(self, raw_text: str) -> dict:
        if not raw_text:
            return {}

        # TODO :: 아래 김병찬이라는 이름은 웹에서 설정 값으로 받을 수 있도록 수정하기
        prompt = f"""
            당신은 은행 거래 내역 분석 전문가입니다. 다음 OCR 텍스트에서 가계부 정보를 추출하세요.
            추출 항목: 금액(숫자만), 카테고리, 입금처 전체, 출금처 (은행번호), 이체일시, 거래 유형

            [추출 및 생성 규칙]
            1. **카테고리 (최우선)**: 반드시 '카테고리 설정' 글자 옆이나 '>' 기호 바로 앞에 있는 단어(예: 쇼핑, 이체, 식비 등)를 있는 그대로 추출하세요. 절대 임의로 수정하지 마세요.
            2. 금액 및 거래 유형:
               - OCR 텍스트에서 금액을 찾으세요.
               - 금액 앞에 '-' 기호가 있으면 type을 "지출"로, 없으면 "수입"으로 설정하세요.
               - amount 필드에는 절댓값(양수)만 저장하세요 (쉼표 제거).
               - 예: "-15000원" → type: "지출", amount: 15000
               - 예: "15000원" 또는 "+15000원" → type: "수입", amount: 15000
            3. 입금/출금처: 돈의 흐름을 파악하여 정확히 구분하세요. (예: 쿠팡페이는 출금처, 쿠팡은 입금처)
            4. **제목 생성 규칙**:
            - **1순위**: '메모' 항목에 적힌 내용이 있다면 그것을 제목으로 사용하세요. (예: "노트북 구매")
            - **2순위**: 메모가 없거나 기본 문구라면, 사용자("김병찬") 외의 타인 이름이 있을 시 "{{이름}}에게 이체"로 생성하세요.
            - **3순위**: 둘 다 없다면 입금처를 바탕으로 생성하세요.
            5. 반드시 아래 구조의 순수 JSON으로만 응답하세요.
            
            [JSON 구조]
            {{
            "title": "생성된 제목",
            "amount": 0,
            "type": "지출 또는 수입",
            "category": "카테고리명",
            "deposit_destination": "입금처",
            "withdrawal_source": "출금처",
            "transaction_date": "이체일시"
            }}
            
            텍스트:
            {raw_text}
        """
        
        try:
            response = self.genai_client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )

            clean_json = response.text.strip().lstrip("```json").rstrip("```").strip()
            return json.loads(clean_json)
        
        except Exception as e:
            print(f"LLM 파싱 에러: {e}")
            return {"raw_text": raw_text, "error": "parsing_failed"}

    def analyze(self, image_bytes: bytes) -> dict:
        raw_text = self._extract_text_from_image(image_bytes)
        
        result = self._parse_text_to_json(raw_text)
        
        return result


if __name__ == "__main__":
    parser = ExpenseParser()

    image_path = "/home/byungchan/Desktop/poor-guy/IMG_7474.png"

    with open(image_path, "rb") as f:
        image_bytes = f.read()

    final_data = parser.analyze(image_bytes)

    print(json.dumps(final_data, indent=4, ensure_ascii=False))