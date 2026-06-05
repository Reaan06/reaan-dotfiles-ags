import { createPoll } from "ags/time"

export default function Clock() {
    const time = createPoll("", 1000, "date +%H:%M")
    return <label class="Clock" label={time()} />
}
