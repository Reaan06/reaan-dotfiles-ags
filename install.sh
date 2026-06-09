#!/bin/bash

# Colores y Formato
BOLD=$(tput bold)
GREEN=$(tput setaf 2)
CYAN=$(tput setaf 6)
RESET=$(tput sgr0)

# Directorio base
DOTFILES_DIR=$(pwd)
HYPR_CONF="$HOME/.config/hypr/hyprland.conf"
AGS_CMD="exec-once = ags --config ~/.config/ags/config.js"

print_header() { echo -e "\n${BOLD}${CYAN}========================================\n  $1\n========================================${RESET}\n"; }

clear
print_header "FINALIZANDO INSTALACIÓN Y CONFIGURANDO AUTORUN"

# 1. Instalar aplicaciones y aplicar configuraciones
bash "$DOTFILES_DIR/scripts/install_apps.sh"

# 2. Configurar el inicio automático en Hyprland
print_header "CONFIGURANDO AUTORUN"
if [ -f "$HYPR_CONF" ]; then
    if ! grep -q "ags" "$HYPR_CONF"; then
        echo "$AGS_CMD" >> "$HYPR_CONF"
        echo -e "${GREEN}✔ AGS añadido al inicio automático de Hyprland.${RESET}"
    else
        echo -e "${GREEN}✔ AGS ya está configurado en hyprland.conf.${RESET}"
    fi
else
    echo -e "${CYAN}! No se encontró hyprland.conf. Asegúrate de añadir manualmente:${RESET}"
    echo -e "${BOLD}$AGS_CMD${RESET}"
fi

echo -e "\n${BOLD}${GREEN}✔ Instalación y configuración completada.${RESET}\n"
