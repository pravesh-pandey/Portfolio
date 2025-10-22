#!/usr/bin/env bash

set -euo pipefail

cleanup() {
  trap - INT TERM EXIT
  [[ -n "${SERVER_PID:-}" ]] && kill "$SERVER_PID" 2>/dev/null || true
  [[ -n "${CLIENT_PID:-}" ]] && kill "$CLIENT_PID" 2>/dev/null || true
}

trap cleanup INT TERM EXIT

(cd server && npm run dev) &
SERVER_PID=$!

(cd client && npm run dev) &
CLIENT_PID=$!

wait
