#!/usr/bin/env bash
set -euo pipefail

# Test: simulate missing pacman to ensure install_arch.sh returns exit 2 with helpful message
PATH_backup="$PATH"

# Resolve a concrete shell binary before stomping PATH so we can still run the script
bash_bin="$(command -v bash || true)"
if [ -z "$bash_bin" ]; then
  echo "No bash binary found to run tests — skipping." >&2
  exit 2
fi

export PATH="/nonexistent"

# Run script via bash to ensure we can use parameter expansion for checks
set +e
output=$("$bash_bin" scripts/install_arch.sh 2>&1)
status=$?
set -e

echo "Captured exit status: $status"
echo "$output"

if [ "$status" -ne 2 ]; then
  echo "Expected exit code 2 when pacman is missing, got $status"
  export PATH="$PATH_backup"
  exit 1
fi

# Case-insensitive match using bash lowercase expansion
lower_output="${output,,}"
if [[ "$lower_output" != *"pacman not found"* ]]; then
  echo "Expected guidance about pacman not found"
  export PATH="$PATH_backup"
  exit 1
fi

echo "install_arch.sh: behavior with missing pacman OK"

export PATH="$PATH_backup"
