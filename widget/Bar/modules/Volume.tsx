import { createBinding } from "gnim"
import { safeRequire } from "../../../src/compat/gi-typelib-guard"

const _wp = safeRequire('AstalWp','0.1')
const Wp = _wp.present ? _wp.module : _wp.stub

export default function Volume() {
    const speaker = Wp.get_default ? Wp.get_default()?.audio.defaultSpeaker : (Wp?.audio?.defaultSpeaker)
    if (!speaker) return <box class="Volume" />

    return <box class="Volume" spacing={8}>
        <button
            onScroll={(self, event) => {
                if (event.delta_y < 0) speaker.volume += 0.02
                else speaker.volume -= 0.02
            }}
            onClicked={() => speaker.mute = !speaker.mute}>
            <box spacing={8}>
                <label label={createBinding(speaker, "volume").as(v => {
                    if (speaker.mute) return "󰝟"
                    if (v === 0) return "󰝟"
                    if (v < 0.33) return "󰕿"
                    if (v < 0.67) return "󰖀"
                    return "󰕾"
                })} />
                <label label={createBinding(speaker, "volume").as(v => `${Math.round(v * 100)}%`)} />
            </box>
        </button>
    </box>
}
