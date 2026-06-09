#!/usr/bin/env bash
set -euo pipefail

# Arch-targeted installer guidance script for reaan-dotfiles-ags
# This script does NOT install anything. It only checks for required tools
# and prints actionable instructions for the user.

echo "Checking Arch Linux prerequisites for Astal (AGS) bar..."

if ! command -v pacman >/dev/null 2>&1; then
  echo "Error: pacman not found. This script targets Arch Linux."
  echo "If you're on Arch/Manjaro, ensure pacman is available and try again."
  echo "Example: sudo pacman -Syu"
  exit 2
fi

missing=()

# Check for ags binary
if command -v ags >/dev/null 2>&1; then
  echo "ags: found ($(ags --version 2>/dev/null || echo 'version unknown'))"
else
  missing+=("ags")
fi

# Check for gnim Node module presence by attempting node resolution if node exists
if command -v node >/dev/null 2>&1; then
  if node -e "try{require.resolve('gnim'); console.log('ok');}catch(e){process.exit(1)}" >/dev/null 2>&1; then
    echo "gnim: found in node resolution"
  else
    missing+=("gnim (Node module)")
  fi
else
  echo "node: not found; cannot check gnim module via node."
  missing+=("gnim (Node module) - (node not installed)")
fi

# Check for GObject Introspection typelib for Astal/Hyprland (g-ir-inspect or pkg-config)
typelib_ok=false
if command -v g-ir-inspect >/dev/null 2>&1; then
  if g-ir-inspect Astal >/dev/null 2>&1; then
    typelib_ok=true
  fi
fi
if ! $typelib_ok; then
  # Fallback: suggest pkg-config or pacman query
  echo "Note: Could not detect GObject Introspection typelib for Astal/Hyprland." 
  missing+=("GI typelib (gobject-introspection / Astal typelib)")
fi

if [ ${#missing[@]} -eq 0 ]; then
  echo "All checks passed. Your environment looks ready for running the bar."
  echo "Run: ./scripts/start-bar.sh or npm run run"
  exit 0
fi

echo
echo "Missing prerequisites detected:" 
for m in "${missing[@]}"; do
  echo "  - $m"
done

echo
echo "Suggested commands for Arch Linux (do NOT run from this script):"
echo "  # Update system packages"
echo "  sudo pacman -Syu"
echo
echo "  # Search for packages with pacman"
echo "  pacman -Qs <keyword>   # example: pacman -Qs ags"
echo
echo "Notes:"
echo "  - 'ags' may be available in the AUR. Use an AUR helper such as 'yay' or 'paru' to install it:"
echo "      yay -S ags"
echo "  - The 'gnim' runtime is a Node module used by AGS. If you have npm/pnpm installed, you can install it locally:"
echo "      npm install --no-save gnim"
echo "  - For GObject Introspection typelibs, install the corresponding dev packages. Example packages to consider:"
echo "      sudo pacman -S gobject-introspection gir-astaldk gir-1.0-astal-1.0  # package names vary by distro/repo"
echo "  - Use 'pacman -Qs astal' or 'pacman -Qs hyprland' to search for related packages"

exit 1
