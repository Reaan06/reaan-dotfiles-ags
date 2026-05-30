/**
 * service/weather.ts — WeatherService
 *
 * Fetches current weather data from wttr.in and provides reactive
 * `weather` state that widgets can bind to.
 *
 * Responsibilities:
 *  - Periodically fetch weather from wttr.in (every 30 minutes).
 *  - Parse JSON response and expose it as a WeatherData object.
 *  - Map weather codes to condition icons/emojis.
 *
 * Requirements: 1.1, 9.1
 */

import Service from "resource:///com/github/Aylur/ags/service.js";
import { Variable } from "resource:///com/github/Aylur/ags/variable.js";
import { execAsync } from "../util/exec.js";
import { logger } from "../util/logger.js";
import type { WeatherData } from "../util/types.js";

const MODULE = "Weather";

class WeatherService extends Service {
  static {
    Service.register(
      this,
      {},
      {
        weather: ["jsobject", "r"],
      },
    );
  }

  // -------------------------------------------------------------------------
  // Public reactive state
  // -------------------------------------------------------------------------

  /** Current weather data or null if not yet fetched or failed. */
  readonly weather = new Variable<WeatherData | null>(null);

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  constructor() {
    super();

    // Initial fetch
    this._fetchWeather();

    // Actualizar cada 30 minutos (30 * 60 * 1000 ms)
    setInterval(() => this._fetchWeather(), 30 * 60 * 1000);

    logger.info(MODULE, "Servicio de clima inicializado");
  }

  // -------------------------------------------------------------------------
  // Private methods
  // -------------------------------------------------------------------------

  /**
   * Fetches weather data from wttr.in in JSON format.
   */
  private async _fetchWeather() {
    try {
      // Usamos curl para obtener el clima de wttr.in en formato JSON (j1)
      // Agregamos timeout de conexión para mayor robustez
      const res = await execAsync("curl -sf --connect-timeout 5 'https://wttr.in/?format=j1'");
      const data = JSON.parse(res);

      // Validación de la respuesta de wttr.in
      if (!data?.current_condition?.[0]) {
        throw new Error("Respuesta de wttr.in malformada");
      }

      const current = data.current_condition[0];

      const weatherData: WeatherData = {
        temp: Number(current.temp_C) || 0,
        description: current.weatherDesc[0].value,
        icon: this._getIcon(current.weatherCode),
      };

      this.weather.setValue(weatherData);
      logger.debug(MODULE, "Clima actualizado: %d°C, %s", weatherData.temp, weatherData.description);
    } catch (err) {
      logger.error(MODULE, "Error al obtener clima de wttr.in", err);
    }
  }

  /**
   * Maps WWO weather codes to emojis.
   * Reference: https://www.worldweatheronline.com/feed/wwoConditionCodes.xml
   *
   * @param code  The weatherCode returned by wttr.in.
   * @returns     A string representing the condition icon/emoji.
   */
  private _getIcon(code: string): string {
    const icons: Record<string, string> = {
      "113": "☀️", // Clear/Sunny
      "116": "⛅", // Partly Cloudy
      "119": "☁️", // Cloudy
      "122": "☁️", // Very Cloudy
      "200": "⛈️", // Thundery outbreaks possible
      "296": "🌧️", // Light rain
      "338": "❄️", // Heavy snow
    };
    return icons[code] || "🌡️";
  }
}

/**
 * Singleton instance of the WeatherService.
 */
export const weather = new WeatherService();
