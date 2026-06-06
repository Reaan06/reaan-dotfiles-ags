import { createBinding } from "gnim"
import Bluetooth from "gi://AstalBluetooth?version=0.1"

export default function BluetoothModule() {
    const bluetooth = Bluetooth.get_default()
    if (!bluetooth) return <box class="Bluetooth" />

    return <box class="Bluetooth" spacing={8}>
        <label label="󰂯" class={createBinding(bluetooth, "isPowered").as(p => p ? "on" : "off")} />
        <label label={createBinding(bluetooth, "devices").as(devices => {
            if (!devices) return "Disconnected"
            const connected = devices.find(d => d.connected)
            if (!connected) return "Disconnected"
            const name = connected.name || connected.alias || "Connected"
            return name.length > 12 ? name.substring(0, 12) + "..." : name
        })} />
    </box>
}
