import { createBinding } from "gnim"
import { safeRequire } from "../../../src/compat/gi-typelib-guard"

const _bt = safeRequire('AstalBluetooth','0.1')
const Bluetooth = _bt.present ? _bt.module : _bt.stub

export default function BluetoothModule() {
    const bluetooth = (Bluetooth && typeof Bluetooth.get_default === 'function') ? Bluetooth.get_default() : Bluetooth
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
