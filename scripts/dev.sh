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

wait -n "$BACKEND_PID" "$FRONTEND_PID"
