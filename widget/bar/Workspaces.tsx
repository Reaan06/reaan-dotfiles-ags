import { bind, For } from "astal"
import Hyprland from "astal/hyprland"

const hyprland = Hyprland.get_default()

export default function Workspaces() {
    const workspaces = bind(hyprland, "workspaces").as(wss =>
        wss
            .filter((ws) => ws.id > 0 && ws.id <= 7)
            .sort((a, b) => a.id - b.id)
    )

    return <box class="Workspaces pill">
        <For each={workspaces}>
            {(ws) => (
                <button
                    class={bind(hyprland, "focusedWorkspace").as((fw) =>
                        fw && fw.id === ws.id
                            ? "focused"
                            : ws.clients.length > 0
                                ? "occupied"
                                : ""
                    )}
                    onClicked={() => hyprland.dispatch("workspace", String(ws.id))}>
                    <label label={String(ws.id)} />
                </button>
            )}
        </For>
    </box>
}
