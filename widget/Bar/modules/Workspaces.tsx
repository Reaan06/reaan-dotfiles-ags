import { createBinding } from "gnim"
import Hyprland from "gi://AstalHyprland?version=0.1"

export default function Workspaces() {
    const hypr = Hyprland.get_default()
    const ws_ids = [1, 2, 3, 4, 5, 6, 7, 8]

    return <box class="Workspaces" spacing={8}>
        {ws_ids.map(id => (
            <button
                class={createBinding(hypr, "focusedWorkspace").as(fw => 
                    fw && fw.id === id ? "active" : ""
                )}
                onClicked={() => hypr.dispatch("workspace", String(id))}>
                <label label={String(id)} />
            </button>
        ))}
    </box>
}
