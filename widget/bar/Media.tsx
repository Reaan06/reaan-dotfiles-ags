import { createBinding, With } from "gnim"
import AstalMpris from "gi://AstalMpris?version=0.1"

export default function Media() {
    const mpris = AstalMpris.get_default()
    const firstPlayer = createBinding(mpris, "players").as((ps: AstalMpris.Player[]) => ps[0])

    return <box class="Media pill">
        <With value={firstPlayer}>
            {(p) => {
                if (!p) return <label label="Nothing playing" />

                return <box spacing={8}>
                    <box
                        class="AlbumArt"
                        css={createBinding(p, "coverArt").as((c: string) => `
                            background-image: url('${c}');
                            background-size: cover;
                            min-width: 24px;
                            min-height: 24px;
                            border-radius: 4px;
                        `)}
                    />
                    <label label={createBinding(p, "title").as((t: string) => t || "Unknown")} />
                    <label label=" - " />
                    <label label={createBinding(p, "artist").as((a: string) => a || "Unknown Artist")} />
                </box>
            }}
        </With>
    </box>
}
