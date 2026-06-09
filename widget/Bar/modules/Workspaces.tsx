import { createBinding } from "gnim"
import { safeRequire } from "../../../src/compat/gi-typelib-guard"

const _hypr = safeRequire('AstalHyprland', '0.1')
const Hyprland = _hypr.present ? _hypr.module : _hypr.stub

export default function Workspaces() {
    const hypr = (Hyprland && typeof Hyprland.get_default === 'function') ? Hyprland.get_default() : (typeof Hyprland.get_default === 'function' ? Hyprland.get_default() : Hyprland)
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
