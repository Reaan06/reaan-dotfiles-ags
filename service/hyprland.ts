/**
 * service/hyprland.ts — Integración IPC Hyprland (AGS v3)
 *
 * Re-exporta el singleton de AstalHyprland y helpers de parseo.
 * En AGS v3, la integración con Hyprland se hace directamente
 * via gi://AstalHyprland (no el viejo Service de AGS v1).
 */

import AstalHyprland from "astal/hyprland"
import type { Workspace, ActiveWindow } from "../util/types.js"

// Re-export types for consumers that import from this module
export type { Workspace, ActiveWindow }

// ---------------------------------------------------------------------------
// Pure parsing helpers (mantenidos para compatibilidad con tests)
// ---------------------------------------------------------------------------

interface HyprctlWorkspace {
    id: number
    name: string
    windows: number
}

/**
 * Parse the JSON output of `hyprctl workspaces -j` into typed Workspace objects.
 */
export function parseWorkspaces(
    raw: HyprctlWorkspace[],
    activeId: number,
): Workspace[] {
    return raw.map((w) => ({
        id: w.id,
        name: w.name,
        occupied: w.windows > 0,
        active: w.id === activeId,
    }))
}

/**
 * Parse a single `activewindow>>class,title` IPC event line into an ActiveWindow.
 */
export function parseActiveWindowEvent(data: string): ActiveWindow {
    const commaIdx = data.indexOf(",")
    if (commaIdx === -1) {
        return { class: data, title: "" }
    }
    return {
        class: data.slice(0, commaIdx),
        title: data.slice(commaIdx + 1),
    }
}

// ---------------------------------------------------------------------------
// Singleton de AstalHyprland exportado
// ---------------------------------------------------------------------------

/**
 * Instancia singleton de AstalHyprland.
 * Los widgets usan bind(hyprland, "workspaces"), bind(hyprland, "focusedWorkspace"), etc.
 */
export const hyprland = AstalHyprland.get_default()
