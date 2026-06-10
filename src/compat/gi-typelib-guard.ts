// Safe guard for importing GObject Introspection typelibs (gi://...)
// API: safeRequire(namespace: string, version?: string)
// Returns: { present: boolean, module?: any, stub?: any }

type SafeResult = { present: boolean, module?: any, stub?: any }

function _requireGi(spec: string): any | null {
  try {
    // Use require to avoid ESM resolution in test env
    // @ts-ignore
    return require(spec)
  } catch (e) {
    return null
  }
}

export function safeRequire(namespace: string, version?: string): SafeResult {
  // Normalize spec like 'gi://AstalHyprland?version=0.1' used elsewhere
  const spec = `gi://${namespace}${version ? `?version=${version}` : ''}`
  const mod = _requireGi(spec)
  if (mod) return { present: true, module: mod }

  // If running under the AGS runtime (gjs) it will attempt to resolve gi:// imports
  // at runtime which will throw if typelibs are missing. To guard against that when
  // require(spec) fails with a missing typelib, provide a safe JS-level stub by
  // defining a synthetic module mapping using the global `imports` available in gjs
  // environments. We don't want to mutate global state during tests, so do this
  // only when gjs is present.
  try {
    // @ts-ignore
    if (typeof globalThis !== 'undefined' && (globalThis as any).imports) {
      // Create a harmless stub object that mirrors what safeRequire would return
      const syntStub = new Proxy({}, { get: () => () => undefined })
      return { present: false, stub: syntStub }
    }
  } catch (e) {}

  // Provide a minimal safe stub. If a mock package exists (vitest alias), prefer that.
  // Try several known mock paths derived from namespace to increase chance of matching.
  let stub: any = null
  try {
    const candidatePath = `../../packages/mock-gnim/${namespace}`
    // @ts-ignore
    const mock = require(candidatePath)
    if (mock) stub = mock
  } catch (e) {
    // try without prefix (some packages export directly under packages/mock-gnim)
    try {
      // @ts-ignore
      const mock2 = require(`../../packages/mock-gnim/${namespace.replace(/^Astal/, '')}`)
      if (mock2) stub = mock2
    } catch (e2) {
      // fallthrough
    }
  }

  if (!stub) {
    stub = new Proxy({}, {
      get(_, prop: string) {
        // Return harmless no-op functions or objects that won't crash on access
        if (prop === 'get_default') return () => ({
          // provide dispatch and focusedWorkspace binding accessors used by Workspaces
          dispatch: (_: string, __: string) => {},
          focusedWorkspace: null,
        })
        return () => undefined
      }
    })
  }

  return { present: false, stub }
}

export default { safeRequire }
