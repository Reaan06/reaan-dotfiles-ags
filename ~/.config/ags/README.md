# macOS-style Dock for Hyprland using AGS v1

## Setup
Ensure you have `ags` installed.

## Launch
```bash
ags --config ~/.config/ags/config.js
```

## Hyprland Config
Add this line to your `hyprland.conf`:
```
bind = SUPER, SPACE, exec, ags -r "togglePinned()"
```
