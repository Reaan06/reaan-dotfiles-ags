import { media } from "../../service/media"
import { bind } from "astal"

export default function Media() {
    return <box class="Media pill">
        {bind(media, "trackTitle").as(title => {
            if (!title) return <label label="Nothing playing" />

            return <box spacing={8}>
                <label label={bind(media, "trackTitle")} />
                <label label=" - " />
                <label label={bind(media, "trackArtist")} />
            </box>
        })}
    </box>
}
