/**
 * util/types.ts — Shared TypeScript interfaces and types
 *
 * Central export point for all shared types used across services and widgets.
 * Requirements: 1.1, 9.1
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * Application configuration object with all user-configurable options.
 * Loaded from config/config.ts with validated defaults.
 */
export interface AppConfig {
  /** Clock display format. Default: "HH:mm" */
  clockFormat: string;
  /** Theme generation backend. Default: "pywal" */
  themeBackend: "pywal" | "matugen";
  /** Volume adjustment step in percent. Default: 5 */
  volumeStep: number;
  /** Position for notification popups. Default: "top-right" */
  notificationPosition: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  /** Keybind to open the launcher. Default: "Super+Space" */
  launcherKeybind: string;
  /** Maximum number of notifications kept in history. Default: 50 */
  notificationHistoryLimit: number;
  /** Topbar height in pixels. Default: 40 */
  barHeight: number;
}

// ---------------------------------------------------------------------------
// Hyprland IPC
// ---------------------------------------------------------------------------

/**
 * A Hyprland virtual workspace.
 */
export interface Workspace {
  /** Numeric workspace identifier assigned by Hyprland */
  id: number;
  /** Human-readable workspace name */
  name: string;
  /** True when the workspace has at least one open window */
  occupied: boolean;
  /** True when this is the currently focused workspace */
  active: boolean;
}

/**
 * The window that currently holds keyboard focus.
 */
export interface ActiveWindow {
  /** Window title (WM_NAME / _NET_WM_NAME) */
  title: string;
  /** Application class (WM_CLASS) */
  class: string;
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

/**
 * Reason codes for the D-Bus NotificationClosed signal.
 * Maps to the unsigned integer values defined in the spec:
 *   1 = expired, 2 = dismissed-by-user, 3 = action-invoked, 4 = undefined
 */
export type DismissReason = "expired" | "dismissed-by-user" | "action-invoked";

/**
 * A desktop notification received via org.freedesktop.Notifications D-Bus.
 */
export interface Notification {
  /** Unique identifier assigned by the notification daemon */
  id: number;
  /** Name of the sending application */
  appName: string;
  /** Short summary / title of the notification */
  summary: string;
  /** Full notification body text (may contain markup) */
  body: string;
  /** Icon name or file path */
  icon: string;
  /** Auto-dismiss timeout in milliseconds; 0 means never auto-dismiss */
  timeout: number;
  /** List of action buttons provided by the sender */
  actions: Array<{ id: string; label: string }>;
  /** Unix timestamp (ms) when the notification was received */
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Application Launcher
// ---------------------------------------------------------------------------

/**
 * A parsed entry from a .desktop file (XDG Desktop Entry Specification).
 */
export interface AppEntry {
  /** Application display name (Name= field) */
  name: string;
  /** Command to execute, with %f/%u/etc. placeholders stripped */
  exec: string;
  /** Icon name or absolute path (Icon= field) */
  icon?: string;
  /** Short description shown in the launcher (Comment= field) */
  description?: string;
  /** Semicolon-separated category list (Categories= field) */
  categories?: string[];
  /** True when NoDisplay=true is set; such entries are hidden from the launcher */
  noDisplay?: boolean;
}

// ---------------------------------------------------------------------------
// Theme Engine
// ---------------------------------------------------------------------------

/**
 * Semantic color palette produced by the theme engine.
 * All values are CSS color strings (hex, rgb, hsl, etc.).
 */
export interface ThemePalette {
  /** Main window / desktop background color */
  background: string;
  /** Elevated surface color (cards, panels) */
  surface: string;
  /** Secondary surface variant */
  surfaceAlt: string;
  /** Primary text color */
  foreground: string;
  /** Dimmed / secondary text color */
  foregroundDim: string;
  /** Primary accent / highlight color */
  accent: string;
  /** Secondary accent color */
  accentAlt: string;
  /** Warning / error color */
  warning: string;
  /** Success / positive color */
  success: string;
  /** Text color rendered on top of accent backgrounds */
  onAccent: string;
}

// ---------------------------------------------------------------------------
// Wayland Layer Shell
// ---------------------------------------------------------------------------

/**
 * Configuration for a Wayland Layer Shell window (gtk-layer-shell).
 */
export interface LayerWindow {
  /** Unique window name used by AGS to identify the window */
  name: string;
  /** Layer Shell layer the window is placed on */
  layer: "background" | "bottom" | "top" | "overlay";
  /** Edges the window is anchored to */
  anchor: Array<"top" | "bottom" | "left" | "right">;
  /** How the window interacts with the exclusive zone */
  exclusivity: "exclusive" | "normal" | "ignore";
  /** Keyboard interactivity mode */
  keymode: "none" | "exclusive" | "on-demand";
  /** Monitor index; -1 means all monitors */
  monitor?: number;
}

// ---------------------------------------------------------------------------
// Weather
// ---------------------------------------------------------------------------

/**
 * Current weather data retrieved from an external API.
 */
export interface WeatherData {
  /** Temperature in degrees Celsius */
  temp: number;
  /** Short textual description (e.g. "Cloudy", "Sunny") */
  description: string;
  /** Emoji or icon name representing the condition */
  icon: string;
}
