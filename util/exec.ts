import { execAsync as agsExecAsync } from "ags/process"
import { logger } from "./logger.js"

const MODULE = "exec"

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
        return await agsExecAsync(cmd)
    } catch (err) {
        logger.error(MODULE, `execAsync failed: ${cmd}`, err)
        throw err
    }
}

/**
 * Options for a long-running subprocess.
 */
export interface SubprocessOptions {
    /** Called with each line of stdout as it arrives. */
    onOutput?: (line: string) => void
    /** Called with each line of stderr as it arrives. */
    onError?: (line: string) => void
    /** Called when the process exits, with the exit code. */
    onExit?: (code: number) => void
}
