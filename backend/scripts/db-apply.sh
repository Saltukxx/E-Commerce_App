#!/usr/bin/env sh
# Apply pending Prisma migrations and regenerate the client. Set DATABASE_URL first.
# Usage (from repo): backend/scripts/db-apply.sh
set -eu
cd "$(dirname "$0")/.."
exec npm run db:deploy
