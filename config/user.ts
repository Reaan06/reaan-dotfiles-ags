/**
 * config/user.ts — Sobrescritura de configuración del usuario.
 * 
 * Este archivo permite personalizar la configuración sin modificar los valores por defecto.
 * Debe exportar un objeto que coincida parcialmente con el tipo `AppConfig`.
 */

import type { AppConfig } from "../util/types.js";

const userConfig: Partial<AppConfig> = {
  // Añade tus sobrescrituras aquí, por ejemplo:
  // clockFormat: "HH:mm:ss",
};

export default userConfig;
