import { createBinding } from "gnim"
import Battery from "gi://AstalBattery?version=0.1"

export default function BatteryModule() {
    const battery = Battery.get_default()
    if (!battery) return <box class="Battery" />

    return <box class="Battery" spacing={8} visible={createBinding(battery, "isPresent")}>
        <label 
            class={createBinding(battery, "percentage").as(p => p <= 0.15 ? "low" : "")}
            label={createBinding(battery, "charging").as(c => c ? "󱐋" : "󰁹")} 
        />
        <label label={createBinding(battery, "percentage").as(p => `${Math.round(p * 100)}%`)} />
    </box>
}
