import { execAsync } from "ags/process"; import { createBinding } from "gnim"
import { safeRequire } from "../../../src/compat/gi-typelib-guard"

const _hy = safeRequire('AstalHyprland','0.1')
const Hyprland = _hy.present ? _hy.module : _hy.stub

export default function KeyboardLayout() {
    const hypr = (Hyprland && typeof Hyprland.get_default === 'function') ? Hyprland.get_default() : Hyprland

    return <button 
        class="KeyboardLayout"
        onClicked={() => {
            execAsync("hyprctl switchxkblayout all next")
        }}>
        <label label={createBinding(hypr, "kbdLayout").as(l => {
            if (!l) return "EN"
            if (l.toLowerCase().includes("english")) return "EN"
            if (l.toLowerCase().includes("spanish")) return "ES"
            return l.substring(0, 2).toUpperCase()
        })} />
    </button>
}
