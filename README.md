# 가계부

개인 재무 관리를 위한 웹 애플리케이션과 Discord 봇 통합 시스템

## 주요 기능

### 📊 웹 대시보드
- **대시보드**: 월별 수입/지출 요약, 카테고리별 지출 분석, 일별 거래 추이
- **거래 내역**: 전체 거래 내역 조회 및 검색
- **카테고리 내역**: 카테고리별 지출 상세 분석
- **자산 관리**: 계좌별 잔액 추적 및 자산 현황 시각화
- **반복 관리**: 고정 지출/수입 등록 및 자동 생성
- **예산 비율 계산기**: 수입 대비 저축/고정비/변동비 계획 수립

### 🤖 Discord 봇
- 영수증 이미지 업로드로 자동 거래 등록
- OCR + AI를 활용한 거래 정보 자동 추출
- 중복 거래 방지 기능
- 계좌 잔액 자동 업데이트

## 기술 스택

### 프론트엔드
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: ApexCharts

### 백엔드
- **Database**: PostgreSQL
- **ORM**: Raw SQL (asyncpg)
- **API**: Next.js Server Actions

### Discord 봇
- **Language**: Python 3.10+
- **OCR**: Google Cloud Vision API
- **AI**: Google Gemini 2.5 Flash
- **Library**: discord.py

## 설치 및 실행

### 사전 요구사항
- Node.js 18+
- Python 3.10+
- PostgreSQL 14+
- Google Cloud Vision API 키
- Google Gemini API 키
- Discord Bot 토큰

### 1. 저장소 클론
```bash
git clone <repository-url>
cd poor-guy
```

### 2. 환경 변수 설정
`.env.example`을 참고하여 `.env` 파일 생성:
```bash
cp .env.example .env
```

필수 환경 변수:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/poordb

# Discord Bot
DISCORD_BOT_TOKEN=your_discord_bot_token

# Google APIs
GOOGLE_API_KEY=your_google_vision_api_key
GEMINI_API_KEY=your_gemini_api_key
```

### 3. 데이터베이스 설정

PostgreSQL 데이터베이스 생성:
```bash
psql -U postgres
CREATE DATABASE poordb;
```

마이그레이션 실행:
```bash
# bot/migrations/ 디렉토리의 SQL 파일을 순서대로 실행
psql -U postgres -d poordb -f bot/migrations/001_initial_schema.sql
psql -U postgres -d poordb -f bot/migrations/002_add_balance_columns.sql
# ... (나머지 마이그레이션 파일들)
```

### 4. 웹 애플리케이션 실행

```bash
cd web
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 5. Discord 봇 실행

```bash
# 루트 디렉토리에서
pip install -r requirements.txt
python -m bot.main
```

## 사용 방법

### Discord 봇으로 거래 등록

1. Discord 채널에 영수증 이미지 업로드
2. 봇이 자동으로 OCR 처리 및 거래 정보 추출
3. 추출된 정보를 확인하고 자동으로 DB에 저장
4. 웹 대시보드에서 즉시 확인 가능

### 예산 비율 계산기 사용

1. 웹에서 **예산 비율 계산기** 메뉴 선택
2. 월 수입 입력
3. 반복 수입 불러오기 (선택사항)
4. 저축/고정비 금액 설정 → 나머지 자동 분배
5. 변동비/여유자금 조정
6. 설정이 자동으로 DB에 저장됨

### 반복 거래 관리

1. **반복 관리** 메뉴에서 고정 지출/수입 등록
2. 매월 지정된 날짜에 자동으로 거래 생성
3. 월급, 공과금, 구독료 등 관리

### 자산 관리

1. **자산 관리 > 계좌 관리**에서 은행 계좌 등록
2. Discord 봇으로 거래 등록 시 계좌 잔액 자동 업데이트
3. **자산 관리 > 자산 현황**에서 전체 자산 시각화

## 프로젝트 구조

```
poor-guy/
├── bot/                    # Discord 봇
│   ├── main.py            # 봇 메인 로직
│   ├── expense_parser.py  # OCR + AI 파싱
│   ├── db.py              # 데이터베이스 함수
│   └── migrations/        # DB 마이그레이션
├── web/                   # Next.js 웹 앱
│   ├── src/
│   │   ├── app/          # App Router 페이지
│   │   ├── components/   # React 컴포넌트
│   │   └── lib/          # 유틸리티 함수
│   └── public/           # 정적 파일
└── docs/                  # 문서
```

## 데이터베이스 스키마

### 주요 테이블
- `transactions`: 거래 내역
- `categories`: 카테고리 정의
- `bank_accounts`: 은행 계좌
- `recurring_transactions`: 반복 거래
- `app_settings`: 애플리케이션 설정

## 라이선스

MIT

## 개발자

김병찬
