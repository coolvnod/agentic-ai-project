#!/usr/bin/env bash
set -euo pipefail

AGENTIC_OFFICE_DIR="$HOME/.openclaw/agentic-office"
PID_FILE="$AGENTIC_OFFICE_DIR/agentic-office.pid"
STOPPED=0

CURRENT_USER="$(id -un)"
UNSTOPPABLE_PIDS=()

kill_if_running() {
  local pid="$1"
  if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
    kill "$pid" 2>/dev/null || true
    sleep 0.5
    if kill -0 "$pid" 2>/dev/null; then
      kill -9 "$pid" 2>/dev/null || true
    fi

    if kill -0 "$pid" 2>/dev/null; then
      UNSTOPPABLE_PIDS+=("$pid")
    else
      STOPPED=1
    fi
  fi
}

if [[ -f "$PID_FILE" ]]; then
  PID="$(cat "$PID_FILE")"
  kill_if_running "$PID"
fi

for pid in $(pgrep -f "dist/server.js" 2>/dev/null || true); do
  kill_if_running "$pid"
done

PORT="${AGENTIC_OFFICE_PORT:-3000}"
for pid in $(lsof -ti tcp:"$PORT" -sTCP:LISTEN 2>/dev/null || true); do
  kill_if_running "$pid"
done

# Also clear default port listeners just in case .env changed mid-run.
if [[ "$PORT" != "3000" ]]; then
  for pid in $(lsof -ti tcp:3000 -sTCP:LISTEN 2>/dev/null || true); do
    kill_if_running "$pid"
  done
fi

rm -f "$PID_FILE"

if [[ ${#UNSTOPPABLE_PIDS[@]} -gt 0 ]]; then
  echo "Some processes could not be stopped (likely started with sudo/root): ${UNSTOPPABLE_PIDS[*]}" >&2
  echo "Run this once, then retry ./stop.sh:" >&2
  echo "  sudo kill -9 ${UNSTOPPABLE_PIDS[*]}" >&2
  exit 1
fi

if [[ "$STOPPED" -eq 1 ]]; then
  echo "Agentic-Office stopped."
else
  echo "Agentic-Office was not running."
fi
