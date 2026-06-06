import { bind } from "astal"
import Wp from "astal/wireplumber"
import Battery from "astal/battery"
import Network from "astal/network"
import { system } from "../../service/system"

export default function SystemStatus() {
    const wp = Wp.get_default()
    const speaker = wp?.audio?.default_speaker
    const battery = Battery.get_default()
    const network = Network.get_default()

    return <box class="system-status" spacing={8}>
        <label label={bind(system, "cpu").as(c => `󰘚 ${Math.round(c)}%`)} />
        <label label={bind(system, "ram").as(r => `󰓅 ${Math.round(r)}%`)} />
        {speaker && (
            <label
                class="audio"
                label={bind(speaker, "volume").as(v => `Vol: ${Math.round(v * 100)}%`)}
            />
        )}
        {network && network.wifi && (
            <label
                class="network"
                label={bind(network.wifi, "ssid").as(ssid => ssid ? `󰖩 ${ssid}` : "󰖪 Disconnected")}
            />
        )}
        {battery && (
            <label
                class="battery"
                label={bind(battery, "percentage").as(p => `󰁹 ${Math.round(p * 100)}%`)}
            />
        )}
    </box>
}
