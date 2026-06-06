/**
 * service/system.ts — System monitoring service (CPU/RAM)
 *
 * Exposes reactive system state for CPU and RAM usage percentage.
 * Uses GTop library for system monitoring.
 */

import { Service, Variable } from "astal";
import GLib from "gi://GLib";
import GTop from "gi://GTop?version=2.0";
import { logger } from "../util/logger.js";

const MODULE = "SystemService";

export class SystemService extends Service {
  static {
    Service.register(this, {}, {
      cpu: ["double", "r"],
      ram: ["double", "r"],
    });
  }

  /** CPU usage percentage [0, 100]. */
  readonly cpu = new Variable<number>(0);

  /** RAM usage percentage [0, 100]. */
  readonly ram = new Variable<number>(0);

  private _prevCpu = new GTop.glibtop_cpu();
  private _prevTime = 0;

  constructor() {
    super();
    this._init();
  }

  private _init(): void {
    // Initial sync
    GTop.glibtop_get_cpu(this._prevCpu);
    this._prevTime = GLib.get_monotonic_time();

    // Poll every 2 seconds
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 2000, () => {
      this._syncState();
      return true; // Keep the timer running
    });

    logger.info(MODULE, "System service initialised");
  }

  private _syncState(): void {
    try {
      // --- CPU ---
      const cpu = new GTop.glibtop_cpu();
      const time = GLib.get_monotonic_time();
      GTop.glibtop_get_cpu(cpu);

      const totalDiff = cpu.total - this._prevCpu.total;
      const idleDiff = cpu.idle - this._prevCpu.idle;
      const usage = totalDiff > 0 ? (1 - idleDiff / totalDiff) * 100 : 0;

      this.cpu.setValue(Math.min(100, Math.max(0, usage)));
      this._prevCpu = cpu;
      this._prevTime = time;

      // --- RAM ---
      const mem = new GTop.glibtop_mem();
      GTop.glibtop_get_mem(mem);
      const ramUsage = (mem.used / mem.total) * 100;
      this.ram.setValue(Math.min(100, Math.max(0, ramUsage)));

      logger.debug(MODULE, `CPU: ${usage.toFixed(1)}%, RAM: ${ramUsage.toFixed(1)}%`);
    } catch (e) {
      logger.error(MODULE, "Error updating system state:", e);
    }
  }
}

export const system = new SystemService();
