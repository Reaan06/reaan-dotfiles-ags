import { createBinding } from "gnim"
import AstalWp from "gi://AstalWp?version=0.1"
import AstalBattery from "gi://AstalBattery?version=0.1"
import AstalNetwork from "gi://AstalNetwork?version=0.1"

export default function SystemStatus() {
    const wp = AstalWp.get_default()
    const speaker = wp?.audio?.default_speaker
    const battery = AstalBattery.get_default()
    const network = AstalNetwork.get_default()

    return <box class="system-status" spacing={8}>
        {speaker && (
            <label
                class="audio"
                label={createBinding(speaker, "volume").as(v => `Vol: ${Math.round(v * 100)}%`)}
            />
        )}
        {network && network.wifi && (
            <label
                class="network"
                label={createBinding(network.wifi, "ssid").as(ssid => ssid ? `󰖩 ${ssid}` : "󰖪 Disconnected")}
            />
        )}
        {battery && (
            <label
                class="battery"
                label={createBinding(battery, "percentage").as(p => `󰁹 ${Math.round(p * 100)}%`)}
            />
        )}
    </box>
}
