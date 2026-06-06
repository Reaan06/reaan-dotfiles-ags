import { bind } from "astal"
import AstalHyprland from "astal/hyprland"

export default function ActiveWindow() {
    const hyprland = AstalHyprland.get_default()
    return <label
        class="active-window"
        maxWidthChars={50}
        truncate={true}
        label={bind(hyprland, "focusedClient").as(client => client?.title || "Desktop")}
    />
}
