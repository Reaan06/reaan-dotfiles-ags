/**
 * widget/bar/ActiveWindow.ts — Active window title widget
 *
 * Displays the title of the currently focused window, reactively bound to
 * HyprlandService.activeWindow. Long titles are truncated with an ellipsis.
 *
 * Requirements: 3.4
 */

import Label from "resource:///com/github/Aylur/ags/widgets/label.js";
import type { HyprlandService } from "../../service/hyprland.js";

/**
 * Returns a Label that reactively shows the active window title.
 * Falls back to "Desktop" when no window is focused (empty title).
 * Titles longer than 50 characters are truncated with an ellipsis at the end.
 */
export default ({ hyprland }: { hyprland: HyprlandService }) =>
  Label({
    className: "active-window",
    // Truncate at 50 characters — covers most window titles without overflow
    maxWidthChars: 50,
    truncate: "end",
    label: hyprland.activeWindow.bind().as((w: { title: string }) => w.title || "Desktop"),
  });
