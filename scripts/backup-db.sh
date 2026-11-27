#!/usr/bin/env bash
# Dumps the LGU Connect database to ./backups (compressed, custom format) and keeps the newest 14.
# Usage:  npm run db:backup            (reads DATABASE_URL from .env.local)
# Restore: pg_restore --clean --if-exists -d "$DATABASE_URL" backups/<file>.dump
# Schedule it nightly (cron, launchd, or Task Scheduler) and copy the folder off the server.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -z "${DATABASE_URL:-}" ] && [ -f .env.local ]; then
  DATABASE_URL="$(grep -E '^DATABASE_URL=' .env.local | head -1 | cut -d= -f2- | tr -d '"')"
fi
if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set (add it to .env.local)." >&2
  exit 1
fi
# pg_dump does not understand Prisma's ?schema= parameter.
URL="${DATABASE_URL%%\?*}"

mkdir -p backups
FILE="backups/lgu_connect-$(date +%Y%m%d-%H%M%S).dump"
pg_dump --format=custom --no-owner --file="$FILE" "$URL"
echo "Backup written: $FILE ($(du -h "$FILE" | cut -f1))"

# Keep the newest 14 backups.
ls -1t backups/lgu_connect-*.dump 2>/dev/null | tail -n +15 | while read -r old; do rm -f -- "$old"; done
