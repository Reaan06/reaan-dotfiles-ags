import { createPoll } from "ags/time"
import { execAsync } from "../../util/exec.js"

interface WeatherInfo {
    temp: number;
    icon: string;
}

export default function Weather() {
    const weather = createPoll<WeatherInfo | null>(null, 30 * 60 * 1000, async () => {
        try {
            const res = await execAsync("curl -sf --connect-timeout 5 'https://wttr.in/?format=j1'")
            const data = JSON.parse(res)
            const current = data.current_condition[0]
            const icons: Record<string, string> = {
                "113": "☀️", // Clear/Sunny
                "116": "⛅", // Partly Cloudy
                "119": "☁️", // Cloudy
                "122": "☁️", // Very Cloudy
                "200": "⛈️", // Thundery outbreaks possible
                "296": "🌧️", // Light rain
                "338": "❄️", // Heavy snow
            }
            const code = current.weatherCode
            const icon = icons[code] || "🌡️"
            return {
                temp: Number(current.temp_C) || 0,
                icon,
            }
        } catch (e) {
            return null
        }
    })

    return <box class="weather">
        <label label={weather.as(w => w ? `${w.icon} ${w.temp}°C` : "Cargando...")} />
    </box>
}
