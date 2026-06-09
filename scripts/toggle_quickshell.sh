#!/bin/bash

# Colores
BOLD=$(tput bold)
GREEN=$(tput setaf 2)
YELLOW=$(tput setaf 3)
RED=$(tput setaf 1)
CYAN=$(tput setaf 6)
RESET=$(tput sgr0)

# Funciones de estilo
print_info() { echo -e "${CYAN}${BOLD}[INFO]${RESET} $1"; }
print_success() { echo -e "${GREEN}${BOLD}[OK]${RESET} $1"; }

DOTFILES_DIR=$(dirname "$(readlink -f "$0")")/..
STOW_DIR="$DOTFILES_DIR/stow"
CONFIG_PATH="$HOME/.config/quickshell"

print_info "Gestionando configuraciones de Quickshell..."

cd "$STOW_DIR" || exit

if [ -L "$CONFIG_PATH" ]; then
    print_info "Desactivando Quickshell..."
    stow -D quickshell
    echo -e "${RED}${BOLD}✖ Quickshell apagado.${RESET}"
else
    print_info "Activando Quickshell..."
    stow quickshell
    print_success "Quickshell encendido."
fi
