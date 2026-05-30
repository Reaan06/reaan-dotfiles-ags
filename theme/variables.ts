/**
 * theme/variables.ts — Semantic CSS variable mappings for pywal and matugen
 *
 * Defines the mapping from raw palette keys (backend-specific) to semantic
 * CSS custom properties consumed by all widgets. The `mapPaletteToSemantic`
 * function is a pure function with no side effects, making it fully testable.
 *
 * Requirements: 7.5
 */

import type { ThemePalette } from "../util/types.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Raw palette as produced by pywal or matugen — a flat map of key → CSS color.
 */
export type RawPalette = Record<string, string>;

// ---------------------------------------------------------------------------
// Mappings
// ---------------------------------------------------------------------------

/**
 * Maps semantic CSS variable names to pywal color keys.
 * pywal generates color0–color15 where:
 *   color0  = background
 *   color8  = bright black (elevated surface)
 *   color15 = bright white (foreground)
 *   color4  = blue / accent
 *   color1  = red / warning
 *   color2  = green / success
 */
export const SEMANTIC_MAPPING = {
  "--background": "color0",
  "--surface":    "color8",
  "--foreground": "color15",
  "--accent":     "color4",
  "--warning":    "color1",
  "--success":    "color2",
} as const;

/**
 * Maps semantic CSS variable names to matugen Material You color roles.
 */
export const MATUGEN_MAPPING = {
  "--background": "background",
  "--surface":    "surface",
  "--foreground": "on-background",
  "--accent":     "primary",
  "--warning":    "error",
  "--success":    "tertiary",
} as const;

// ---------------------------------------------------------------------------
// Pure mapping function
// ---------------------------------------------------------------------------

/**
 * Maps a raw backend palette to a semantic `ThemePalette`.
 *
 * This is a pure function: given the same inputs it always returns the same
 * output and produces no side effects.
 *
 * Missing keys in the raw palette are handled gracefully by falling back to
 * an empty string so callers can detect and substitute a fallback color.
 *
 * @param palette  Flat map of backend color keys to CSS color strings.
 * @param backend  Which backend produced the palette ("pywal" | "matugen").
 * @returns        A `ThemePalette` with semantic color values.
 */
export function mapPaletteToSemantic(
  palette: RawPalette,
  backend: "pywal" | "matugen",
): ThemePalette {
  const mapping = backend === "pywal" ? SEMANTIC_MAPPING : MATUGEN_MAPPING;

  const get = (cssVar: keyof typeof mapping): string =>
    palette[mapping[cssVar]] ?? "";

  return {
    background:    get("--background"),
    surface:       get("--surface"),
    // surfaceAlt and foregroundDim have no direct mapping in either backend;
    // derive them from the closest available color or leave empty for fallback.
    surfaceAlt:    palette[backend === "pywal" ? "color7" : "surface-variant"] ?? "",
    foreground:    get("--foreground"),
    foregroundDim: palette[backend === "pywal" ? "color7" : "on-surface-variant"] ?? "",
    accent:        get("--accent"),
    // accentAlt: use color6 (cyan) for pywal, secondary for matugen
    accentAlt:     palette[backend === "pywal" ? "color6" : "secondary"] ?? "",
    warning:       get("--warning"),
    success:       get("--success"),
    // onAccent: use color0 (background) for pywal, on-primary for matugen
    onAccent:      palette[backend === "pywal" ? "color0" : "on-primary"] ?? "",
  };
}
