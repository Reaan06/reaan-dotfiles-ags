import { createState } from "gnim"
// Use module-relative path that resolves at runtime for tests
import { createStateWithPoll } from "../../../src/compat/gnim-poll-shim"
import GLib from "gi://GLib"

export default function Clock() {
    const time = createStateWithPoll("").poll(1000, () =>
        GLib.DateTime.new_now_local().format("%H:%M:%S")!)

    const date = createStateWithPoll("").poll(1000, () =>
        GLib.DateTime.new_now_local().format("%A, %B %d")!)

    return <box vertical class="Clock">
        <label class="time" label={time()} />
        <label class="date" label={date()} />
    </box>
}
