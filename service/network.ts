/**
 * service/network.ts — NetworkService
 *
 * Wraps the AGS Network API (NetworkManager) and exposes reactive state
 * for connectivity, SSID, and connection type.
 *
 * Requirements: 6.5, 6.6, 9.1, 9.2
 */

import Service from "resource:///com/github/Aylur/ags/service.js";
import { Variable } from "resource:///com/github/Aylur/ags/variable.js";
import Network from "resource:///com/github/Aylur/ags/service/network.js";
import { logger } from "../util/logger.js";

const MODULE = "NetworkService";

/** Connection type exposed to widgets. */
export type NetworkType = "wifi" | "ethernet" | "none";

/**
 * NetworkService
 *
 * Reactive wrapper around the AGS Network service. Subscribes to
 * NetworkManager state changes and updates its Variables within the
 * 500 ms budget required by Requirement 6.6.
 *
 * Usage:
 *   const network = new NetworkService();
 *   // Bind in a widget:
 *   Label({ label: network.ssid.bind().as(s => s ?? "No network") })
 */
export class NetworkService extends Service {
  static {
    Service.register(this, {}, {
      connected: ["boolean", "r"],
      ssid:      ["jsobject", "r"],
      type:      ["string", "r"],
    });
  }

  /** True when the system has an active network connection. */
  readonly connected = new Variable<boolean>(false);

  /**
   * SSID of the active Wi-Fi network, or null when not connected via Wi-Fi
   * (ethernet, disconnected, or SSID unavailable).
   */
  readonly ssid = new Variable<string | null>(null);

  /**
   * Active connection type:
   *   - "wifi"     — connected via wireless
   *   - "ethernet" — connected via wired interface
   *   - "none"     — no active connection
   */
  readonly type = new Variable<NetworkType>("none");

  constructor() {
    super();

    // Perform an immediate state sync so Variables are populated before
    // any widget binds to them.
    this._syncState();

    // Subscribe to NetworkManager change signals emitted by the AGS
    // Network service. The handler runs synchronously on the GLib main
    // loop, so updates land well within the 500 ms budget (Req 6.6).
    Network.connect("changed", () => {
      this._syncState();
    });

    logger.info(MODULE, "Initialized — watching NetworkManager for changes");
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Read the current state from the AGS Network service and push it into
   * the reactive Variables. Called once at construction and on every
   * "changed" signal from NetworkManager.
   */
  private _syncState(): void {
    try {
      const newType    = this._resolveType();
      const newSsid    = this._resolveSsid(newType);
      const newConnected = newType !== "none";

      this.type.setValue(newType);
      this.ssid.setValue(newSsid);
      this.connected.setValue(newConnected);

      logger.debug(
        MODULE,
        `State updated — connected=${newConnected}, type=${newType}, ssid=${newSsid ?? "null"}`,
      );
    } catch (err) {
      logger.error(MODULE, "Failed to sync network state:", err);
    }
  }

  /**
   * Determine the active connection type by inspecting the AGS Network
   * service's wifi and wired sub-objects.
   *
   * AGS Network exposes:
   *   Network.wifi.internet   — "connected" | "connecting" | "disconnected"
   *   Network.wired.internet  — same values
   */
  private _resolveType(): NetworkType {
    // Prefer Wi-Fi over wired when both report connected (unusual but possible).
    const wifiState  = Network.wifi?.internet  ?? "disconnected";
    const wiredState = Network.wired?.internet ?? "disconnected";

    if (wifiState === "connected")  return "wifi";
    if (wiredState === "connected") return "ethernet";
    return "none";
  }

  /**
   * Return the SSID for the active Wi-Fi connection, or null when the
   * connection type is not "wifi" or the SSID is unavailable.
   */
  private _resolveSsid(type: NetworkType): string | null {
    if (type !== "wifi") return null;

    const ssid = Network.wifi?.ssid;
    // Guard against empty strings returned by NetworkManager when the
    // SSID is hidden or not yet resolved.
    return (typeof ssid === "string" && ssid.length > 0) ? ssid : null;
  }
}
