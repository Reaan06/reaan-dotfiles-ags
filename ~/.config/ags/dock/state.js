import { readFile, writeFile } from "resource:///com/github/Aylurs/ags/utils.js";
import GLib from 'gi://GLib';

const STATE_FILE = `${GLib.get_user_cache_dir()}/ags/dock-state.json`;

export function loadState() {
    try {
        return JSON.parse(readFile(STATE_FILE));
    } catch {
        return { pinned: true };
    }
}

export function saveState(s) {
    writeFile(STATE_FILE, JSON.stringify(s));
}
