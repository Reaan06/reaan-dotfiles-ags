import { execAsync } from "ags/process"; import { createBinding } from "gnim"
import Hyprland from "gi://AstalHyprland?version=0.1"

export default function KeyboardLayout() {
    const hypr = Hyprland.get_default()

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
