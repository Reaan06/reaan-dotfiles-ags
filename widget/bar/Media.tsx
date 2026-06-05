import { bind } from "ags"
import Mpris from "gi://AstalMpris"

export default function Media() {
    const mpris = Mpris.get_default()

    return <box class="Media pill">
        {bind(mpris, "players").as((ps: any[]) => {
            const p = ps[0]
            if (!p) return <label label="Nothing playing" />

            return <box spacing={8}>
                <box
                    class="AlbumArt"
                    css={bind(p, "coverArt").as((c: string) => `
                        background-image: url('${c}');
                        background-size: cover;
                        min-width: 24px;
                        min-height: 24px;
                        border-radius: 4px;
                    `)}
                />
                <label label={bind(p, "title").as((t: string) => t || "Unknown")} />
                <label label=" - " />
                <label label={bind(p, "artist").as((a: string) => a || "Unknown Artist")} />
            </box>
        })}
    </box>
}
