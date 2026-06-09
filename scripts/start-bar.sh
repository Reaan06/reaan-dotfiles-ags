#!/bin/bash

# Script para iniciar la nueva barra Astal (AGS v2)
echo "Cerrando paneles existentes..."

BARS=("waybar" "polybar" "ags" "eww")

for bar in "${BARS[@]}"; do
  if pgrep -x "$bar" > /dev/null; then
    echo "Cerrando $bar..."
    pkill -x "$bar"
  fi
done

echo "Iniciando barra con Astal (AGS v2)..."

# Runtime checks: if running on Arch, provide guided instructions
if command -v pacman >/dev/null 2>&1; then
  echo "Detected pacman (Arch). Running Arch preflight checks..."
  if ! scripts/install_arch.sh >/dev/null 2>&1; then
    echo "One or more prerequisites are missing for Arch."
    echo "Run: ./scripts/install_arch.sh to see guided install commands."
    exit 1
  fi
fi

# Runtime check: ensure ags binary exists and warn about gnim runtime mismatch
if command -v ags >/dev/null 2>&1; then
  echo "ags found: $(ags --version 2>/dev/null || echo 'unknown')"
else
  echo "Warning: 'ags' not found in PATH — please install AGS runtime (see scripts/install_arch.sh on Arch)"
fi

# Ejecutar usando ags run sobre el nuevo punto de entrada app.ts
echo "Starting AGS: ags run app.ts"
ags run app.ts &

echo "Barra iniciada (AGS launched)."
