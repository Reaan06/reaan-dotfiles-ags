#!/bin/bash

# Colores y Formato
BOLD=$(tput bold)
GREEN=$(tput setaf 2)
CYAN=$(tput setaf 6)
YELLOW=$(tput setaf 3)
RED=$(tput setaf 1)
RESET=$(tput sgr0)

print_header() { echo -e "\n${BOLD}${CYAN}========================================\n  $1\n========================================${RESET}\n"; }

print_header "INSTALACIÓN COMPLETA DE DEPENDENCIAS"

# 1. Actualizar sistema
echo -e "${YELLOW}Actualizando bases de datos...${RESET}"
sudo pacman -Syu --noconfirm

# 2. Instalar dependencias base y herramientas de construcción (necesarias para AGS y AUR)
echo -e "${CYAN}Instalando dependencias base...${RESET}"
sudo pacman -S --needed --noconfirm base-devel git stow jq brightnessctl bluez bluez-utils networkmanager pavucontrol playerctl

# 3. Instalación de AGS (desde repositorios oficiales o AUR vía yay)
if ! command -v ags &> /dev/null; then
    echo -e "${YELLOW}AGS no encontrado. Instalando desde AUR...${RESET}"
    if command -v yay &> /dev/null; then
        yay -S --noconfirm ags
    elif command -v paru &> /dev/null; then
        paru -S --noconfirm ags
    else
        echo -e "${RED}Error: No se encontró un gestor de AUR (yay/paru). Instala 'ags' manualmente.${RESET}"
    fi
fi

# 4. Instalación de aplicaciones para el Dock
echo -e "${CYAN}Instalando aplicaciones para el Dock...${RESET}"
sudo pacman -S --needed --noconfirm hyprland waybar rofi-wayland alacritty ttf-jetbrains-mono-nerd firefox fzf ripgrep bat starship gnome-control-center gnome-text-editor nautilus libcanberra gnome-calendar shotwell cheese vlc rhythmbox libreoffice-fresh

# 5. Aplicar configuraciones (Stow)
echo -e "${CYAN}Aplicando configuraciones con Stow...${RESET}"
cd "$DOTFILES_DIR/stow" || exit
stow -R hyprland zsh ags

# 6. Lanzar AGS
echo -e "${GREEN}Iniciando AGS...${RESET}"
pkill ags
ags --config ~/.config/ags/config.js &

echo -e "\n${BOLD}${GREEN}✔ Instalación completa. AGS iniciado.${RESET}\n"
