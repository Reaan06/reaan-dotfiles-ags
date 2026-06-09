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

  // Provide a minimal safe stub for common hyprland methods used by widgets
  const stub: any = new Proxy({}, {
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

  return { present: false, stub }
}

export default { safeRequire }
