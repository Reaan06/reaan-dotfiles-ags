import Box from "resource:///com/github/Aylur/ags/widgets/box.js";
import Label from "resource:///com/github/Aylur/ags/widgets/label.js";
import { weather } from "../../service/weather.js";
import type { WeatherData } from "../../util/types.js";

/**
 * Widget de Clima para la barra superior.
 * Muestra el icono y la temperatura actual utilizando el WeatherService.
 */
export default () => Box({
  className: "weather",
  children: [
    Label({
      label: weather.weather.bind().as((w: WeatherData | null) => 
        w ? `${w.icon} ${w.temp}°C` : "Cargando..."
      ),
    }),
  ],
});
