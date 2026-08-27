#!/usr/bin/env bash
# Start the API and web app together for local development.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  trap - EXIT INT TERM
  [ -n "$BACKEND_PID" ] && kill "$BACKEND_PID" 2>/dev/null || true
  [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null || true
  wait 2>/dev/null || true
}

trap cleanup EXIT INT TERM

(
  cd "$ROOT_DIR/backend"
  exec ./.venv/bin/python run.py
) &
BACKEND_PID=$!

(
  cd "$ROOT_DIR/frontend"
  exec npm run dev
) &
FRONTEND_PID=$!

# `wait -n` needs bash 4.3+, but macOS ships bash 3.2 by default (Apple
# won't ship a GPLv3 bash), so poll instead for portability.
while kill -0 "$BACKEND_PID" 2>/dev/null && kill -0 "$FRONTEND_PID" 2>/dev/null; do
  sleep 1
done
