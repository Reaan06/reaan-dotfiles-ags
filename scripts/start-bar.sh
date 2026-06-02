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
# Ejecutar usando ags run sobre el nuevo punto de entrada app.ts
ags run app.ts &

echo "Barra iniciada con éxito."
