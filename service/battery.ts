/**
 * service/battery.ts — Battery state service via AGS Battery (UPower)
 *
 * Exposes reactive battery state: percentage, charging status, and availability.
 * On desktop systems without a battery, `available` is false and the other
 * variables hold their default values.
 *
 * Requirements: 6.7, 6.8, 9.1, 9.2
 */

import Service from "resource:///com/github/Aylur/ags/service.js";
import { Variable } from "resource:///com/github/Aylur/ags/variable.js";
import Battery from "resource:///com/github/Aylur/ags/service/battery.js";
import { logger } from "../util/logger.js";

const MODULE = "BatteryService";

export class BatteryService extends Service {
  static {
    Service.register(this, {}, {
      percentage: ["double", "r"],
      charging: ["boolean", "r"],
      available: ["boolean", "r"],
    });
  }

  /** Current battery charge level in the range [0, 100]. */
  readonly percentage = new Variable<number>(0);

  /** True when the battery is currently charging. */
  readonly charging = new Variable<boolean>(false);

  /**
   * True when a battery device is present (laptops/tablets).
   * False on desktop systems without a battery.
   */
  readonly available = new Variable<boolean>(false);

  constructor() {
    super();
    this._init();
  }

  private _init(): void {
    try {
      // Check if a battery is available via the AGS Battery service
      if (!Battery.available) {
        logger.info(MODULE, "No battery detected — running on a desktop system");
        this.available.setValue(false);
        return;
      }

      // Battery is present — read initial state and subscribe to changes
      this.available.setValue(true);
      this._syncState();

      Battery.connect("changed", () => {
        this._syncState();
      });

      logger.info(MODULE, "Battery service initialised", {
        percentage: Battery.percent,
        charging: Battery.charging,
      });
    } catch (e) {
      logger.error(MODULE, "Failed to initialise battery service:", e);
      // Treat as unavailable so widgets can hide gracefully
      this.available.setValue(false);
    }
  }

  /** Pull the latest values from the AGS Battery service into our Variables. */
  private _syncState(): void {
    try {
      const pct = Battery.percent ?? 0;
      const charging = Battery.charging ?? false;

      this.percentage.setValue(Math.max(0, Math.min(100, pct)));
      this.charging.setValue(charging);

      logger.debug(MODULE, `Battery state updated: ${pct}% charging=${charging}`);
    } catch (e) {
      logger.error(MODULE, "Error reading battery state:", e);
    }
  }
}
