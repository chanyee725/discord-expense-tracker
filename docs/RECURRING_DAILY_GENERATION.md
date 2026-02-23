# 반복 지출/수입 일별 자동 생성 시스템

## 변경 사항 요약

### 이전 방식 (문제점)
- **실행 시점**: 대시보드 로드 시 1회만 실행
- **생성 범위**: 해당 월의 모든 템플릿을 한꺼번에 생성
- **문제**: 사용자가 대시보드를 안 열면 반복 지출이 생성되지 않음

### 새로운 방식 (해결)
- **실행 시점**: 매일 자정 자동 실행 (cron)
- **생성 범위**: 오늘 날짜에 해당하는 템플릿만 생성
- **보험 장치**: 대시보드 로드 시 누락된 모든 템플릿 생성 (catch-up)

---

## 기술적 변경

### 1. `generateRecurringTransactions()` 함수 수정

```typescript
// 이전
generateRecurringTransactions(year: number, month: number)

// 이후
generateRecurringTransactions(year: number, month: number, day?: number)
```

- `day` 파라미터가 제공되면: 해당 날짜의 템플릿만 생성
- `day` 파라미터가 없으면: 모든 템플릿 생성 (기존 동작 유지)

### 2. API Route 업데이트

**파일**: `web/src/app/api/recurring-generate/route.ts`

```typescript
// 기본값: 오늘 날짜
const year = body.year ?? now.getFullYear();
const month = body.month ?? now.getMonth() + 1;
const day = body.day ?? now.getDate();

const result = await generateRecurringTransactions(year, month, day);
```

### 3. Cron 스크립트 추가

**파일**: `scripts/daily-recurring-cron.sh`

- 매일 자정에 실행되는 Bash 스크립트
- API를 호출하여 오늘 날짜의 반복 지출/수입 생성
- 실행 결과를 로그에 기록

### 4. 테스트 추가

**파일**: `web/src/__tests__/queries/recurring-generation.test.ts`

- 새로운 테스트 2개 추가 (총 47개 테스트, 모두 통과)
- `filters by day when day parameter is provided`
- `generates all templates when day parameter is omitted`

---

## 사용 방법

### 1. 환경 변수 설정

```bash
# .env 파일에 추가 (이미 추가됨)
CRON_API_KEY=a92d909a19f8b75f10c8eedbafce926c5c3ae377fb9de10adcba546f9dcb190c
```

### 2. Cron 작업 등록

```bash
crontab -e
```

다음 줄 추가:

```cron
# 매일 자정에 실행
0 0 * * * /home/byungchan/Desktop/poor-guy/scripts/daily-recurring-cron.sh >> /home/byungchan/Desktop/poor-guy/logs/cron.log 2>&1
```

### 3. 로그 디렉토리 생성

```bash
mkdir -p /home/byungchan/Desktop/poor-guy/logs
```

### 4. 수동 테스트

```bash
./scripts/daily-recurring-cron.sh
```

예상 출력:

```
[2026-02-23 00:00:00] SUCCESS: {"generated":1,"skipped":0}
```

---

## 작동 방식

### 매일 자정 (Cron)

```
2월 14일 자정:
  → API 호출: POST /api/recurring-generate (day=14)
  → "네이버 플러스 맴버쉽" 템플릿 찾기 (day_of_month=14)
  → 2월 14일(토요일) → 2월 16일(월요일)로 트랜잭션 생성
  → recurring_transaction_log에 기록

2월 22일 자정:
  → API 호출: POST /api/recurring-generate (day=22)
  → "차량 할부금" 템플릿 찾기 (day_of_month=22)
  → 2월 22일(일요일) → 2월 23일(월요일)로 트랜잭션 생성
  → recurring_transaction_log에 기록
```

### 대시보드 로드 (보험 장치)

```
사용자가 2월 25일에 대시보드 접속:
  → RecurringCheckTrigger 실행
  → generateRecurringTransactions(2026, 2) // day 파라미터 없음
  → 2월의 모든 템플릿 중 아직 생성 안 된 것 찾기
  → 만약 20일, 22일이 누락되어 있으면 한꺼번에 생성
  → recurring_transaction_log에 기록
```

---

## 실제 테스트 결과

### 테스트 1: day=22만 생성

```bash
curl -X POST http://localhost:3000/api/recurring-generate \
  -H "x-api-key: $CRON_API_KEY" \
  -d '{"year": 2026, "month": 2, "day": 22}'
```

**결과**:
```json
{"generated": 1, "skipped": 0}
```

**데이터베이스 확인**:
```
    title     | day_of_month | transaction_date 
--------------+--------------+------------------
 차량 할부금  |           22 | 2월 23일
```

### 테스트 2: day=14만 생성

```bash
curl -X POST http://localhost:3000/api/recurring-generate \
  -H "x-api-key: $CRON_API_KEY" \
  -d '{"year": 2026, "month": 2, "day": 14}'
```

**결과**:
```json
{"generated": 1, "skipped": 0}
```

**데이터베이스 확인**:
```
        title         | day_of_month | transaction_date 
----------------------+--------------+------------------
 네이버 플러스 맴버쉽 |           14 | 2월 16일
```

### 테스트 3: Cron 스크립트 실행 (오늘 = 2월 23일)

```bash
./scripts/daily-recurring-cron.sh
```

**결과**:
```
[2026-02-23 22:31:14] SUCCESS: {"generated":1,"skipped":0}
```

**데이터베이스 확인**:
```
 title  | day_of_month | transaction_date 
--------+--------------+------------------
 통신비 |           23 | 2월 23일
```

✅ **오늘 날짜(23일)에 등록된 "통신비" 템플릿만 정확히 생성됨!**

---

## 파일 변경 내역

### 새로 추가된 파일

1. **`scripts/daily-recurring-cron.sh`**
   - 매일 자정에 실행되는 Bash 스크립트
   - API 호출 및 로깅 처리

2. **`docs/CRON_SETUP.md`**
   - Cron 설정 상세 가이드
   - 문제 해결 방법
   - 프로덕션 배포 가이드

3. **`bot/migrations/008_recurring_transaction_log.sql`**
   - 이전 세션에서 만들어진 마이그레이션 (이제 커밋됨)

4. **`web/src/app/api/recurring-generate/route.ts`**
   - 이전 세션에서 만들어진 API (이제 커밋됨)

5. **`web/src/__tests__/queries/recurring-generation.test.ts`**
   - 이전 세션에서 만들어진 테스트 (이제 커밋됨)

### 수정된 파일

1. **`web/src/lib/queries.ts`**
   - `generateRecurringTransactions()` 함수에 `day?: number` 파라미터 추가
   - day 파라미터가 있으면 해당 날짜 템플릿만 필터링

2. **`web/src/app/api/recurring-generate/route.ts`**
   - year, month, day 기본값을 오늘 날짜로 설정
   - day 파라미터 유효성 검사 추가

---

## 테스트 결과

```bash
npm test
```

**출력**:
```
✓ src/__tests__/setup.test.ts (1 test)
✓ src/__tests__/queries/app-settings.test.ts (4 tests)
✓ src/__tests__/queries/income.test.ts (6 tests)
✓ src/__tests__/queries/bank-accounts.test.ts (8 tests)
✓ src/__tests__/queries/categories.test.ts (6 tests)
✓ src/__tests__/queries/recurring-transactions.test.ts (10 tests)
✓ src/__tests__/queries/recurring-generation.test.ts (12 tests)

Test Files  7 passed (7)
Tests  47 passed (47)
```

✅ **47개 테스트 모두 통과**

---

## 커밋 정보

**커밋**: `925d53c`
**메시지**: `feat(recurring): add daily cron-based recurring transaction generation`

**변경된 파일**: 14개
**추가**: +1351 라인
**삭제**: -3 라인

---

## 다음 단계

### 1. Cron 작업 등록 (필수)

```bash
crontab -e

# 다음 줄 추가
0 0 * * * /home/byungchan/Desktop/poor-guy/scripts/daily-recurring-cron.sh >> /home/byungchan/Desktop/poor-guy/logs/cron.log 2>&1
```

### 2. 로그 모니터링

```bash
# 실시간 로그 확인
tail -f /home/byungchan/Desktop/poor-guy/logs/cron.log
```

### 3. 프로덕션 배포 시

- `docs/CRON_SETUP.md` 참고
- 클라우드 스케줄러 사용 권장 (AWS EventBridge, GCP Cloud Scheduler, Vercel Cron 등)

---

## 문제 해결

### Cron이 실행 안 됨

```bash
# 1. Cron 작업 확인
crontab -l

# 2. 로그 확인
cat /home/byungchan/Desktop/poor-guy/logs/cron.log

# 3. 수동 실행해서 에러 확인
./scripts/daily-recurring-cron.sh
```

### API 키 에러

```
ERROR: CRON_API_KEY not set in .env
```

→ `.env` 파일에 `CRON_API_KEY` 추가 (이미 추가됨)

### 서버가 안 떠있음

```
curl: (7) Failed to connect to localhost port 3000
```

→ Next.js 서버 실행 여부 확인:
```bash
cd web && npm run dev
# 또는 프로덕션
npm run build && npm start
```

---

## 요약

✅ **매일 자정에 오늘 날짜의 반복 지출/수입만 자동 생성**
✅ **대시보드 로드 시 누락된 것들 자동 보완**
✅ **주말 → 평일 이동 로직 유지**
✅ **중복 생성 방지 (UNIQUE 제약)**
✅ **47개 테스트 모두 통과**
✅ **실제 테스트로 검증 완료**

이제 **crontab에 등록**만 하면 완전히 자동화됩니다!
