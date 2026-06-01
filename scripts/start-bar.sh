#!/bin/bash

# Script para iniciar la nueva barra AGS y cerrar otros paneles existentes
echo "Cerrando otros paneles existentes..."

# Lista de procesos de barras comunes
BARS=("waybar" "polybar" "ags" "eww")

for bar in "${BARS[@]}"; do
  if pgrep -x "$bar" > /dev/null; then
    echo "Cerrando $bar..."
    pkill -x "$bar"
  fi
done

echo "Iniciando nueva barra AGS (Astal)..."
# Iniciar en segundo plano usando 'ags run' especificando GTK 3
ags run main.ts --gtk 3 &

echo "Barra iniciada con éxito."
