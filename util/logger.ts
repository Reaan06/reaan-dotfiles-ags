type LogLevel = "debug" | "info" | "warn" | "error";

export const logger = {
  debug: (module: string, msg: string, ...args: unknown[]) =>
    console.debug(`[${module}]`, msg, ...args),
  info: (module: string, msg: string, ...args: unknown[]) =>
    console.log(`[${module}]`, msg, ...args),
  warn: (module: string, msg: string, ...args: unknown[]) =>
    console.warn(`[${module}]`, msg, ...args),
  error: (module: string, msg: string, ...args: unknown[]) =>
    console.error(`[${module}]`, msg, ...args),
};
