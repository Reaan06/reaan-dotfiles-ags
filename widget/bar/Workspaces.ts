/**
 * widget/bar/Workspaces.ts — Botones reactivos de workspace
 *
 * Renderiza un botón por cada workspace activo en Hyprland.
 * Aplica clases CSS `active` y `occupied` según el estado del workspace.
 * Al hacer clic despacha el cambio de workspace vía HyprlandService.
 *
 * Requirements: 3.2, 3.3
 */

import Box from "resource:///com/github/Aylur/ags/widgets/box.js";
import Button from "resource:///com/github/Aylur/ags/widgets/button.js";
import type { HyprlandService, Workspace } from "../../service/hyprland.js";

export default ({ hyprland }: { hyprland: HyprlandService }) =>
  Box({
    className: "workspaces",
    children: hyprland.workspaces.bind().as((workspaces: Workspace[]) =>
      workspaces.map((ws: Workspace) =>
        Button({
          className: `workspace-btn ${ws.active ? "active" : ""} ${ws.occupied ? "occupied" : ""}`.trim(),
          label: ws.name || String(ws.id),
          onClicked: () => hyprland.dispatch(ws.id),
        })
      )
    ),
  });
