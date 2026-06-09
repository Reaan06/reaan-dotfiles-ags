#!/usr/bin/env bash
set -euo pipefail

# Test: simulate missing pacman to ensure install_arch.sh returns exit 2 with helpful message
PATH_backup="$PATH"
export PATH="/nonexistent"

output=$(scripts/install_arch.sh 2>&1 || true)
status=$?

echo "Captured exit status: $status"
echo "$output" | sed -n '1,200p'

if [ "$status" -ne 2 ]; then
  echo "Expected exit code 2 when pacman is missing, got $status"
  exit 1
fi

if ! echo "$output" | grep -qi "pacman not found"; then
  echo "Expected guidance about pacman not found"
  exit 1
fi

echo "install_arch.sh: behavior with missing pacman OK"

export PATH="$PATH_backup"
