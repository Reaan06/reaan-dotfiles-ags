/**
 * service/media.ts — MediaService
 *
 * Wraps the AGS Mpris API to provide reactive media control.
 *
 * Responsibilities:
 *  - Expose the first available media player's track info and playback state.
 *  - Provide methods to control the player (play/pause, next, previous).
 */

import { Service, Variable } from "astal";
import Mpris from "astal/mpris";
import GLib from "gi://GLib";
import { logger } from "../util/logger.js";

export class MediaService extends Service {
  static {
    Service.register(
      this,
      {},
      {
        trackTitle: ["string", "r"],
        trackArtist: ["string", "r"],
        coverPath: ["string", "r"],
        playBackStatus: ["string", "r"],
      },
    );
  }

  readonly trackTitle = new Variable<string>("");
  readonly trackArtist = new Variable<string>("");
  readonly coverPath = new Variable<string>("");
  readonly playBackStatus = new Variable<string>("");

  constructor() {
    super();

    // Listen for changes in players lazily
    GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
      Mpris.get_default().connect("changed", () => this._sync());
      this._sync();
      logger.info("MediaService", "Initialized");
      return false; // Run once
    });
  }

  playPause(): void {
    const player = Mpris.get_default().players[0];
    if (player) {
      player.playPause();
    }
  }

  next(): void {
    const player = Mpris.get_default().players[0];
    if (player) {
      player.next();
    }
  }

  previous(): void {
    const player = Mpris.get_default().players[0];
    if (player) {
      player.previous();
    }
  }

  private _sync(): void {
    const player = Mpris.get_default().players[0];
    if (!player) {
      this.trackTitle.setValue("");
      this.trackArtist.setValue("");
      this.coverPath.setValue("");
      this.playBackStatus.setValue("Stopped");
      return;
    }

    this.trackTitle.setValue(player.trackTitle);
    this.trackArtist.setValue(player.trackArtists.join(", "));
    this.coverPath.setValue(player.coverPath);
    this.playBackStatus.setValue(player.playBackStatus);
  }
}

export const media = new MediaService();
