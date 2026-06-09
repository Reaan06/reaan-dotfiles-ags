// Dev-only mock for gnim used in vitest environment
export function createState<T>(initial: T) {
  let value = initial
  const accessor = (() => value) as any
  accessor.poll = (intervalMs: number, cb: any) => {
    // simple immediate run + timeout to emulate polling
    try {
      const res = typeof cb === 'function' ? cb() : undefined
      value = res === undefined ? value : res
    } catch (e) {
      // ignore
    }
    setTimeout(() => {
      try {
        const res = typeof cb === 'function' ? cb() : undefined
        if (res !== undefined) value = res
      } catch (e) {}
    }, Math.max(10, intervalMs))
    return accessor
  }
  return accessor
}

export default { createState }
