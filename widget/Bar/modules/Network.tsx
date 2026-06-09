import { createBinding } from "gnim"
import { safeRequire } from "../../../src/compat/gi-typelib-guard"

// Use safeRequire to tolerate missing AstalNetwork typelib at runtime
const _net = safeRequire('AstalNetwork', '0.1')
const Network = _net.present ? _net.module : _net.stub

export default function NetworkModule() {
    const network = Network.get_default()
    if (!network) return <box class="Network" />
    
    return <box class="Network" spacing={8}>
        <label label="🌐" class="globe" />
        <box visible={createBinding(network, "wifi").as(wifi => !!wifi)} spacing={4}>
            <label label="󰖩 " />
            <label label={createBinding(network, "wifi").as(wifi => {
                if (!wifi || !wifi.ssid) return "Disconnected"
                const ssid = wifi.ssid
                return ssid.length > 12 ? ssid.substring(0, 12) + "..." : ssid
            })} />
        </box>
    </box>
}
