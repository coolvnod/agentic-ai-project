#!/usr/bin/env bash
set -euo pipefail

if [ "${EUID:-$(id -u)}" -eq 0 ]; then
  echo "Do not run Agentic-Office with sudo. Run: ./start.sh" >&2
  exit 1
fi

cd "$(dirname "$0")"

ENV_FILE=".env"
if [ -f "$ENV_FILE" ]; then
  set -a
  source "$ENV_FILE"
  set +a
fi

AGENTIC_OFFICE_DIR="$HOME/.openclaw/agentic-office"
mkdir -p "$AGENTIC_OFFICE_DIR"
PID_FILE="$AGENTIC_OFFICE_DIR/agentic-office.pid"
LOG_FILE="$AGENTIC_OFFICE_DIR/agentic-office.log"
HOST="${AGENTIC_OFFICE_HOST:-192.168.1.200}"
PORT="${AGENTIC_OFFICE_PORT:-3000}"

port_is_listening() {
  local port="$1"
  if command -v ss >/dev/null 2>&1; then
    ss -ltn 2>/dev/null | grep -q ":${port}\\b"
    return $?
  fi

  if command -v lsof >/dev/null 2>&1; then
    lsof -nP -iTCP:"${port}" -sTCP:LISTEN >/dev/null 2>&1
    return $?
  fi

  if command -v netstat >/dev/null 2>&1; then
    netstat -an 2>/dev/null | grep -E "[\.:]${port}[[:space:]].*LISTEN" >/dev/null
    return $?
  fi

  return 1
}

./stop.sh
sleep 1

pnpm -r build

NODE_FLAGS=""
if [ "${AGENTIC_OFFICE_DEV_MODE:-}" = "true" ]; then
  NODE_FLAGS="--watch --enable-source-maps"
fi

pushd packages/backend >/dev/null
AGENTIC_OFFICE_PORT="$PORT" AGENTIC_OFFICE_HOST="$HOST" nohup node $NODE_FLAGS dist/server.js > "$LOG_FILE" 2>&1 &
PID=$!
popd >/dev/null

echo "$PID" > "$PID_FILE"

echo "Agentic-Office starting... (PID: $PID)"
echo "Logs: tail -f $LOG_FILE"
echo "URL: http://$HOST:$PORT"

sleep 2

if ! kill -0 "$PID" 2>/dev/null; then
  echo "Agentic-Office failed to start: process $PID is not running." >&2
  rm -f "$PID_FILE"
  exit 1
fi

if ! port_is_listening "$PORT"; then
  echo "Agentic-Office failed to bind port $PORT." >&2
  exit 1
fi

echo "Agentic-Office started successfully."
