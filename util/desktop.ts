/**
 * util/desktop.ts — XDG .desktop file parser
 *
 * Provides two functions:
 *   - `parseDesktopContent` — pure function (no GJS deps) that parses the text
 *     content of a single .desktop file into an AppEntry.
 *   - `parseDesktopFiles`   — async function that reads all XDG application
 *     directories and returns the filtered list of visible AppEntry objects.
 *
 * Requirements: 4.5, 4.6
 */

import { logger } from "./logger.js";
import type { AppEntry } from "./types.js";

const MODULE = "desktop";

// ---------------------------------------------------------------------------
// Pure parser — no GJS / AGS dependencies
// ---------------------------------------------------------------------------

/**
 * Parse the text content of a `.desktop` file and return an `AppEntry`, or
 * `null` when the entry is invalid (missing required fields) or should be
 * hidden (`NoDisplay=true`).
 *
 * This function is intentionally free of any GJS / AGS imports so that it
 * can be unit-tested with vitest in a plain Node.js environment.
 *
 * @param content  Raw UTF-8 text of the `.desktop` file.
 * @returns        Parsed `AppEntry` or `null`.
 */
export function parseDesktopContent(content: string): AppEntry | null {
  const lines = content.split("\n");

  // Only parse the [Desktop Entry] section; stop at the next section header.
  let inDesktopEntry = false;
  const entry: Partial<AppEntry> = {};

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // Section header detection
    if (line.startsWith("[")) {
      if (line === "[Desktop Entry]") {
        inDesktopEntry = true;
      } else if (inDesktopEntry) {
        // We've left the [Desktop Entry] section — stop parsing.
        break;
      }
      continue;
    }

    if (!inDesktopEntry) continue;

    // Skip comments and blank lines
    if (line === "" || line.startsWith("#")) continue;

    const eqIdx = line.indexOf("=");
    if (eqIdx === -1) continue;

    const key = line.slice(0, eqIdx).trim();
    const value = line.slice(eqIdx + 1); // preserve leading/trailing spaces in value

    switch (key) {
      case "Name":
        // Only set Name if not already set (first occurrence wins, per spec)
        if (!entry.name) entry.name = value.trim();
        break;
      case "Exec":
        // Strip field-code placeholders (%f, %F, %u, %U, %d, %D, %n, %N,
        // %i, %c, %k, %v, %m) as per XDG Desktop Entry Specification §6.
        entry.exec = value.replace(/%[fFuUdDnNickvm]/g, "").trim();
        break;
      case "Icon":
        entry.icon = value.trim();
        break;
      case "Comment":
        entry.description = value.trim();
        break;
      case "Categories":
        entry.categories = value.split(";").filter(Boolean);
        break;
      case "NoDisplay":
        if (value.trim() === "true") entry.noDisplay = true;
        break;
      case "Type":
        // Only "Application" entries are relevant for the launcher.
        // If Type is present and not "Application", mark as noDisplay so the
        // caller can filter it out.
        if (value.trim() !== "Application") entry.noDisplay = true;
        break;
    }
  }

  // Required fields: Name and Exec must be non-empty strings.
  if (!entry.name || !entry.exec) return null;

  // Entries with NoDisplay=true are hidden from application menus per the
  // XDG Desktop Entry Specification. Return null so callers don't need to
  // check the flag themselves.
  if (entry.noDisplay) return null;

  return entry as AppEntry;
}

// ---------------------------------------------------------------------------
// File-system reader — uses GJS APIs
// ---------------------------------------------------------------------------

/**
 * XDG application directories searched in order.
 * The user-local directory is checked last so system entries are always
 * available even when the home directory is unavailable.
 */
function getXdgDataDirs(): string[] {
  // GLib is available at runtime in the GJS environment.
  // We reference it via the global `imports.gi.GLib` path that GJS exposes.
  const homeDir: string =
    typeof GLib !== "undefined"
      ? GLib.get_home_dir()
      : (globalThis as Record<string, unknown>)["GLib"]
          ? (globalThis as any)["GLib"].get_home_dir()
          : "/root";

  return [
    "/usr/share/applications",
    "/usr/local/share/applications",
    `${homeDir}/.local/share/applications`,
  ];
}

/**
 * List all filenames (not full paths) inside a directory.
 * Returns an empty array if the directory does not exist or cannot be read.
 * Uses GLib/Gio which are available in the GJS runtime.
 */
function listDir(dirPath: string): string[] {
  try {
    const dir = Gio.File.new_for_path(dirPath);
    const enumerator = dir.enumerate_children(
      "standard::name",
      Gio.FileQueryInfoFlags.NONE,
      null,
    );
    const names: string[] = [];
    let info: Gio.FileInfo | null;
    while ((info = enumerator.next_file(null)) !== null) {
      names.push(info.get_name());
    }
    enumerator.close(null);
    return names;
  } catch {
    return [];
  }
}

/**
 * Read the UTF-8 text content of a file.
 * Returns `null` if the file cannot be read.
 */
function readFileContent(filePath: string): string | null {
  try {
    const [ok, bytes] = GLib.file_get_contents(filePath);
    if (!ok) return null;
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

/**
 * Read all `.desktop` files from the standard XDG application directories,
 * parse them, and return the list of visible `AppEntry` objects (i.e. entries
 * where `NoDisplay` is not `true`).
 *
 * @throws {Error} If no `.desktop` files are found in any XDG directory.
 * @returns        Promise resolving to the array of visible `AppEntry` objects.
 */
export async function parseDesktopFiles(): Promise<AppEntry[]> {
  const dirs = getXdgDataDirs();
  const entries: AppEntry[] = [];
  let totalFilesFound = 0;

  for (const dir of dirs) {
    const files = listDir(dir).filter((f) => f.endsWith(".desktop"));

    for (const filename of files) {
      totalFilesFound++;
      const fullPath = `${dir}/${filename}`;
      const content = readFileContent(fullPath);

      if (content === null) {
        logger.warn(MODULE, `Cannot read file: ${fullPath}`);
        continue;
      }

      const entry = parseDesktopContent(content);

      if (entry === null) {
        // null means: missing required fields, NoDisplay=true, or non-Application
        // type — all cases where the entry should not appear in the launcher.
        continue;
      }

      entries.push(entry);
    }
  }

  if (totalFilesFound === 0) {
    throw new Error(
      "No .desktop files found in XDG data directories: " + dirs.join(", "),
    );
  }

  logger.info(
    MODULE,
    `Loaded ${entries.length} visible app entries from ${totalFilesFound} .desktop files`,
  );

  return entries;
}
