#!/usr/bin/env bash
set -euo pipefail

REMOTE="${DEPLOY_HOST:-durmusbaba}"
REMOTE_DIR="${DEPLOY_DIR:-/opt/durmusbaba}"
COMPOSE_FILE="docker-compose.prod.yml"

echo "==> Syncing project to ${REMOTE}:${REMOTE_DIR}"
ssh "$REMOTE" "mkdir -p ${REMOTE_DIR}"

rsync -az --delete \
  --exclude node_modules \
  --exclude .git \
  --exclude backend/uploads \
  --exclude '**/.next' \
  --exclude presentation/build \
  --exclude '*.xlsx' \
  --exclude '*.xls' \
  --exclude '*.pdf' \
  --exclude '*.png' \
  --exclude '*.tar' \
  ./ "${REMOTE}:${REMOTE_DIR}/"

echo "==> Building and starting stack"
ssh "$REMOTE" "cd ${REMOTE_DIR} && docker compose -f ${COMPOSE_FILE} --env-file .env up -d --build"

echo "==> Running migrations"
ssh "$REMOTE" "cd ${REMOTE_DIR} && docker compose -f ${COMPOSE_FILE} exec -T api npx prisma migrate deploy"

echo "==> Smoke tests"
curl -sf "http://167.172.168.81:3001/api/v1/products?limit=1" | head -c 200
echo ""
curl -sf -o /dev/null -w "web:%{http_code}\n" "http://167.172.168.81/"
curl -sf -o /dev/null -w "api80:%{http_code}\n" "http://167.172.168.81/api/v1/products?limit=1"

echo "Deploy complete."
