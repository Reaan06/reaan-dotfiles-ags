import { createBinding } from "gnim"
import Battery from "gi://AstalBattery?version=0.1"
import { safeRequire } from "../../../src/compat/gi-typelib-guard"

const _bat = safeRequire('AstalBattery','0.1')
const BatteryLib = _bat.present ? _bat.module : _bat.stub

export default function BatteryModule() {
    const battery = BatteryLib.get_default ? BatteryLib.get_default() : BatteryLib
    if (!battery) return <box class="Battery" />

    return <box class="Battery" spacing={8} visible={createBinding(battery, "isPresent")}>
        <label 
            class={createBinding(battery, "percentage").as(p => p <= 0.15 ? "low" : "")}
            label={createBinding(battery, "charging").as(c => c ? "󱐋" : "󰁹")} 
        />
        <label label={createBinding(battery, "percentage").as(p => `${Math.round(p * 100)}%`)} />
    </box>
}
