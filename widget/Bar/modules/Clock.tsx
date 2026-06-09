// Use shim helper for safer polling in test/CI environments
import { createStateWithPoll } from "../../../src/compat/gnim-poll-shim"
// GLib is optional at import time; tests will stub a global GLib
let GLib: any = (globalThis as any).GLib
try {
  // In runtime GJS this will succeed; in Node tests it will be absent
  // @ts-ignore
  GLib = GLib || require('gi://GLib')
} catch (e) {
  // leave GLib as is (tests stub global)
}

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
