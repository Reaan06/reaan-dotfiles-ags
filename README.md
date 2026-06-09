# reaan-dotfiles-ags

... (project README)

## Arch Linux + Hyprland + AGS setup

This project provides a bar for Hyprland using the AGS runtime. The repository includes helper scripts to guide installation on Arch Linux.

Preflight checks

1. Ensure you're on Arch/Manjaro (pacman available):
   - pacman --version

2. Run the Arch installer guidance script (it will not install anything; it prints instructions):
   - ./scripts/install_arch.sh

Suggested install commands (examples)

- Update system:
  - sudo pacman -Syu

- Search for packages:
  - pacman -Qs <keyword>   # e.g. pacman -Qs ags

- AGS may be in the AUR. Use an AUR helper if needed:
  - yay -S ags

- Node module runtime (gnim):
  - npm install --no-save gnim

- GObject Introspection / typelibs:
  - sudo pacman -S gobject-introspection
  - pacman -Qs astal  # search for related typelibs

Running the bar

1. Start the bar (on a machine with a display server and Hyprland running):
   - ./scripts/start-bar.sh
   - or: npm run run

2. Capture logs for troubleshooting:
   - pkill -x ags || true
   - ags run app.ts > /tmp/ags_run.log 2>&1 &
   - sleep 2 && sed -n '1,200p' /tmp/ags_run.log

Tests

Shell-level tests are provided under tests/scripts. Run them locally with bash:

  bash tests/scripts/start-bar.syntax.test.sh
  bash tests/scripts/install_arch.output.test.sh

JS/TS tests (vitest):

  npx vitest

Notes

- A compatibility shim for createState().poll is included in src/compat and is temporary. When the runtime provides a native API, remove the shim.
