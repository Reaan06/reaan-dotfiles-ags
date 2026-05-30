/**
 * service/theme.ts — Theme Engine Service
 *
 * Único módulo responsable de invocar pywal o matugen para generar paletas
 * de colores desde el wallpaper, exportar variables CSS semánticas y recargar
 * los estilos de todos los widgets activos sin reiniciar el proceso AGS.
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.6, 7.7, 9.6
 */

import Service from "resource:///com/github/Aylur/ags/service.js";
import { Variable } from "resource:///com/github/Aylur/ags/variable.js";
import App from "resource:///com/github/Aylur/ags/app.js";
import GLib from "gi://GLib";

import type { AppConfig, ThemePalette } from "../util/types.js";
import { execAsync } from "../util/exec.js";
import { logger } from "../util/logger.js";
import { mapPaletteToSemantic, type RawPalette } from "../theme/variables.js";

const MODULE = "ThemeService";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

/** Path where pywal writes its JSON color cache. */
const PYWAL_COLORS_JSON = `${GLib.get_home_dir()}/.cache/wal/colors.json`;

/** Path where matugen writes its generated CSS. */
const MATUGEN_COLORS_CSS = `${GLib.get_home_dir()}/.config/matugen/colors.css`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Read a file synchronously via GLib and return its contents as a string.
 * Returns null if the file does not exist or cannot be read.
 */
function readFileSync(path: string): string | null {
  try {
    const [ok, bytes] = GLib.file_get_contents(path);
    if (!ok || !bytes) return null;
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

/**
 * Write a string to a file synchronously via GLib.
 * Creates parent directories as needed.
 * Returns true on success, false on failure.
 */
function writeFileSync(path: string, content: string): boolean {
  try {
    // Ensure parent directory exists.
    const dir = path.substring(0, path.lastIndexOf("/"));
    GLib.mkdir_with_parents(dir, 0o755);
    return GLib.file_set_contents(path, content);
  } catch (e) {
    logger.error(MODULE, `Failed to write file: ${path}`, e);
    return false;
  }
}

/**
 * Check whether a file exists using GLib.
 */
function fileExists(path: string): boolean {
  return GLib.file_test(path, GLib.FileTest.EXISTS);
}

/**
 * Build a CSS `:root { }` block from a `ThemePalette`.
 */
function buildCssFromPalette(palette: ThemePalette): string {
  return [
    ":root {",
    `  --background:     ${palette.background};`,
    `  --surface:        ${palette.surface};`,
    `  --surface-alt:    ${palette.surfaceAlt};`,
    `  --foreground:     ${palette.foreground};`,
    `  --foreground-dim: ${palette.foregroundDim};`,
    `  --accent:         ${palette.accent};`,
    `  --accent-alt:     ${palette.accentAlt};`,
    `  --warning:        ${palette.warning};`,
    `  --success:        ${palette.success};`,
    `  --on-accent:      ${palette.onAccent};`,
    "}",
    "",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Pywal palette reader
// ---------------------------------------------------------------------------

/**
 * Parse pywal's `~/.cache/wal/colors.json` into a `RawPalette`.
 *
 * The JSON structure produced by pywal looks like:
 * ```json
 * {
 *   "colors": { "color0": "#1a1a2e", "color1": "#e94560", ... },
 *   "special": { "background": "#1a1a2e", "foreground": "#cdd6f4", "cursor": "#cdd6f4" }
 * }
 * ```
 */
function parsePywalColors(json: string): RawPalette | null {
  try {
    const data = JSON.parse(json) as {
      colors?: Record<string, string>;
      special?: Record<string, string>;
    };
    if (!data.colors) return null;
    // Merge colors and special into a flat map.
    return { ...data.colors, ...(data.special ?? {}) };
  } catch (e) {
    logger.error(MODULE, "Failed to parse pywal colors.json", e);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Matugen palette reader
// ---------------------------------------------------------------------------

/**
 * Parse matugen's generated CSS file into a `RawPalette`.
 *
 * Matugen writes a CSS file with custom properties like:
 * ```css
 * :root {
 *   --background: #1a1a2e;
 *   --primary: #cba6f7;
 *   ...
 * }
 * ```
 * We extract the variable name (without `--`) and its value.
 */
function parseMatugenColors(css: string): RawPalette | null {
  const palette: RawPalette = {};
  // Match lines like:  --variable-name: #hexcolor;
  const re = /--([a-z][a-z0-9-]*):\s*([^;]+);/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(css)) !== null) {
    palette[match[1]] = match[2].trim();
  }
  return Object.keys(palette).length > 0 ? palette : null;
}

// ---------------------------------------------------------------------------
// ThemeService
// ---------------------------------------------------------------------------

/**
 * ThemeService manages dynamic theme generation and CSS hot-reload.
 *
 * Responsibilities:
 *  - Apply an existing generated theme on startup, or fall back to the static
 *    Catppuccin Mocha palette if none exists.
 *  - Invoke pywal or matugen to generate a new palette from a wallpaper image.
 *  - Export the generated palette as semantic CSS custom properties.
 *  - Hot-reload all widget styles via `App.applyCss()` without restarting AGS.
 *  - Notify the user (via an injected notify callback) when a backend is
 *    unavailable or fails.
 */
export class ThemeService extends Service {
  static {
    Service.register(this, {}, {
      currentTheme: ["string", "r"],
    });
  }

  /** The identifier of the currently active theme ("fallback" or image path). */
  readonly currentTheme = new Variable<string>("fallback");

  private readonly _backend: "pywal" | "matugen";
  private readonly _cssPath: string;
  private readonly _fallbackPath: string;

  /**
   * Optional callback to send a user-visible notification.
   * Injected at construction time to avoid a circular dependency with
   * NotificationService (which itself may depend on ThemeService indirectly).
   */
  private readonly _notify: (summary: string, body: string) => void;

  constructor(
    config: AppConfig,
    notify: (summary: string, body: string) => void = () => undefined,
  ) {
    super();
    this._backend = config.themeBackend;
    this._cssPath = `${GLib.get_home_dir()}/.cache/ags/theme.css`;
    this._fallbackPath = `${App.configDir}/theme/fallback.css`;
    this._notify = notify;
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Apply the theme on startup.
   *
   * If `~/.cache/ags/theme.css` exists it is applied directly (the result of
   * a previous `generateFromWallpaper` call).  Otherwise the static fallback
   * palette is applied.
   *
   * Requirement 7.7
   */
  async applyInitial(): Promise<void> {
    if (fileExists(this._cssPath)) {
      logger.info(MODULE, `Applying cached theme: ${this._cssPath}`);
      App.applyCss(this._cssPath);
    } else {
      logger.info(MODULE, "No cached theme found, applying fallback");
      await this._applyFallback();
    }
  }

  /**
   * Generate a new theme from a wallpaper image and hot-reload all widgets.
   *
   * Invokes the configured backend (pywal or matugen), reads the generated
   * palette, maps it to semantic CSS variables, writes `~/.cache/ags/theme.css`,
   * and calls `App.applyCss()` for an instant hot-reload.
   *
   * If the backend is not installed or fails, the user is notified and the
   * previous theme is preserved.
   *
   * Requirements: 7.1, 7.2, 7.3, 7.4, 7.6
   *
   * @param imagePath  Absolute path to the wallpaper image.
   */
  async generateFromWallpaper(imagePath: string): Promise<void> {
    logger.info(MODULE, `Generating theme from wallpaper: ${imagePath} (backend: ${this._backend})`);

    try {
      await this._runBackend(imagePath);
      await this._exportSemanticVariables();
      App.applyCss(this._cssPath);
      this.currentTheme.setValue(imagePath);
      logger.info(MODULE, "Theme applied successfully");
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      logger.error(MODULE, "Backend failed or not installed", e);

      // Requirement 7.6 — notify the user with a descriptive error message.
      this._notify(
        "Theme generation failed",
        `Backend "${this._backend}" is not installed or failed: ${err}. The previous theme has been preserved.`,
      );

      // Requirement 7.6 — maintain the previous theme (do not apply fallback
      // here; the previous theme.css, if any, is already loaded).
    }
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  /**
   * Invoke the configured backend to generate a raw palette from the image.
   *
   * Requirement 7.4
   */
  private async _runBackend(imagePath: string): Promise<void> {
    if (this._backend === "pywal") {
      // wal writes colors.json to ~/.cache/wal/
      await execAsync(`wal -i "${imagePath}" --backend haishoku`);
    } else {
      // matugen writes a CSS file to ~/.config/matugen/colors.css
      await execAsync(`matugen image "${imagePath}" --type scheme-tonal-spot`);
    }
  }

  /**
   * Read the palette produced by the backend, map it to semantic CSS custom
   * properties, and write the result to `~/.cache/ags/theme.css`.
   *
   * Requirements: 7.2, 7.5
   */
  private async _exportSemanticVariables(): Promise<void> {
    const rawPalette = this._readRawPalette();

    if (!rawPalette) {
      throw new Error(
        `Could not read palette from ${this._backend === "pywal" ? PYWAL_COLORS_JSON : MATUGEN_COLORS_CSS}`,
      );
    }

    const semanticPalette: ThemePalette = mapPaletteToSemantic(rawPalette, this._backend);
    const css = buildCssFromPalette(semanticPalette);

    const ok = writeFileSync(this._cssPath, css);
    if (!ok) {
      throw new Error(`Failed to write theme CSS to ${this._cssPath}`);
    }

    logger.debug(MODULE, `Semantic variables written to ${this._cssPath}`);
  }

  /**
   * Read the raw palette file produced by the active backend.
   * Returns null if the file is missing or cannot be parsed.
   */
  private _readRawPalette(): RawPalette | null {
    if (this._backend === "pywal") {
      const json = readFileSync(PYWAL_COLORS_JSON);
      if (!json) {
        logger.warn(MODULE, `pywal colors.json not found at ${PYWAL_COLORS_JSON}`);
        return null;
      }
      return parsePywalColors(json);
    } else {
      const css = readFileSync(MATUGEN_COLORS_CSS);
      if (!css) {
        logger.warn(MODULE, `matugen colors.css not found at ${MATUGEN_COLORS_CSS}`);
        return null;
      }
      return parseMatugenColors(css);
    }
  }

  /**
   * Apply the static fallback theme (Catppuccin Mocha).
   *
   * Requirement 7.7
   */
  private async _applyFallback(): Promise<void> {
    if (fileExists(this._fallbackPath)) {
      App.applyCss(this._fallbackPath);
    } else {
      // Last-resort inline fallback if the file is somehow missing.
      logger.warn(MODULE, `Fallback CSS not found at ${this._fallbackPath}, using inline fallback`);
      const inlineFallback = [
        ":root {",
        "  --background:     #1e1e2e;",
        "  --surface:        #313244;",
        "  --surface-alt:    #45475a;",
        "  --foreground:     #cdd6f4;",
        "  --foreground-dim: #a6adc8;",
        "  --accent:         #cba6f7;",
        "  --accent-alt:     #89b4fa;",
        "  --warning:        #f38ba8;",
        "  --success:        #a6e3a1;",
        "  --on-accent:      #1e1e2e;",
        "}",
        "",
      ].join("\n");
      writeFileSync(this._cssPath, inlineFallback);
      App.applyCss(this._cssPath);
    }
    this.currentTheme.setValue("fallback");
  }
}
