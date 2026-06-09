// Minimal compatibility shim for gnim.createState().poll
// Exports: ensurePollPatch(), createStateWithPoll(initial)

type StateAccessor<T> = () => T

function _requireGnim() {
  try {
    // Use require to avoid ESM import resolution in test env
    // @ts-ignore
    return require('gnim')
  } catch (e) {
    return null
  }
}

export function ensurePollPatch(): void {
  const gnim = _requireGnim()
  if (!gnim || typeof gnim.createState !== 'function') return
  // Delegate to patchGnim for the actual monkey-patch so tests can call it directly
  patchGnim(gnim)
}

export function createStateWithPoll<T>(initial: T): StateAccessor<T> & { poll(intervalMs: number, cb: (...args: any[]) => T | Promise<T>): StateAccessor<T> } {
  // Create a simple accessor that holds current value and exposes poll
  let value = initial
  const accessor = (() => value) as StateAccessor<T> & { poll?: any }

  accessor.poll = (intervalMs: number, maybeCmdOrCb: any, maybeCb?: any) => {
    // Support signatures:
    // .poll(intervalMs, cb)
    // .poll(intervalMs, cmdArray, cb)
    let cmd: any = undefined
    let cb: (...args: any[]) => T | Promise<T>
    if (Array.isArray(maybeCmdOrCb)) {
      cmd = maybeCmdOrCb
      cb = maybeCb
    } else {
      cb = maybeCmdOrCb
    }

    const run = async () => {
      try {
        if (cmd) {
          // Attempt to run the command if child_process is available; otherwise call cb with empty string
          try {
            // Use require at runtime to avoid import errors in non-node environments
            // @ts-ignore
            const cp = require('child_process')
            const out = cp.spawnSync(cmd[0], cmd.slice(1), { encoding: 'utf8' }).stdout
            const res = cb ? cb(out) : out
            value = res instanceof Promise ? await res : res
          } catch (e) {
            // fallback: call cb with empty string
            if (cb) {
              const res = cb('')
              value = res instanceof Promise ? await res : res
            }
          }
        } else {
          const res = cb()
          value = res instanceof Promise ? await res : res
        }
      } catch (e) {
        // swallow errors — original code often returns fallback strings
      }
    }
    // run immediately then schedule
    run()
    const id = setInterval(run, intervalMs)
    return accessor
  }

  return accessor
}

export default {
  ensurePollPatch,
  createStateWithPoll,
}

// Patch helper: attach .poll to accessors produced by gnim.createState when missing
export function patchGnim(gnim: any) {
  if (!gnim || typeof gnim.createState !== 'function') return
  if ((gnim as any).__pollPatched) return
  const origCreateState = gnim.createState.bind(gnim)
  gnim.createState = function (initial: any) {
    const s = origCreateState(initial)
    try {
      if (!s || typeof s.poll === 'function') return s
      // Attach a poll that delegates to createStateWithPoll semantics
      s.poll = (intervalMs: number, maybeCmdOrCb: any, maybeCb?: any) => {
        // create an internal accessor to manage value and polling separate from runtime state
        const acc = createStateWithPoll(s())
        return acc.poll(intervalMs, maybeCmdOrCb as any, maybeCb as any)
      }
    } catch (e) {
      // ignore
    }
    ;(gnim as any).__pollPatched = true
    return s
  }
}
