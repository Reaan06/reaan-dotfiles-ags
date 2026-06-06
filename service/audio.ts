/**
 * service/audio.ts — AudioService
 *
 * Wraps the AGS Audio API (PipeWire/PulseAudio) and exposes reactive
 * `volume` and `muted` variables that widgets can bind to.
 *
 * Responsibilities:
 *  - Mirror the default sink's volume (0-100) and muted state as Variables.
 *  - React to external volume changes (multimedia keys, other apps) in <200 ms.
 *  - Provide `setVolume(value)` with clamping to [0, 100].
 *  - Provide `adjustVolume(delta)` that applies the configured step and clamps.
 *
 * Requirements: 6.2, 6.3, 6.4, 9.1, 9.2
 */

import { Service, Variable } from "astal";
import Audio from "astal/audio";
import type { AppConfig } from "../util/types.js";
import { logger } from "../util/logger.js";

// ---------------------------------------------------------------------------
// Pure helper — exported for unit / property testing without GJS
// ---------------------------------------------------------------------------

/**
 * Clamp `value` to the inclusive range [0, 100].
 *
 * This is a pure function with no side effects, making it straightforward
 * to test with property-based tests.
 */
export function clampVolume(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/**
 * Compute the new volume after applying `delta` steps of `step` size,
 * starting from `current`, clamped to [0, 100].
 *
 * Pure function — no side effects.
 *
 * @param current  Current volume in [0, 100].
 * @param delta    Signed number of steps (positive = louder, negative = quieter).
 * @param step     Size of each step in percentage points (from config.volumeStep).
 * @returns        New volume clamped to [0, 100].
 */
export function computeAdjustedVolume(
  current: number,
  delta: number,
  step: number,
): number {
  return clampVolume(current + delta * step);
}

// ---------------------------------------------------------------------------
// AudioService
// ---------------------------------------------------------------------------

export class AudioService extends Service {
  // Register the service with AGS so that widgets can use .bind() on its
  // properties.  We expose `volume` and `muted` as GObject properties backed
  // by the Variable instances below.
  static {
    Service.register(
      this,
      {},
      {
        volume: ["double", "r"],
        muted: ["boolean", "r"],
      },
    );
  }

  // -------------------------------------------------------------------------
  // Public reactive state
  // -------------------------------------------------------------------------

  /** Current volume of the default audio sink, in the range [0, 100]. */
  readonly volume = new Variable<number>(0);

  /** Whether the default audio sink is currently muted. */
  readonly muted = new Variable<boolean>(false);

  // -------------------------------------------------------------------------
  // Private state
  // -------------------------------------------------------------------------

  private readonly _step: number;

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  constructor(config: AppConfig) {
    super();

    this._step = config.volumeStep;

    // Sync initial state from the AGS Audio service.
    this._syncFromAudio();

    // Subscribe to changes emitted by the AGS Audio service.
    // The "speaker-changed" signal fires whenever the default sink's volume
    // or muted state changes — including changes triggered by multimedia keys
    // or other applications.  AGS guarantees this signal is emitted within
    // the GLib main loop, so the update reaches our Variables in <200 ms.
    Audio.connect("speaker-changed", () => {
      this._syncFromAudio();
    });

    logger.info("AudioService", "Initialized (step=%d%%)", this._step);
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Set the volume of the default audio sink to `value`, clamped to [0, 100].
   *
   * @param value  Desired volume in percent.
   */
  setVolume(value: number): void {
    const clamped = clampVolume(value);
    try {
      // AGS Audio expects a fraction in [0, 1].
      Audio.speaker.volume = clamped / 100;
      this.volume.setValue(clamped);
      logger.debug("AudioService", "setVolume → %d%%", clamped);
    } catch (e) {
      logger.error("AudioService", "setVolume failed", e);
    }
  }

  /**
   * Adjust the volume by `delta` steps of the configured step size, clamped
   * to [0, 100].
   *
   * Positive `delta` increases volume; negative `delta` decreases it.
   *
   * @param delta  Number of steps to adjust (e.g. +1 or -1).
   */
  adjustVolume(delta: number): void {
    const current = this.volume.getValue();
    const next = computeAdjustedVolume(current, delta, this._step);
    this.setVolume(next);
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  /**
   * Read the current state from the AGS Audio service and update our
   * Variables.  Called on construction and on every "speaker-changed" signal.
   */
  private _syncFromAudio(): void {
    try {
      const speaker = Audio.speaker;
      if (!speaker) {
        logger.warn("AudioService", "No default audio sink available");
        return;
      }

      // AGS Audio exposes volume as a fraction in [0, 1]; convert to [0, 100].
      const vol = clampVolume(Math.round(speaker.volume * 100));
      const mut = speaker.muted ?? false;

      this.volume.setValue(vol);
      this.muted.setValue(mut);
    } catch (e) {
      logger.error("AudioService", "Failed to sync audio state", e);
    }
  }
}
