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

# Runtime check: ensure ags binary exists and warn about gnim runtime mismatch
if command -v ags >/dev/null 2>&1; then
  echo "ags found: $(ags --version 2>/dev/null || echo 'unknown')"
else
  echo "Warning: 'ags' not found in PATH — please install AGS runtime"
fi

# Ejecutar usando ags run sobre el nuevo punto de entrada app.ts
ags run app.ts &

echo "Barra iniciada con éxito."
