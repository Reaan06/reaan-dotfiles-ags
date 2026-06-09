#!/usr/bin/env bash
set -euo pipefail

# Syntax test for scripts/start-bar.sh
bash -n scripts/start-bar.sh
echo "start-bar.sh: syntax OK"
