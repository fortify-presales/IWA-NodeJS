#!/bin/sh
set -e

if [ "$RESET_DATA_ON_START" = "true" ]; then
  echo "RESET_DATA_ON_START=true; removing runtime database, sessions, uploads, and restore files..."

  rm -f ./data/iwa.sqlite ./data/iwa.sqlite-* ./data/sessions.sqlite ./data/sessions.sqlite-*

  upload_dir="${UPLOAD_DIR:-./data/uploads}"
  if [ -n "$upload_dir" ] && [ "$upload_dir" != "/" ] && [ "$upload_dir" != "." ]; then
    rm -rf "$upload_dir"
  fi

  rm -rf ./data/restore
  mkdir -p ./data ./logs "$upload_dir" ./data/restore
fi

# Wait for optional SMTP service
if [ -n "$SMTP_HOST" ] && [ "$SMTP_HOST" != "localhost" ]; then
  echo "Waiting for SMTP at $SMTP_HOST:${SMTP_PORT:-1025}..."
  for i in $(seq 1 30); do
    nc -z "$SMTP_HOST" "${SMTP_PORT:-1025}" 2>/dev/null && break
    sleep 2
  done
fi

exec node dist/index.js
