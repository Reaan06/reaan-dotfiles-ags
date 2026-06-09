Topbar Typelib Requirements (Arch/Hyprland)

This project relies on GObject Introspection typelibs provided to the Node/AGS runtime via the `gi://` import scheme. On Arch Linux (Hyprland setups) these are usually provided by the following packages or AUR helpers.

Recommended packages (Arch):
- gst-plugins-good
- gobject-introspection
- libgirepository
- astal-hyprland (AUR) — provides the AstalHyprland typelib used by the topbar

Install example (Arch):
1) sudo pacman -Syu gobject-introspection glib2
2) Use your AUR helper to install astal-hyprland or any Astal typelibs:
   paru -S astal-hyprland

Testing headful (local) environment
- Unit tests run headless in CI and cannot exercise gi:// imports. For full end-to-end tests run on a machine with a display server and the AGS runtime installed:
  1) Ensure `ags` is on PATH and the `gnim` runtime available to AGS.
  2) Run: ags run app.ts

This document provides minimal guidance — the actual package names may vary; consult your distro or the repo's install scripts for details.
