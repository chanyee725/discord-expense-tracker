# Poor Guy — 가계부 프로젝트 초기 설정

## TL;DR

> **Quick Summary**: 토스 이체내역 스크린샷을 디스코드에 올리면 Google Cloud Vision OCR로 파싱하여 PostgreSQL에 저장하고, Next.js 대시보드에서 오늘의 지출 내역을 확인하는 개인 가계부 시스템을 구축한다.
> 
> **Phase 1 (이번 플랜)**: 봇 + OCR 인식 검증 → DB 연결 (로컬 conda env)
> **Phase 2 (추후)**: Next.js 웹 대시보드 + Docker Compose 통합
>
> **Deliverables (Phase 1)**:
> - Python 디스코드 봇: 이미지 수신 → OCR → 텍스트 인식 확인
> - 토스 이체내역 파서: OCR 텍스트 → 구조화된 지출 데이터
> - PostgreSQL 연동: 파싱된 데이터 DB 저장 + Discord Embed 응답
> - 프로젝트 기본 파일: .gitignore, .env.example, requirements.txt
> 
> **Runtime**: 로컬 conda env `poor_guy` (Python 3.12) — Docker 아님
> **Estimated Effort**: Medium
> **Parallel Execution**: YES — 2 waves
> **Critical Path**: Task 1 (프로젝트 세팅) → Task 2 (봇+OCR 인식) → Task 3 (파서+카테고리) → Task 4 (DB 연결+Embed 응답)

---

## Context

### Original Request
디스코드 서버에 이미지를 올리면 OCR로 파싱해서 웹 가계부에 정리하는 프로젝트. `bot/` 폴더에 디스코드 봇과 OCR 로직, `web/` 폴더에 Next.js 웹앱, Docker로 데이터 저장.

### Interview Summary
**Key Discussions**:
- **봇 언어**: Python (discord.py) — OCR 생태계 풍부
- **OCR**: Google Cloud Vision API — 한글 인식률 최고, 월 1,000건 무료
- **DB**: PostgreSQL (Docker) — ORM(Prisma)으로 SQL 직접 작성 최소화
- **웹 UI**: NextAdmin 대시보드 참고 스타일 (https://github.com/NextAdminHQ/nextjs-admin-dashboard) — Tailwind CSS + 차트/테이블 컴포넌트
- **봇↔웹 연동**: DB 직접 공유 (봇이 PostgreSQL에 직접 저장 → 웹이 같은 DB 읽기)
- **이미지 종류**: 토스 모바일 앱 이체내역 스크린샷 (금액, 상호명, 카테고리, 출금처, 이체일시)
- **카테고리**: 자동 분류 (상호명 키워드 매핑)
- **사용 범위**: 개인용 (인증 없음)
- **웹 기능 Phase 1**: 오늘의 지출 내역 목록만. 차트/통계/예산 등은 추후
- **봇 응답**: 파싱된 내역 요약 + 성공 이모지
- **호스팅**: 로컬 Docker Compose (추후 배포 가능성)
- **테스트**: 없음 (개인 프로젝트, 빠른 개발)

**Research Findings**:
- NextAdmin: Next.js 16, TypeScript, Tailwind, Prisma+PostgreSQL 통합 내장 — 참고용으로 적합
- Google Vision `document_text_detection()`이 영수증/이체내역 구조 인식에 더 적합, `language_hints=['ko']` 추가 권장
- discord.py: `message.attachments`로 이미지 바이트 직접 접근 가능, 임시 파일 불필요
- 공유 DB 패턴: Prisma가 스키마 소유, Python은 raw SQL만 사용해야 drift 방지

### Metis Review
**Identified Gaps** (addressed):
- GCP 크레덴셜/Discord 봇 토큰 사전 준비 → Prerequisites에 명시
- 토스 스크린샷 포맷 불확실 → "best guess" 파서 + raw_ocr_text 저장으로 디버깅 가능하게
- NextAdmin 통째 포크 위험 → 신규 scaffolding + 스타일만 참고로 전환
- Python ORM 사용 시 스키마 drift 위험 → asyncpg raw SQL만 사용, Prisma가 유일한 스키마 소유자
- 금액 타입 → Integer 사용 (원화에 소수점 없음)
- income/expense 구분 → direction 필드 추가 (기본값 EXPENSE)

---

## Work Objectives

### Core Objective
토스 이체내역 스크린샷 → OCR 파싱 → DB 저장의 봇 파이프라인을 로컬 conda 환경에서 구축하고 동작을 검증한다. (웹은 Phase 2)

### Concrete Deliverables
- `bot/` — Python 디스코드 봇 (discord.py + google-cloud-vision + asyncpg)
- `bot/main.py` — 봇 엔트리포인트
- `bot/ocr.py` — Google Vision API OCR 래퍼
- `bot/parser.py` — 토스 이체내역 텍스트 파서
- `bot/categories.py` — 상호명→카테고리 하드코딩 매핑
- `bot/db.py` — asyncpg DB 연동
- `requirements.txt` — Python 의존성
- `.env.example` — 환경변수 문서화
- `.gitignore` — secrets, __pycache__ 등 제외

### Definition of Done
- [ ] conda env `poor_guy`에서 봇 실행 시 Discord에 정상 연결
- [ ] 디스코드에 토스 스크린샷 올리면 봇이 OCR 텍스트 인식 결과 응답
- [ ] 파서가 OCR 텍스트에서 금액/상호명/일시 추출
- [ ] 봇이 파싱한 내역이 PostgreSQL transactions 테이블에 저장됨
- [ ] 봇이 Discord Embed로 파싱 결과 요약 응답

### Must Have
- conda env `poor_guy` (Python 3.12)에서 봇 로컬 실행
- Google Cloud Vision API OCR 연동
- 토스 이체내역 텍스트 파싱 (금액, 상호명, 일시 최소 3필드)
- PostgreSQL 트랜잭션 테이블 (SQL 스키마)
- 봇이 이미지 첨부 자동 감지 및 처리
- 봇 응답: Discord Embed로 파싱 결과 요약
- `raw_ocr_text` 필드 — OCR 원본 텍스트 디버깅용 저장
- `.env.example` — 모든 필수 환경변수 문서화

### Must NOT Have (Guardrails)
- ❌ SQLAlchemy, Alembic 등 Python ORM — asyncpg raw SQL만 사용
- ❌ Docker 설정 — 이번 Phase에서는 로컬 conda 환경만 사용
- ❌ Next.js 웹 — Phase 2에서 진행
- ❌ Prisma — Phase 2 웹 구축 시 도입 (이번엔 SQL 직접 작성)
- ❌ 이미지 전처리 (OpenCV, Pillow 변환) — raw 바이트 직접 Vision API 전송
- ❌ 봇 커맨드 (슬래시/prefix) — on_message 이미지 감지만
- ❌ ML/AI 카테고리 분류 — 하드코딩된 dict 매핑만
- ❌ 인증, 사용자 관리, 멀티유저
- ❌ Tesseract 등 대체 OCR 엔진

---

## Verification Strategy (MANDATORY)

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.
> **FORBIDDEN** — acceptance criteria that require:
> - "User manually tests..." / "사용자가 직접 테스트..."
> - "User posts image in Discord..." / "사용자가 디스코드에 이미지 올림..."
> - ANY step where a human must perform an action
>
> **ALL verification is executed by the agent** using tools.

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: None (except parser unit test — OCR 파싱이 가장 취약 지점)
- **Framework**: pytest (파서 테스트 1파일만)
- **Runtime**: conda env `poor_guy` (Python 3.12) — 로컬 실행

### Agent-Executed QA Scenarios (MANDATORY — ALL tasks)

> Whether TDD is enabled or not, EVERY task MUST include Agent-Executed QA Scenarios.
> These describe how the executing agent DIRECTLY verifies the deliverable.

**Verification Tool by Deliverable Type:**

| Type | Tool | How Agent Verifies |
|------|------|-------------------|
| **Python Bot** | Bash (conda run) | 봇 프로세스 기동, 로그 확인 |
| **OCR Module** | Bash (python script) | 모듈 임포트 + 함수 호출 테스트 |
| **Parser** | Bash (pytest) | 유닛 테스트 |
| **DB** | Bash (psql / python script) | 테이블 존재, INSERT/SELECT 확인 |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: 프로젝트 세팅 (폴더 구조 + requirements + .gitignore + .env)
└── Task 2: PostgreSQL DB 세팅 (Docker 컨테이너 1개만 + 테이블 생성)

Wave 2 (After Wave 1):
└── Task 3: 디스코드 봇 + OCR 인식 (이미지 수신 → Vision API → raw text 응답)

Wave 3 (After Wave 2):
└── Task 4: 토스 파서 + 카테고리 + DB 저장 + Embed 응답 완성

Wave 4 (Final):
└── Task 5: End-to-End 통합 검증
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 3, 4 | 2 |
| 2 | None | 4 | 1 |
| 3 | 1 | 4 | None |
| 4 | 2, 3 | 5 | None |
| 5 | ALL | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1, 2 | task(category="quick") + task(category="quick") 병렬 |
| 2 | 3 | task(category="unspecified-high") |
| 3 | 4 | task(category="unspecified-high") |
| 4 | 5 | task(category="unspecified-low") |

---

## Prerequisites (사용자가 사전 준비해야 할 것)

> ⚠️ 이 항목들은 플랜 실행 전에 사용자가 직접 준비해야 합니다.

1. **Google Cloud Platform**
   - GCP 프로젝트 생성 + Vision API 활성화
   - 서비스 계정 생성 → JSON 키 파일 다운로드
   - 키 파일을 `./secrets/gcp-key.json` 위치에 배치

2. **Discord Bot**
   - Discord Developer Portal에서 봇 생성
   - Bot Token 발급
   - 봇을 사용할 디스코드 서버에 초대 (MESSAGE CONTENT Intent 활성화 필수)

3. **로컬 환경**
   - conda env `poor_guy` (Python 3.12) — 이미 생성됨
   - Docker 설치됨 (PostgreSQL 컨테이너 실행용)

---

## TODOs

- [x] 1. 프로젝트 세팅 — 폴더 구조 + requirements.txt + .gitignore + .env

  **What to do**:
  - 프로젝트 디렉토리 구조 생성:
    ```
    poor-guy/
    ├── bot/                    # 봇 코드 디렉토리 (+ __init__.py for package import)
    ├── secrets/                # GCP 키 등 (gitignored)
    │   └── .gitkeep
    ├── requirements.txt        # Python 의존성
    ├── .env.example            # 환경변수 문서화
    └── .gitignore              # 제외 파일 설정
    ```
  - `requirements.txt` 작성:
    ```
    discord.py>=2.3.0
    google-cloud-vision>=3.5.0
    asyncpg>=0.29.0
    python-dotenv>=1.0.0
    pytest>=7.0.0
    ```
  - `.gitignore` 작성:
    ```
    # Python
    __pycache__/
    *.pyc
    *.pyo
    .pytest_cache/

    # Environment
    .env
    .env.local

    # Secrets
    secrets/
    !secrets/.gitkeep

    # IDE
    .vscode/
    .idea/

    # OS
    .DS_Store
    Thumbs.db
    ```
  - `.env.example` 작성:
    ```
    # Discord Bot
    DISCORD_BOT_TOKEN=your_discord_bot_token_here

    # Google Cloud Vision
    GOOGLE_APPLICATION_CREDENTIALS=./secrets/gcp-key.json

    # Database (PostgreSQL — Docker 컨테이너)
    DATABASE_URL=postgresql://postgres:changeme@localhost:5432/poordb
    ```
  - `secrets/.gitkeep` 생성
  - conda env `poor_guy`에 requirements.txt 패키지 설치: `conda run -n poor_guy pip install -r requirements.txt`

  **Must NOT do**:
  - Docker Compose 파일 작성하지 않음 — Phase 1은 로컬 conda
  - Dockerfile 작성하지 않음
  - web/ 디렉토리 생성하지 않음 — Phase 2에서
  - README.md 작성하지 않음
  - 실제 credential 값 커밋하지 않음

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 디렉토리 생성 + 설정 파일 작성의 단순 작업
  - **Skills**: []
  - **Skills Evaluated but Omitted**: 모두 불필요

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Tasks 3, 4
  - **Blocked By**: None (can start immediately)

  **References**: 없음 (표준 패턴)

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 디렉토리 구조 생성 확인
    Tool: Bash (ls)
    Steps:
      1. ls -la bot/
      2. Assert: bot/ 디렉토리 존재
      3. ls -la secrets/
      4. Assert: secrets/.gitkeep 존재
    Expected Result: 프로젝트 디렉토리 구조 정상 생성
    Evidence: ls 출력 캡처

  Scenario: requirements.txt 패키지 설치 확인
    Tool: Bash (conda run)
    Steps:
      1. conda run -n poor_guy pip list --format=columns
      2. Assert: "discord.py" 포함
      3. Assert: "google-cloud-vision" 포함
      4. Assert: "asyncpg" 포함
      5. Assert: "python-dotenv" 포함
    Expected Result: 모든 의존성 패키지 설치됨
    Evidence: pip list 출력 캡처

  Scenario: .gitignore 핵심 항목 확인
    Tool: Bash (grep)
    Steps:
      1. cat .gitignore
      2. Assert: "__pycache__" 포함
      3. Assert: ".env" 포함
      4. Assert: "secrets/" 포함
    Expected Result: 주요 제외 항목 모두 포함
    Evidence: .gitignore 내용 캡처

  Scenario: .env.example 필수 변수 확인
    Tool: Bash (grep)
    Steps:
      1. cat .env.example
      2. Assert: "DISCORD_BOT_TOKEN" 포함
      3. Assert: "DATABASE_URL" 포함
      4. Assert: "GOOGLE_APPLICATION_CREDENTIALS" 포함
      5. Assert: 실제 credential 값 없음 (placeholder만)
    Expected Result: 모든 필수 환경변수 문서화
    Evidence: .env.example 내용 캡처
  ```

  **Commit**: YES
  - Message: `chore: project scaffolding with requirements, .gitignore, .env.example`
  - Files: `bot/`, `secrets/.gitkeep`, `requirements.txt`, `.gitignore`, `.env.example`
  - Pre-commit: `conda run -n poor_guy pip install -r requirements.txt`

---

- [x] 2. PostgreSQL DB 세팅 — Docker 컨테이너 1개 + 테이블 생성 SQL

  **What to do**:
  - PostgreSQL Docker 컨테이너 실행 (docker run, Compose 아님):
    ```bash
    docker run -d \
      --name poordb \
      -e POSTGRES_USER=postgres \
      -e POSTGRES_PASSWORD=changeme \
      -e POSTGRES_DB=poordb \
      -p 5432:5432 \
      -v poordb_data:/var/lib/postgresql/data \
      postgres:16-alpine
    ```
  - `bot/schema.sql` — 테이블 생성 SQL 작성:
    ```sql
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        amount INTEGER NOT NULL,
        merchant TEXT,
        category TEXT,
        source TEXT,
        direction TEXT NOT NULL DEFAULT 'EXPENSE',
        raw_ocr_text TEXT,
        transacted_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT now()
    );
    ```
  - SQL 실행으로 테이블 생성:
    ```bash
    docker exec -i poordb psql -U postgres -d poordb < bot/schema.sql
    ```

  **Must NOT do**:
  - Docker Compose 사용하지 않음 — 단일 docker run만
  - SQLAlchemy, Alembic 등 마이그레이션 도구 사용하지 않음
  - Prisma 사용하지 않음 — Phase 2에서 도입
  - PostgreSQL 설정 튜닝하지 않음 (기본값 사용)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Docker 컨테이너 1개 실행 + SQL 파일 1개 작성의 단순 작업
  - **Skills**: []
  - **Skills Evaluated but Omitted**: 모두 불필요

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Task 4
  - **Blocked By**: None (can start immediately)

  **References**:

  **External References**:
  - PostgreSQL Docker Hub: `postgres:16-alpine` 이미지
  - Named volume `poordb_data`로 데이터 영속화
  - `pgcrypto` 확장 — `gen_random_uuid()` 함수 사용

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: PostgreSQL 컨테이너 실행 확인
    Tool: Bash (docker)
    Steps:
      1. docker ps --filter "name=poordb" --format "table {{.Names}}\t{{.Status}}"
      2. Assert: poordb 컨테이너 status에 "Up" 포함
      3. docker exec poordb pg_isready -U postgres -d poordb
      4. Assert: 출력에 "accepting connections" 포함
    Expected Result: PostgreSQL 컨테이너 정상 실행 중
    Evidence: docker ps 출력 캡처

  Scenario: transactions 테이블 존재 및 스키마 확인
    Tool: Bash (psql via docker exec)
    Steps:
      1. docker exec poordb psql -U postgres -d poordb -c "\dt"
      2. Assert: 출력에 "transactions" 테이블 존재
      3. docker exec poordb psql -U postgres -d poordb -c "\d transactions"
      4. Assert: id(uuid), amount(integer), merchant(text), category(text), source(text), direction(text), raw_ocr_text(text), transacted_at(timestamp), created_at(timestamp) 컬럼 존재
    Expected Result: 스키마가 설계와 일치
    Evidence: psql 출력 캡처

  Scenario: 테스트 INSERT/SELECT 동작 확인
    Tool: Bash (psql via docker exec)
    Steps:
      1. docker exec poordb psql -U postgres -d poordb -c "
         INSERT INTO transactions (amount, merchant, category, direction)
         VALUES (15000, 'test_merchant', 'test_category', 'EXPENSE')
         RETURNING id, amount, merchant;"
      2. Assert: 출력에 id(UUID 형태), amount=15000, merchant=test_merchant 포함
      3. docker exec poordb psql -U postgres -d poordb -c "
         DELETE FROM transactions WHERE merchant = 'test_merchant';"
      4. Assert: DELETE 1 출력
    Expected Result: INSERT/SELECT/DELETE 정상 동작
    Evidence: psql 출력 캡처

  Scenario: Named volume 데이터 영속 확인
    Tool: Bash (docker volume)
    Steps:
      1. docker volume ls --filter "name=poordb_data" --format "{{.Name}}"
      2. Assert: "poordb_data" 출력
    Expected Result: named volume 생성됨
    Evidence: docker volume ls 출력
  ```

  **Commit**: YES
  - Message: `feat(db): PostgreSQL Docker container and transactions schema`
  - Files: `bot/schema.sql`
  - Pre-commit: `docker exec poordb psql -U postgres -d poordb -c "\dt"`

---

- [ ] 3. 디스코드 봇 + OCR 인식 — 이미지 수신 → Vision API → raw text 응답

  **What to do**:
  - `bot/main.py` — discord.py 봇 엔트리포인트
    - `intents.message_content = True` 설정
    - `on_ready` 이벤트에서 로그인 확인 메시지 출력
    - `on_message` 이벤트에서 `message.attachments` 검사
    - 이미지 MIME 타입 필터링 (`content_type.startswith('image/')`)
    - 이미지 첨부 감지 시 → `attachment.read()` 로 바이트 획득
    - OCR 모듈 호출 → 결과 텍스트를 Discord에 임시 응답 (코드블록으로 raw text 표시)
    - 에러 발생 시 에러 메시지 응답
    - `python-dotenv`로 `.env` 파일에서 환경변수 로드
  - `bot/ocr.py` — Google Cloud Vision API 래퍼
    - `extract_text(image_bytes: bytes) -> str` 함수
    - `document_text_detection()` 사용 (NOT `text_detection`)
    - `language_hints=['ko']` 설정
    - `GOOGLE_APPLICATION_CREDENTIALS` 환경변수로 인증
    - `text_annotations[0].description`에서 전체 텍스트 추출
    - 반환값: OCR 전체 텍스트 문자열
    - 텍스트 없으면 빈 문자열 반환

  **Must NOT do**:
  - 이미지 전처리 (리사이즈, 대비 조정 등) 하지 않음
  - 슬래시 커맨드나 prefix 커맨드 추가하지 않음
  - 파서 로직 이 태스크에서 구현하지 않음 (Task 4에서 구현)
  - DB 연동 이 태스크에서 구현하지 않음 (Task 4에서 구현)
  - `text_detection()` 사용하지 않음 — `document_text_detection()` 사용
  - Dockerfile 작성하지 않음 — conda env에서 직접 실행

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Python + discord.py + Google Cloud Vision API 연동 — API 호출 패턴과 비동기 이벤트 처리 필요
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `playwright`: 브라우저 작업 아님
    - `frontend-ui-ux`: Python 백엔드 작업

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential, after Wave 1)
  - **Blocks**: Task 4
  - **Blocked By**: Task 1 (requirements.txt 설치 필요)

  **References**:

  **External References**:
  - discord.py docs: `on_message` 이벤트, `Attachment.read()` → bytes, `Attachment.content_type`
  - Google Cloud Vision Python: `from google.cloud import vision`, `ImageAnnotatorClient().document_text_detection(image=vision.Image(content=image_bytes))`
  - 한국어 OCR 힌트: `image_context=vision.ImageContext(language_hints=['ko'])`
  - python-dotenv: `from dotenv import load_dotenv; load_dotenv()`

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 봇 프로세스 정상 기동 확인
    Tool: Bash (conda run + tmux)
    Preconditions: conda env poor_guy에 패키지 설치됨, .env에 DISCORD_BOT_TOKEN 설정됨
    Steps:
      1. tmux new-session -d -s bot-test "conda run -n poor_guy python bot/main.py"
      2. sleep 10
      3. tmux capture-pane -t bot-test -p
      4. Assert: 출력에 "logged in" 또는 "ready" 또는 "봇 준비" 메시지 존재
      5. tmux kill-session -t bot-test
    Expected Result: 봇이 Discord에 정상 연결됨
    Evidence: tmux 출력 캡처

  Scenario: OCR 모듈 단독 임포트 및 함수 존재 확인
    Tool: Bash (conda run)
    Preconditions: google-cloud-vision 패키지 설치됨
    Steps:
      1. conda run -n poor_guy python -c "
         from bot.ocr import extract_text
         import inspect
         sig = inspect.signature(extract_text)
         assert 'image_bytes' in str(sig.parameters) or len(sig.parameters) >= 1
         print('OCR_MODULE_OK')
         "
      2. Assert: 출력에 "OCR_MODULE_OK" 포함
    Expected Result: OCR 모듈이 로드 가능하고 extract_text 함수 존재
    Evidence: 스크립트 출력 캡처

  Scenario: OCR 모듈 에러 핸들링 확인
    Tool: Bash (conda run)
    Preconditions: google-cloud-vision 패키지 설치됨
    Steps:
      1. conda run -n poor_guy python -c "
         from bot.ocr import extract_text
         try:
             result = extract_text(b'not_an_image')
             print(f'RESULT: {repr(result)}')
         except Exception as e:
             print(f'EXPECTED_ERROR: {type(e).__name__}: {e}')
         print('ERROR_HANDLING_OK')
         "
      2. Assert: 출력에 "ERROR_HANDLING_OK" 포함
    Expected Result: 잘못된 이미지 데이터에 대해 예외 발생 또는 빈 결과 반환
    Evidence: 스크립트 출력

  Scenario: main.py 이미지 감지 로직 존재 확인
    Tool: Bash (grep)
    Steps:
      1. grep -n "attachment" bot/main.py
      2. Assert: "attachments" 또는 "attachment.read" 관련 코드 존재
      3. grep -n "content_type\|image/" bot/main.py
      4. Assert: 이미지 MIME 타입 필터링 코드 존재
    Expected Result: 이미지 첨부 감지 및 처리 로직 구현됨
    Evidence: grep 출력 캡처
  ```

  **Commit**: YES
  - Message: `feat(bot): Discord bot with Google Vision OCR image recognition`
  - Files: `bot/main.py`, `bot/ocr.py`
  - Pre-commit: `conda run -n poor_guy python -c "from bot.ocr import extract_text; print('OK')"`

---

- [ ] 4. 토스 파서 + 카테고리 + DB 저장 + Embed 응답 완성

  **What to do**:
  - `bot/parser.py` — 토스 이체내역 OCR 텍스트 파싱
    - `parse_toss_transaction(text: str) -> dict | None` 함수
    - 정규식으로 추출:
      - 금액: `r'([\d,]+)\s*원'` → 콤마 제거 → int 변환
      - 날짜: `r'(\d{4})[\./](\d{1,2})[\./](\d{1,2})\s+(\d{1,2}):(\d{2})'` → datetime
      - 상호명: 금액 행 위의 텍스트 라인 (토스 패턴: "상호명\n금액원\n..." 구조)
    - 콤마 포함 금액 처리: `"1,500,000원"` → `1500000` (int)
    - 파싱 실패 시 부분 결과 반환 (amount=None 등), 전체 실패 시 None 반환
    - 모든 결과에 `raw_ocr_text` 포함
  - `bot/categories.py` — 하드코딩된 상호명→카테고리 매핑
    ```python
    CATEGORY_MAP = {
        "스타벅스": "카페", "이디야": "카페", "투썸": "카페",
        "CU": "편의점", "GS25": "편의점", "세븐일레븐": "편의점",
        "쿠팡": "쇼핑", "네이버": "쇼핑",
        "배달의민족": "배달", "요기요": "배달",
        "카카오택시": "교통", "타다": "교통",
    }
    def get_category(merchant: str) -> str:
        for keyword, category in CATEGORY_MAP.items():
            if keyword in merchant:
                return category
        return "기타"
    ```
  - `bot/db.py` — asyncpg 기반 DB 연동
    - `create_pool()` — `asyncpg.create_pool(dsn)` 래퍼
    - `insert_transaction(pool, data: dict)` — INSERT 쿼리
    - SQL 컬럼명은 snake_case 사용 (amount, merchant, category, source, direction, raw_ocr_text, transacted_at)
    - `DATABASE_URL` 환경변수에서 DSN 읽기
  - `bot/main.py` 업데이트 — 전체 파이프라인 완성:
    1. `on_ready`: DB 커넥션 풀 생성
    2. `on_message`: 이미지 수신 → OCR → 텍스트 추출
    3. 텍스트 → `parse_toss_transaction()` → 구조화된 데이터
    4. 상호명으로 `get_category()` → 카테고리 자동 분류
    5. `insert_transaction()` → DB 저장
    6. Discord Embed 응답:
       - 성공: `discord.Embed` with 금액, 상호명, 카테고리, 일시 필드
       - 실패: 에러 Embed ("이미지를 인식할 수 없습니다" 또는 "파싱에 실패했습니다")
  - `bot/test_parser.py` — 파서 유닛 테스트 (pytest)
    - 정상 토스 텍스트 파싱 (금액 + 날짜 + 상호명)
    - 콤마 포함 금액 파싱 (`"1,500,000원"` → `1500000`)
    - 날짜 추출 (`"2026.02.20 14:30"` → datetime)
    - 파싱 불가 텍스트 → None 반환
    - 부분 파싱 (금액만 있고 날짜 없는 경우)

  **Must NOT do**:
  - SQLAlchemy, Alembic 등 ORM 사용하지 않음 — asyncpg raw SQL만
  - ML/AI 기반 카테고리 분류 — dict 매핑만
  - 이미지 전처리 — raw 텍스트에서 정규식 파싱만
  - 중복 체크 — Phase 1에서는 구현하지 않음
  - 슬래시 커맨드 추가하지 않음

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 정규식 파싱 + 비동기 DB + Discord Embed 등 로직 밀도 높은 작업
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `playwright`: 브라우저 작업 아님

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (sequential, after Task 3)
  - **Blocks**: Task 5
  - **Blocked By**: Tasks 2, 3 (DB 테이블 + 봇 기본 코드 필요)

  **References**:

  **Pattern References**:
  - `bot/schema.sql` (Task 2에서 생성) — transactions 테이블 컬럼명 참조하여 INSERT SQL 작성
  - `bot/main.py` (Task 3에서 생성) — 기존 on_message 이벤트에 파서/DB 파이프라인 추가
  - `bot/ocr.py` (Task 3에서 생성) — `extract_text()` 함수 반환값을 파서 입력으로 사용

  **External References**:
  - asyncpg docs: `pool = await asyncpg.create_pool(dsn)`, `await pool.execute("INSERT INTO transactions (...) VALUES ($1, $2, ...)", val1, val2)`
  - discord.py Embed: `discord.Embed(title="💰 지출 내역", color=0x00ff00)`, `embed.add_field(name="금액", value="15,000원", inline=True)`
  - Python regex for Korean won: `r'([\d,]+)\s*원'`
  - 토스 날짜 패턴: `r'(\d{4})[\./](\d{1,2})[\./](\d{1,2})\s+(\d{1,2}):(\d{2})'`

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 파서 유닛 테스트 전체 통과
    Tool: Bash (conda run + pytest)
    Preconditions: conda env poor_guy에 pytest 설치됨
    Steps:
      1. conda run -n poor_guy python -m pytest bot/test_parser.py -v
      2. Assert: 모든 테스트 PASSED
      3. Assert: 0 failures
    Expected Result: 파서가 토스 텍스트를 정확히 파싱
    Evidence: pytest 출력 캡처

  Scenario: 파서 — 정상 토스 텍스트 파싱
    Tool: Bash (conda run)
    Preconditions: bot/parser.py 존재
    Steps:
      1. conda run -n poor_guy python -c "
         from bot.parser import parse_toss_transaction
         text = '홍길동님에게\n50,000원\n보냈어요\n2026.02.20 14:30\n토스뱅크 계좌에서'
         result = parse_toss_transaction(text)
         assert result is not None, 'parse returned None'
         assert result['amount'] == 50000, f'amount={result[\"amount\"]}'
         print('PARSER_OK')
         "
      2. Assert: 출력에 "PARSER_OK" 포함
    Expected Result: 50,000원 → 50000 int 변환 성공
    Evidence: 스크립트 출력

  Scenario: 카테고리 자동 분류
    Tool: Bash (conda run)
    Preconditions: bot/categories.py 존재
    Steps:
      1. conda run -n poor_guy python -c "
         from bot.categories import get_category
         assert get_category('스타벅스 강남점') == '카페'
         assert get_category('CU 역삼점') == '편의점'
         assert get_category('알수없는곳') == '기타'
         print('CATEGORY_OK')
         "
      2. Assert: 출력에 "CATEGORY_OK" 포함
    Expected Result: 키워드 매칭으로 카테고리 분류 정상 동작
    Evidence: 스크립트 출력

  Scenario: DB INSERT/SELECT 동작 확인
    Tool: Bash (conda run)
    Preconditions: PostgreSQL 컨테이너 poordb 실행 중
    Steps:
      1. conda run -n poor_guy python -c "
         import asyncio
         from bot.db import create_pool, insert_transaction
         async def test():
             pool = await create_pool()
             data = {
                 'amount': 15000,
                 'merchant': 'test_스타벅스',
                 'category': '카페',
                 'direction': 'EXPENSE',
                 'raw_ocr_text': 'test ocr text',
             }
             await insert_transaction(pool, data)
             row = await pool.fetchrow(
                 'SELECT * FROM transactions WHERE merchant = \$1', 'test_스타벅스'
             )
             assert row is not None
             assert row['amount'] == 15000
             await pool.execute(
                 'DELETE FROM transactions WHERE merchant = \$1', 'test_스타벅스'
             )
             await pool.close()
             print('DB_INSERT_OK')
         asyncio.run(test())
         "
      2. Assert: 출력에 "DB_INSERT_OK" 포함
    Expected Result: asyncpg로 transactions 테이블에 정상 INSERT/SELECT
    Evidence: 스크립트 출력

  Scenario: 봇 Embed 응답 코드 존재 확인
    Tool: Bash (grep)
    Steps:
      1. grep -n "Embed" bot/main.py
      2. Assert: discord.Embed 생성 코드 존재
      3. grep -n "add_field" bot/main.py
      4. Assert: 금액/상호명/카테고리 필드 추가 코드 존재
    Expected Result: Discord Embed 응답 로직 구현됨
    Evidence: grep 출력 캡처
  ```

  **Commit**: YES
  - Message: `feat(bot): Toss receipt parser, category mapping, DB storage, and Embed response`
  - Files: `bot/parser.py`, `bot/categories.py`, `bot/db.py`, `bot/main.py`, `bot/test_parser.py`
  - Pre-commit: `conda run -n poor_guy python -m pytest bot/test_parser.py`

---

- [ ] 5. End-to-End 통합 검증

  **What to do**:
  - 전체 파이프라인 검증 (conda 환경에서 수동 시뮬레이션):
    1. PostgreSQL 컨테이너 정상 실행 확인
    2. 봇 프로세스 기동 (tmux) → Discord 연결 확인
    3. 파서 + 카테고리 + DB 저장 파이프라인을 Python 스크립트로 E2E 테스트
    4. DB에 저장된 데이터 psql로 조회 확인
  - 누락된 연동 이슈 발견 시 수정
  - 봇 종료 시 커넥션 풀 정리 확인

  **Must NOT do**:
  - 새로운 기능 추가하지 않음
  - 웹 대시보드 검증하지 않음 (Phase 2)
  - Docker Compose 설정하지 않음
  - 검증 외 작업하지 않음

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: 기존 구현의 통합 검증만 수행
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `playwright`: 웹 UI 없음 (Phase 1)
    - `frontend-ui-ux`: 프론트엔드 작업 아님

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (final, sequential)
  - **Blocks**: None (최종 태스크)
  - **Blocked By**: ALL (Tasks 1-4)

  **References**:
  - Tasks 1-4에서 생성한 모든 파일

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: PostgreSQL 컨테이너 정상 실행 확인
    Tool: Bash (docker)
    Steps:
      1. docker ps --filter "name=poordb" --format "{{.Names}} {{.Status}}"
      2. Assert: poordb 컨테이너 "Up" 상태
      3. docker exec poordb pg_isready -U postgres -d poordb
      4. Assert: "accepting connections" 출력
    Expected Result: DB 접근 가능
    Evidence: docker ps 출력

  Scenario: 봇 프로세스 기동 및 Discord 연결 확인
    Tool: interactive_bash (tmux)
    Preconditions: .env에 DISCORD_BOT_TOKEN 설정됨
    Steps:
      1. tmux new-session -d -s e2e-bot "conda run -n poor_guy python bot/main.py"
      2. sleep 15
      3. tmux capture-pane -t e2e-bot -p
      4. Assert: 출력에 "logged in" 또는 "ready" 메시지 존재
      5. Assert: 출력에 "ERROR" 또는 "Traceback" 없음
      6. tmux kill-session -t e2e-bot
    Expected Result: 봇이 정상적으로 Discord에 연결되고 에러 없음
    Evidence: tmux 출력 캡처

  Scenario: 파서 → 카테고리 → DB 저장 E2E 파이프라인
    Tool: Bash (conda run)
    Preconditions: PostgreSQL 컨테이너 실행 중
    Steps:
      1. conda run -n poor_guy python -c "
         import asyncio
         from bot.ocr import extract_text
         from bot.parser import parse_toss_transaction
         from bot.categories import get_category
         from bot.db import create_pool, insert_transaction

         async def e2e_test():
             # 1. 파서 테스트 (OCR 결과 시뮬레이션)
             sample_text = '홍길동님에게\n25,000원\n보냈어요\n2026.02.20 14:30\n토스뱅크 계좌에서'
             data = parse_toss_transaction(sample_text)
             assert data is not None, 'Parser returned None'
             assert data['amount'] == 25000

             # 2. 카테고리 분류
             category = get_category(data.get('merchant', ''))
             data['category'] = category

             # 3. DB 저장
             pool = await create_pool()
             await insert_transaction(pool, data)

             # 4. DB 조회 확인
             row = await pool.fetchrow(
                 'SELECT * FROM transactions ORDER BY created_at DESC LIMIT 1'
             )
             assert row is not None
             assert row['amount'] == 25000
             print(f'E2E_OK: amount={row[\"amount\"]}, merchant={row[\"merchant\"]}, category={row[\"category\"]}')

             # 5. 테스트 데이터 정리
             await pool.execute('DELETE FROM transactions WHERE amount = 25000')
             await pool.close()

         asyncio.run(e2e_test())
         "
      2. Assert: 출력에 "E2E_OK" 포함
      3. Assert: amount=25000 출력됨
    Expected Result: 전체 파이프라인 (파싱 → 카테고리 → DB 저장 → 조회) 정상 동작
    Evidence: 스크립트 출력 캡처

  Scenario: DB에 저장된 데이터 psql 직접 확인
    Tool: Bash (docker exec)
    Steps:
      1. conda run -n poor_guy python -c "
         import asyncio
         from bot.db import create_pool, insert_transaction
         async def seed():
             pool = await create_pool()
             await insert_transaction(pool, {
                 'amount': 99999,
                 'merchant': 'e2e_verify',
                 'category': '기타',
                 'direction': 'EXPENSE',
                 'raw_ocr_text': 'e2e test',
             })
             await pool.close()
         asyncio.run(seed())
         "
      2. docker exec poordb psql -U postgres -d poordb -c "SELECT id, amount, merchant, category, direction FROM transactions WHERE merchant = 'e2e_verify';"
      3. Assert: 출력에 amount=99999, merchant=e2e_verify, category=기타 포함
      4. docker exec poordb psql -U postgres -d poordb -c "DELETE FROM transactions WHERE merchant = 'e2e_verify';"
    Expected Result: Python으로 저장한 데이터를 psql로 직접 확인 가능
    Evidence: psql 출력 캡처
  ```

  **Commit**: NO (검증만, 코드 변경 없음. 버그 발견 시 해당 태스크 파일에서 수정 후 fix 커밋)

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `chore: project scaffolding with requirements, .gitignore, .env.example` | `bot/`, `secrets/.gitkeep`, `requirements.txt`, `.gitignore`, `.env.example` | `conda run -n poor_guy pip list` |
| 2 | `feat(db): PostgreSQL Docker container and transactions schema` | `bot/schema.sql` | `docker exec poordb psql -U postgres -d poordb -c "\dt"` |
| 3 | `feat(bot): Discord bot with Google Vision OCR image recognition` | `bot/main.py`, `bot/ocr.py` | `conda run -n poor_guy python -c "from bot.ocr import extract_text; print('OK')"` |
| 4 | `feat(bot): Toss receipt parser, category mapping, DB storage, and Embed response` | `bot/parser.py`, `bot/categories.py`, `bot/db.py`, `bot/main.py`, `bot/test_parser.py` | `conda run -n poor_guy python -m pytest bot/test_parser.py` |

---

## Success Criteria

### Verification Commands
```bash
# 1. conda env 확인
conda run -n poor_guy python --version  # Expected: Python 3.12.x

# 2. 의존성 패키지 설치 확인
conda run -n poor_guy pip list | grep -E "discord|google-cloud-vision|asyncpg"
# Expected: discord.py, google-cloud-vision, asyncpg 패키지 존재

# 3. PostgreSQL 컨테이너 확인
docker exec poordb pg_isready -U postgres -d poordb
# Expected: accepting connections

# 4. DB 스키마 확인
docker exec poordb psql -U postgres -d poordb -c "\dt"
# Expected: transactions 테이블 존재

# 5. 파서 테스트
conda run -n poor_guy python -m pytest bot/test_parser.py -v
# Expected: all tests passed

# 6. 봇 모듈 임포트 확인
conda run -n poor_guy python -c "from bot.ocr import extract_text; from bot.parser import parse_toss_transaction; from bot.db import create_pool; print('ALL_IMPORTS_OK')"
# Expected: ALL_IMPORTS_OK
```

### Final Checklist
- [ ] conda env `poor_guy`에서 봇 실행 시 Discord에 정상 연결
- [ ] OCR 모듈이 Google Cloud Vision API 호출 가능
- [ ] 파서가 토스 텍스트를 구조화된 데이터로 변환
- [ ] 카테고리 자동 분류 동작
- [ ] PostgreSQL에 트랜잭션 저장됨
- [ ] 봇이 Discord Embed로 파싱 결과 요약 응답
- [ ] `.env.example`에 모든 필수 환경변수 문서화
- [ ] `.gitignore`에 secrets, credentials 제외됨
- [ ] Python 코드에 ORM 없음 (asyncpg raw SQL만)
- [ ] Docker는 PostgreSQL 컨테이너만 사용 (봇은 conda에서 직접 실행)

---

## Folder Structure (Final — Phase 1)

```
poor-guy/
├── bot/
│   ├── __init__.py           # Package init
│   ├── main.py               # Discord bot entry point
│   ├── ocr.py                # Google Vision API wrapper
│   ├── parser.py             # Toss receipt text → structured data
│   ├── db.py                 # asyncpg insert functions
│   ├── categories.py         # Hardcoded merchant→category mapping
│   ├── schema.sql            # PostgreSQL table creation SQL
│   └── test_parser.py        # Parser unit tests (pytest)
├── secrets/
│   └── .gitkeep              # GCP key goes here (gitignored)
├── requirements.txt          # Python dependencies
├── .env.example              # Environment variable documentation
├── .gitignore                # Git exclusions
└── .sisyphus/                # Planning files
```
