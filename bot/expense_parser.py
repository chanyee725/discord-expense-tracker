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

            [주의 사항]
            1. 카테고리: '카테고리 설정' 근처나 '>' 기호 앞의 단어(예: 이체, 식비 등)를 추출하세요.
            2. 금액: 쉼표 없는 숫자만 추출해야하며, 음수가 될 수 없습니다.
            3. 입금/출금처: 텍스트 맥락상 실제 돈이 나간 곳과 들어온 곳을 구분하세요.
            4. 제목 생성 규칙:
            - 텍스트에서 사용자 이름("김병찬") 외에 다른 사람의 이름이 발견되면, ""{{상대방이름}}한테 이체"라고 제목을 만드세요.
            - 이름이 없다면 출금처나 입금처를 바탕으로 "편의점 결제", "식비 지출" 등 간결한 제목을 만드세요.
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