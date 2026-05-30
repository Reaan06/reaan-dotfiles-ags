import { execAsync as agsExecAsync } from "resource:///com/github/Aylur/ags/utils.js";
import { logger } from "./logger.js";

const MODULE = "exec";

/**
 * Typed wrapper around AGS's execAsync.
 * Runs a shell command and returns its stdout as a string.
 * Errors are logged via the centralised logger and re-thrown so callers can
 * decide whether to recover or propagate.
 *
 * @param cmd  The command string to execute.
 * @returns    Resolved stdout string on success.
 * @throws     The original error after logging it.
 */
export async function execAsync(cmd: string): Promise<string> {
  try {
    return await agsExecAsync(cmd);
  } catch (err) {
    logger.error(MODULE, `execAsync failed: ${cmd}`, err);
    throw err;
  }
}

/**
 * Options for a long-running subprocess.
 */
export interface SubprocessOptions {
  /** Called with each line of stdout as it arrives. */
  onOutput?: (line: string) => void;
  /** Called with each line of stderr as it arrives. */
  onError?: (line: string) => void;
  /** Called when the process exits, with the exit code. */
  onExit?: (code: number) => void;
}

/**
 * Wrapper for launching a long-running subprocess via AGS's Utils.subprocess.
 * Errors during spawn are logged and re-thrown; runtime stderr lines are
 * forwarded to `options.onError` (and also logged at warn level).
 *
 * @param cmd      The command string to run as a subprocess.
 * @param options  Callbacks for stdout lines, stderr lines, and process exit.
 * @returns        The subprocess handle returned by AGS (can be used to kill it).
 */
export function subprocess(
  cmd: string,
  options: SubprocessOptions = {},
): ReturnType<typeof Utils.subprocess> {
  const { onOutput, onError, onExit } = options;

  try {
    return Utils.subprocess(
      cmd,
      (line: string) => {
        onOutput?.(line);
      },
      (line: string) => {
        logger.warn(MODULE, `subprocess stderr [${cmd}]: ${line}`);
        onError?.(line);
      },
      (proc: { exit_status: number }) => {
        const code = proc.exit_status ?? 0;
        if (code !== 0) {
          logger.warn(MODULE, `subprocess exited with code ${code}: ${cmd}`);
        }
        onExit?.(code);
      },
    );
  } catch (err) {
    logger.error(MODULE, `Failed to spawn subprocess: ${cmd}`, err);
    throw err;
  }
}
