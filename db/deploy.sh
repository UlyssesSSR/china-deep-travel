#!/usr/bin/env bash
# ============================================================
# China Deep Travel — Database Deployment Script
# Usage: bash db/deploy.sh            (apply schema + seed)
#        bash db/deploy.sh --seed-only
#        bash db/deploy.sh --schema-only
#
# Requires: psql on PATH and DATABASE_URL env var (or .env.local)
# ============================================================
set -euo pipefail

# --- Load .env.local if present (Node-free) ---
if [ -f .env.local ]; then
  echo "→ Loading variables from .env.local"
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
elif [ -f .env ]; then
  echo "→ Loading variables from .env"
  set -a
  source .env
  set +a
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "❌ DATABASE_URL is not set. Copy .env.example to .env.local and fill it in."
  exit 1
fi

SCHEMA="db/schema.sql"
SEED="db/seed.sql"

MODE="${1:-all}"

run_sql() {
  local file="$1"
  echo "→ Applying $file"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$file"
}

case "$MODE" in
  --schema-only)
    run_sql "$SCHEMA"
    ;;
  --seed-only)
    run_sql "$SEED"
    ;;
  all|*)
    run_sql "$SCHEMA"
    run_sql "$SEED"
    ;;
esac

echo "✅ Database deployment finished."
echo "   Next: configure .env.local, then run 'npm run dev'."
