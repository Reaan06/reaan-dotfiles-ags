import { createState } from "gnim"
import GLib from "gi://GLib"

export default function Clock() {
    const time = createState("").poll(1000, () =>
        GLib.DateTime.new_now_local().format("%H:%M:%S")!)

    const date = createState("").poll(1000, () =>
        GLib.DateTime.new_now_local().format("%A, %B %d")!)

    return <box vertical class="Clock">
        <label class="time" label={time()} />
        <label class="date" label={date()} />
    </box>
}
