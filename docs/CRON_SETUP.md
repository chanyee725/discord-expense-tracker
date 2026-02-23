# Cron 설정 가이드

## 자동 반복 지출/수입 생성

매일 자정에 자동으로 오늘 날짜에 해당하는 반복 지출/수입을 생성합니다.

## 설정 방법

### 1. 환경 변수 확인

`.env` 파일에 `CRON_API_KEY`가 설정되어 있는지 확인:

```bash
CRON_API_KEY=your-secret-key-here
```

없으면 추가:

```bash
echo "CRON_API_KEY=$(openssl rand -hex 32)" >> .env
```

### 2. Cron 작업 등록

```bash
crontab -e
```

다음 줄 추가 (매일 자정에 실행):

```cron
0 0 * * * /home/byungchan/Desktop/poor-guy/scripts/daily-recurring-cron.sh >> /home/byungchan/Desktop/poor-guy/logs/cron.log 2>&1
```

또는 프로덕션 서버라면:

```cron
0 0 * * * cd /path/to/poor-guy && ./scripts/daily-recurring-cron.sh >> ./logs/cron.log 2>&1
```

### 3. 로그 디렉토리 생성

```bash
mkdir -p /home/byungchan/Desktop/poor-guy/logs
```

### 4. 수동 테스트

스크립트가 제대로 작동하는지 테스트:

```bash
./scripts/daily-recurring-cron.sh
```

예상 출력:

```
[2026-02-23 00:00:00] SUCCESS: {"generated":1,"skipped":0}
```

## 작동 방식

### 매일 자정에 실행되는 내용

1. **오늘 날짜 확인**: 예) 2월 23일
2. **해당 날짜의 템플릿 찾기**: `day_of_month = 23`인 템플릿
3. **아직 생성 안 된 거만 생성**: `recurring_transaction_log`에 없는 것
4. **주말이면 다음 평일로**: 일요일 → 월요일, 토요일 → 월요일

### 예시

**2월 14일 자정**:
- "네이버 플러스 맴버쉽" (day_of_month=14) 템플릿 찾음
- 2월 14일(토요일) → 2월 16일(월요일)로 생성
- 4,900원 지출 트랜잭션 생성

**2월 22일 자정**:
- "차량 할부금" (day_of_month=22) 템플릿 찾음
- 2월 22일(일요일) → 2월 23일(월요일)로 생성
- 345,000원 지출 트랜잭션 생성

## 대시보드 로드 시 보완

대시보드를 열면 `RecurringCheckTrigger`가:
- 이번 달에 누락된 과거 날짜들을 체크
- 누락된 것들을 한꺼번에 생성 (보험 장치)

예) 2월 20일부터 서버가 다운되어 cron이 실행 안 됨
→ 2월 25일에 대시보드 열면 20일, 22일 템플릿들이 자동 생성됨

## 문제 해결

### Cron이 실행 안 됨

```bash
# Cron 로그 확인
cat /home/byungchan/Desktop/poor-guy/logs/cron.log

# Cron 작업 목록 확인
crontab -l

# 수동으로 실행해서 에러 확인
./scripts/daily-recurring-cron.sh
```

### API 키 에러

```
ERROR: CRON_API_KEY not set in .env
```

→ `.env` 파일에 `CRON_API_KEY` 추가

### 401 Unauthorized

```
FAILED (HTTP 401): {"error":"Unauthorized"}
```

→ `.env`의 `CRON_API_KEY`와 서버 환경 변수가 일치하는지 확인

### 서버가 안 떠있음

```
curl: (7) Failed to connect to localhost port 3000
```

→ Next.js 개발 서버 또는 프로덕션 서버가 실행 중인지 확인

## 프로덕션 배포 시

프로덕션 환경에서는:

1. **서버 URL 설정**:
   ```bash
   export API_URL=https://your-domain.com
   ```

2. **PM2와 함께 사용** (Node.js 프로세스 관리):
   ```bash
   pm2 start npm --name "poor-guy" -- run start
   pm2 startup
   pm2 save
   ```

3. **Cron 설정**:
   ```cron
   0 0 * * * export API_URL=https://your-domain.com && /path/to/scripts/daily-recurring-cron.sh >> /path/to/logs/cron.log 2>&1
   ```

또는 **클라우드 스케줄러 사용**:
- AWS EventBridge
- GCP Cloud Scheduler
- Vercel Cron Jobs

예) Vercel Cron (vercel.json):

```json
{
  "crons": [
    {
      "path": "/api/recurring-generate",
      "schedule": "0 0 * * *"
    }
  ]
}
```
