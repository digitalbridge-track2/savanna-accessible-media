#!/bin/bash
set -e

echo "Starting FastAPI transcript-api backend on 127.0.0.1:8000..."
python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 &
API_PID=$!

# Wait for FastAPI to become ready
for i in {1..30}; do
  if curl -sf http://127.0.0.1:8000/health > /dev/null 2>&1; then
    echo "✓ FastAPI Level 2 backend is healthy on 127.0.0.1:8000"
    break
  fi
  sleep 0.5
done

# Graceful shutdown handler
shutdown() {
  echo "Received stop signal, shutting down services..."
  kill -TERM "$API_PID" 2>/dev/null
  kill -TERM "$NGINX_PID" 2>/dev/null
  wait "$API_PID" 2>/dev/null
  wait "$NGINX_PID" 2>/dev/null
  exit 0
}

trap shutdown SIGTERM SIGINT

echo "Starting Nginx frontend and reverse-proxy on port 80..."
nginx -g "daemon off;" &
NGINX_PID=$!

# Wait for either process to exit
wait -n "$API_PID" "$NGINX_PID"
