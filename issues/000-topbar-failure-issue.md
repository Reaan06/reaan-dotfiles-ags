Título: Triage: topbar-failure — shim, soporte Arch, y verificación headful

Resumen
- Se detectó un fallo al arrancar la barra: falta de typelib GObject (AstalHyprland) y uso de una API no disponible (createState(...).poll) en el runtime AGS/gnim.
- Se implementó un shim temporal (src/compat/gnim-poll-shim.ts), se migraron Clock y Weather a createStateWithPoll, y se añadieron tests headless y scripts de ayuda para Arch.

Objetivo del ticket
- Coordinar los pasos restantes para validar y estabilizar la solución en máquinas con Hyprland + AGS sobre Arch Linux, limpiar archivos personales accidentalmente commiteados y preparar CI para cubrir pruebas headful si procede.

Checklist (PRIORIDAD)
- [ ] Ejecutar pruebas headful en una máquina con Hyprland + AGS:
  - pkill -x ags || true
  - ags run app.ts > /tmp/ags_run.log 2>&1 & echo $! > /tmp/ags_pid
  - sleep 2
  - sed -n '1,400p' /tmp/ags_run.log
  - Verificar ausencia de:
    - "Typelib file for namespace 'AstalHyprland'"
    - "TypeError: createState(...).poll is not a function"
- [ ] Confirmar instalación del typelib AstalHyprland en las máquinas objetivo (instalar mediante pacman o AUR si corresponde).
- [ ] Revisar y limpiar archivos añadidos con rutas de usuario (~/.config/ags/...) en el repo; moverlos a dotfiles/ o removerlos y actualizar .gitignore.
- [ ] Decidir sobre lockfile: generar y commitear package-lock.json para CI reproducible (si se acepta: ejecutar npm install --package-lock-only y commitear).
- [ ] Añadir (opcional) job CI con Xvfb/Wayland para pruebas headful o documentar un runner manual para integraciones GUI.
- [ ] Revisar shim y plan de migración: establecer fecha tope para remover shim (ej.: 1 release mayor) y crear ticket de eliminación futura.

Archivos clave modificados/añadidos
- src/compat/gnim-poll-shim.ts — shim temporal
- app.ts — import early del shim
- widget/Bar/modules/Clock.tsx, Weather.tsx — migración a createStateWithPoll
- scripts/start-bar.sh, scripts/install_arch.sh — checks e instrucciones Arch
- tests/unit/* y tests/scripts/* — tests añadidos

Comandos útiles para ops (Arch)
- Sincronizar y buscar paquetes: sudo pacman -Syu && pacman -Qs ags
- Instalar desde AUR (ejemplo con yay): yay -S ags
- Instalar GObject Introspection y herramientas: sudo pacman -S gobject-introspection gjs
- Si falta typelib específico, buscar paquete que lo provea o compilar el binding según upstream de AstalHyprland.

Notas de verificación y reproducibilidad
- Tests headless: npx vitest --run
- Shell syntax checks: bash -n scripts/start-bar.sh
- Integración AGS: ejecutar los pasos de "Ejecutar pruebas headful" arriba en máquina con display.

Asignación y prioridad
- Prioridad: alta (experiencia de usuario rota en Hyprland)
- Asignar a: @maintainer (o dejar sin asignar)

Referencias
- sdd/topbar-failure/* (artifacts en Engram): proposal, spec, tasks, apply-progress, verify-report, arch-installer

