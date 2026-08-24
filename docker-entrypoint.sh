#!/bin/sh
set -e

# Wait for optional SMTP service
if [ -n "$SMTP_HOST" ] && [ "$SMTP_HOST" != "localhost" ]; then
  echo "Waiting for SMTP at $SMTP_HOST:${SMTP_PORT:-1025}..."
  for i in $(seq 1 30); do
    nc -z "$SMTP_HOST" "${SMTP_PORT:-1025}" 2>/dev/null && break
    sleep 2
  done
fi

exec node dist/index.js
