# 가계부

개인 재무 관리 웹 애플리케이션 + Discord 봇

## 사용 방법

### 1. 환경 변수 설정

`.env.example` 파일을 `.env`로 복사하고 값을 입력하세요:

```bash
cp .env.example .env
```

`.env` 파일 수정:
```env
# Discord 봇 토큰 (필수)
# https://discord.com/developers/applications 에서 발급
DISCORD_BOT_TOKEN=your_discord_bot_token_here

# Google Cloud Vision API 키 (필수)
# https://console.cloud.google.com/ 에서 발급
GOOGLE_API_KEY=your_google_vision_api_key_here

# Google Gemini API 키 (필수)
# https://makersuite.google.com/app/apikey 에서 발급
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Docker Compose로 실행

```bash
docker-compose up -d
```

### 3. 접속

- **웹 대시보드**: http://localhost:3000
- **Discord 봇**: 자동으로 Discord 서버에 접속됨

### 4. 종료

```bash
docker-compose down
```

데이터까지 삭제하려면:
```bash
docker-compose down -v
```

## Discord 봇 사용법

1. Discord 채널에 영수증 이미지 업로드
2. 봇이 자동으로 거래 내역 추출 및 저장
3. 웹 대시보드에서 확인

## 주요 기능

- **대시보드**: 월별 수입/지출 요약, 카테고리별 분석
- **거래 내역**: 달력 형식으로 거래 조회
- **자산 관리**: 계좌별 잔액 추적
- **반복 관리**: 고정 지출/수입 자동 생성
- **예산 계산기**: 수입 대비 저축/지출 계획
