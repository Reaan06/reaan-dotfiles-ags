import { createBinding } from "gnim"
import AstalHyprland from "gi://AstalHyprland?version=0.1"

export default function ActiveWindow() {
    const hyprland = AstalHyprland.get_default()
    return <label
        class="active-window"
        maxWidthChars={50}
        truncate={true}
        label={createBinding(hyprland, "focusedClient").as(client => client?.title || "Desktop")}
    />
}
