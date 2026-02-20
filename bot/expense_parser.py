import json
import os

from dotenv import load_dotenv
load_dotenv()

from google.cloud import vision
from google import genai


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
            추출 항목: 금액(숫자만), 카테고리, 입금처 전체, 출금처 (은행번호), 이체일시

            [추출 및 생성 규칙]
            1. **카테고리 (최우선)**: 반드시 '카테고리 설정' 글자 옆이나 '>' 기호 바로 앞에 있는 단어(예: 쇼핑, 이체, 식비 등)를 있는 그대로 추출하세요. 절대 임의로 수정하지 마세요.
            2. 금액: 쉼표 없는 숫자만 추출하세요 (음수 불가).
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

# --- 사용 예시 ---
if __name__ == "__main__":
    parser = ExpenseParser()

    final_data = parser.analyze("/home/byungchan/Desktop/poor-guy/KakaoTalk_20260221_000504660.png")
    
    print(json.dumps(final_data, indent=4, ensure_ascii=False))