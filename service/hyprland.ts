/**
 * service/hyprland.ts — Integración IPC Hyprland
 *
 * Único módulo que se comunica directamente con el socket IPC de Hyprland.
 * Expone estado reactivo de workspaces y ventana activa a los widgets.
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 9.1, 9.2, 9.5
 */

import Service from "resource:///com/github/Aylur/ags/service.js";
import { Variable } from "resource:///com/github/Aylur/ags/variable.js";
import type { AppConfig } from "../util/types.js";
import type { Workspace, ActiveWindow } from "../util/types.js";
import { execAsync } from "../util/exec.js";
import { logger } from "../util/logger.js";

// Re-export types for consumers that import from this module
export type { Workspace, ActiveWindow };

const MODULE = "HyprlandService";

// ---------------------------------------------------------------------------
// Raw types from hyprctl JSON output
// ---------------------------------------------------------------------------

interface HyprctlWorkspace {
  id: number;
  name: string;
  windows: number;
}

interface HyprctlActiveWorkspace {
  id: number;
}

interface HyprctlActiveWindow {
  title: string;
  class: string;
}

// ---------------------------------------------------------------------------
// Pure parsing helpers (exported for property-based testing)
// ---------------------------------------------------------------------------

/**
 * Parse the JSON output of `hyprctl workspaces -j` into typed Workspace objects.
 *
 * @param raw         Parsed JSON array from hyprctl
 * @param activeId    The currently active workspace id (from `hyprctl activeworkspace -j`)
 * @returns           Array of Workspace objects with all fields populated
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
  }));
}

/**
 * Parse a single `activewindow>>class,title` IPC event line into an ActiveWindow.
 *
 * The Hyprland IPC format is: `activewindow>>class,title`
 * where title may itself contain commas.
 *
 * @param data  The part after `>>` in the event line
 * @returns     ActiveWindow with class and title extracted
 */
export function parseActiveWindowEvent(data: string): ActiveWindow {
  const commaIdx = data.indexOf(",");
  if (commaIdx === -1) {
    // Malformed — treat entire string as class, empty title
    return { class: data, title: "" };
  }
  const cls = data.slice(0, commaIdx);
  const title = data.slice(commaIdx + 1);
  return { class: cls, title };
}

// ---------------------------------------------------------------------------
// HyprlandService
// ---------------------------------------------------------------------------

export class HyprlandService extends Service {
  static {
    // Register reactive properties so AGS widgets can bind to them
    Service.register(
      this,
      {},
      {
        workspaces: ["jsobject", "r"],
        activeWindow: ["jsobject", "r"],
      },
    );
  }

  // Public reactive state — widgets bind to these
  readonly workspaces = new Variable<Workspace[]>([]);
  readonly activeWindow = new Variable<ActiveWindow>({ title: "", class: "" });

  private _socketPath: string | null = null;

  constructor(_config?: AppConfig) {
    super();

    // Requirement 2.6: use HYPRLAND_INSTANCE_SIGNATURE to build socket path
    const sig = GLib.getenv("HYPRLAND_INSTANCE_SIGNATURE");
    if (!sig) {
      // Requirement 2.3: log error without crashing
      logger.error(
        MODULE,
        "HYPRLAND_INSTANCE_SIGNATURE is not set — Hyprland IPC unavailable",
      );
      return;
    }

    this._socketPath = `/tmp/hypr/${sig}/.socket2.sock`;

    // Connect to the event socket and fetch initial state concurrently
    this._connectSocket();
    this._fetchInitialState();
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Dispatch a workspace switch command.
   * Requirement 2.5: executes `hyprctl dispatch workspace <id>`
   */
  dispatch(workspaceId: number): void {
    execAsync(`hyprctl dispatch workspace ${workspaceId}`).catch((err) => {
      logger.error(MODULE, `dispatch(${workspaceId}) failed`, err);
    });
  }

  // ---------------------------------------------------------------------------
  // Private — initial state fetch
  // ---------------------------------------------------------------------------

  /**
   * Fetch the current workspace list and active window from hyprctl.
   * Called once at startup and again after workspace create/destroy events
   * to keep state consistent.
   *
   * Requirement 2.4: uses `hyprctl workspaces -j`
   */
  private async _fetchInitialState(): Promise<void> {
    try {
      const [workspacesRaw, activeWindowRaw, activeWorkspaceRaw] =
        await Promise.all([
          execAsync("hyprctl workspaces -j"),
          execAsync("hyprctl activewindow -j"),
          execAsync("hyprctl activeworkspace -j"),
        ]);

      const workspacesData = JSON.parse(workspacesRaw) as HyprctlWorkspace[];
      const activeWindowData = JSON.parse(
        activeWindowRaw,
      ) as HyprctlActiveWindow;
      const activeWorkspaceData = JSON.parse(
        activeWorkspaceRaw,
      ) as HyprctlActiveWorkspace;

      this.workspaces.setValue(
        parseWorkspaces(workspacesData, activeWorkspaceData.id),
      );

      this.activeWindow.setValue({
        title: activeWindowData.title ?? "",
        class: activeWindowData.class ?? "",
      });
    } catch (err) {
      logger.error(MODULE, "Failed to fetch initial state", err);
    }
  }

  // ---------------------------------------------------------------------------
  // Private — socket connection
  // ---------------------------------------------------------------------------

  /**
   * Connect to the Hyprland `.socket2.sock` event socket using
   * `Gio.UnixSocketAddress` and start reading events.
   *
   * Requirement 2.6: subscribes via HYPRLAND_INSTANCE_SIGNATURE socket path
   */
  private _connectSocket(): void {
    if (!this._socketPath) return;

    try {
      const socketClient = new Gio.SocketClient();
      const address = Gio.UnixSocketAddress.new(this._socketPath);
      const connection = socketClient.connect(address, null);
      const inputStream = connection.get_input_stream();
      this._readEvents(inputStream);
      logger.info(MODULE, `Connected to IPC socket: ${this._socketPath}`);
    } catch (err) {
      // Requirement 2.3: log error without crashing
      logger.error(MODULE, "Cannot connect to IPC socket", err);
    }
  }

  // ---------------------------------------------------------------------------
  // Private — event reading loop
  // ---------------------------------------------------------------------------

  /**
   * Read lines from the IPC socket asynchronously in a loop.
   * Uses `Gio.DataInputStream.read_line_async` as specified.
   *
   * Requirement 2.1: updates workspace state in <100ms on IPC events
   */
  private _readEvents(stream: Gio.InputStream): void {
    const reader = new Gio.DataInputStream({
      base_stream: stream,
    });

    const readNext = (): void => {
      reader.read_line_async(
        GLib.PRIORITY_DEFAULT,
        null,
        (_source: Gio.DataInputStream, result: Gio.AsyncResult) => {
          try {
            const [line] = reader.read_line_finish_utf8(result);
            if (line !== null) {
              this._handleEvent(line);
            }
          } catch (err) {
            logger.error(MODULE, "Error reading IPC event line", err);
          }
          // Continue reading regardless of errors
          readNext();
        },
      );
    };

    readNext();
  }

  // ---------------------------------------------------------------------------
  // Private — event handling
  // ---------------------------------------------------------------------------

  /**
   * Parse and dispatch a single IPC event line.
   *
   * Hyprland event format: `eventname>>data`
   *
   * Handled events:
   *   - `workspace`        — active workspace changed
   *   - `createworkspace`  — new workspace created
   *   - `destroyworkspace` — workspace removed
   *   - `activewindow`     — focused window changed (data: `class,title`)
   *
   * Requirements: 2.1, 2.2
   */
  private _handleEvent(line: string): void {
    const separatorIdx = line.indexOf(">>");
    if (separatorIdx === -1) {
      logger.debug(MODULE, `Ignoring malformed IPC line: ${line}`);
      return;
    }

    const event = line.slice(0, separatorIdx);
    const data = line.slice(separatorIdx + 2);

    switch (event) {
      case "workspace":
      case "createworkspace":
      case "destroyworkspace":
        // Re-fetch full state for consistency (workspace list may have changed)
        this._fetchInitialState();
        break;

      case "activewindow":
        // Requirement 2.2: update activeWindow from IPC event data
        this.activeWindow.setValue(parseActiveWindowEvent(data));
        break;

      default:
        // Silently ignore unhandled events (focusedmon, movewindow, etc.)
        break;
    }
  }
}

// ---------------------------------------------------------------------------
// Singleton de HyprlandService exportado
// ---------------------------------------------------------------------------

export const hyprland = new HyprlandService();
