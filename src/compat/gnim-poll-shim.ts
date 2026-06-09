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
  try {
    const s = gnim.createState(null)
    if (s && typeof s.poll === 'function') return
  } catch (e) {
    return
  }
  // If createState exists but lacks poll, we intentionally do NOT monkey-patch in tests.
}

export function createStateWithPoll<T>(initial: T): StateAccessor<T> & { poll(intervalMs: number, cb: (...args: any[]) => T | Promise<T>): StateAccessor<T> } {
  // Create a simple accessor that holds current value and exposes poll
  let value = initial
  const accessor = (() => value) as StateAccessor<T> & { poll?: any }

  accessor.poll = (intervalMs: number, cb: (...args: any[]) => T | Promise<T>) => {
    // Use setInterval for scheduling in tests; return accessor for chaining
    const run = async () => {
      try {
        const res = cb()
        value = res instanceof Promise ? await res : res
      } catch (e) {
        // swallow errors — original code often returns fallback strings
      }
    }
    // run immediately then schedule
    run()
    const id = setInterval(run, intervalMs)
    // Provide a dispose? For now keep it simple
    return accessor
  }

  return accessor
}

export default {
  ensurePollPatch,
  createStateWithPoll,
}
