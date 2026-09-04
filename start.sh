#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-4173}"
printf 'Local site: http://localhost:%s\n' "$PORT"
PORT="$PORT" npm run dev
