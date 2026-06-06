import { createState } from "gnim"

export default function Weather() {
    const weather = createState("...").poll(600000, ["curl", "-s", "https://api.open-meteo.com/v1/forecast?latitude=-34.6037&longitude=-58.3816&current_weather=true"], (out) => {
        try {
            const data = JSON.parse(out)
            return `${data.current_weather.temperature}°C`
        } catch (e) {
            return "Error"
        }
    })

    return <box class="Weather">
        <label label="☁ " />
        <label label={weather()} />
    </box>
}
