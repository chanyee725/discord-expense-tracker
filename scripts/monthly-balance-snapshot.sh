#!/bin/bash

# Monthly Balance Snapshot Script
# Run this script at the start of each month via cron

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

source "$PROJECT_ROOT/.env" 2>/dev/null || true

if [ -z "$CRON_API_KEY" ]; then
  echo "ERROR: CRON_API_KEY not set in .env"
  exit 1
fi

API_URL="${API_URL:-http://localhost:3000}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "$API_URL/api/balance-snapshot" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $CRON_API_KEY" \
  -d '{}')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS: $BODY"
  exit 0
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] FAILED (HTTP $HTTP_CODE): $BODY"
  exit 1
fi
