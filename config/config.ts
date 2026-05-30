/**
 * config/config.ts — Configuración centralizada y tipada
 *
 * Carga las sobrescrituras del usuario desde config/user.ts (usa {} si no existe),
 * valida cada campo contra su tipo esperado y exporta un único objeto
 * inmutable `config` consumido por servicios y widgets.
 *
 * Requisitos: 10.1, 10.2, 10.3, 10.4, 10.5
 */

import type { AppConfig } from "../util/types.js";
import { logger } from "../util/logger.js";

// Re-exportar el tipo para que los consumidores puedan importarlo desde un solo lugar.
export type { AppConfig };

// ---------------------------------------------------------------------------
// Valores por defecto
// ---------------------------------------------------------------------------

/**
 * Valores predeterminados canónicos para cada campo de configuración.
 * Se utiliza tanto como respaldo para valores de usuario faltantes/inválidos
 * como referencia para la comprobación de tipos (typeof defaults[key]).
 */
const defaults: AppConfig = {
  clockFormat: "HH:mm",
  themeBackend: "pywal",
  volumeStep: 5,
  notificationPosition: "top-right",
  launcherKeybind: "Super+Space",
  notificationHistoryLimit: 50,
  barHeight: 40,
};

// ---------------------------------------------------------------------------
// Ayudantes de validación
// ---------------------------------------------------------------------------

/** Valores permitidos para campos con tipos de unión. */
const ALLOWED: Partial<Record<keyof AppConfig, readonly unknown[]>> = {
  themeBackend: ["pywal", "matugen"] as const,
  notificationPosition: [
    "top-right",
    "top-left",
    "bottom-right",
    "bottom-left",
  ] as const,
};

/**
 * Devuelve true cuando `value` es un valor válido para `key`.
 *
 * Reglas de validación:
 *  1. El tipo en tiempo de ejecución debe coincidir con el tipo del valor por defecto.
 *  2. Para campos de tipo unión (themeBackend, notificationPosition), el valor
 *     también debe ser uno de los literales explícitamente permitidos.
 */
function isValid<K extends keyof AppConfig>(key: K, value: unknown): value is AppConfig[K] {
  if (typeof value !== typeof defaults[key]) return false;
  const allowed = ALLOWED[key];
  if (allowed !== undefined && !allowed.includes(value)) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Función de validación pura
// ---------------------------------------------------------------------------

/**
 * `validateConfig` — función pura (sin efectos secundarios excepto el registro de logs).
 *
 * Combina `raw` con `defaults`:
 *  - Los campos válidos se conservan tal cual.
 *  - Los campos con tipo incorrecto o valor no permitido vuelven al valor por defecto
 *    y emiten una advertencia a través del logger.
 *  - Los campos faltantes usan silenciosamente el valor por defecto.
 *
 * @param raw  Objeto de configuración parcial proporcionado por el usuario.
 * @returns    Un `AppConfig` completo y totalmente tipado.
 */
export function validateConfig(raw: Partial<AppConfig>): AppConfig {
  const result = { ...defaults };

  for (const key of Object.keys(defaults) as (keyof AppConfig)[]) {
    if (!(key in raw)) {
      // Campo ausente — usar valor por defecto silenciosamente.
      continue;
    }

    const value = raw[key];

    if (isValid(key, value)) {
      // Conversión segura: isValid garantiza que el tipo coincide.
      (result as Record<string, unknown>)[key] = value;
    } else {
      logger.warn(
        "Config",
        `Valor inválido para "${key}" (se obtuvo ${JSON.stringify(value)}), usando valor por defecto: ${JSON.stringify(defaults[key])}`,
      );
      // result[key] ya contiene el valor por defecto debido al spread inicial.
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Carga de configuración de usuario
// ---------------------------------------------------------------------------

/**
 * Intenta cargar `config/user.ts`.
 *
 * En un entorno de ejecución GJS/AGS, la importación dinámica se resuelve relativa
 * al directorio de configuración de AGS. En un entorno Node/vitest, la ruta relativa
 * se resuelve desde la ubicación de este archivo, que es el mismo directorio — por
 * lo que la ruta de respaldo es idéntica en ambos contextos.
 *
 * Si el archivo no existe (o falla por cualquier motivo), volvemos a un
 * objeto vacío para que se utilicen todos los valores por defecto.
 */
async function loadUserConfig(): Promise<Partial<AppConfig>> {
  try {
    const mod = await import("./user.js") as any;
    // Soporta tanto `export default { ... }` como `export const userConfig = { ... }`.
    const raw: unknown = mod.default ?? mod.userConfig ?? mod;
    if (raw !== null && typeof raw === "object") {
      return raw as Partial<AppConfig>;
    }
    return {};
  } catch {
    // El archivo no existe o falló al procesarse — usar configuración vacía (todos los valores por defecto).
    return {};
  }
}

// ---------------------------------------------------------------------------
// Singleton de configuración exportado
// ---------------------------------------------------------------------------

/**
 * La configuración de la aplicación validada y totalmente tipada.
 *
 * Cargada una vez durante la inicialización del módulo. Los consumidores deben
 * importar este objeto en lugar de leer variables de entorno o archivos de
 * configuración directamente.
 *
 * Uso:
 *   import { config } from "./config/config.js";
 *   console.log(config.clockFormat); // "HH:mm"
 */
export const config: AppConfig = validateConfig(await loadUserConfig());

