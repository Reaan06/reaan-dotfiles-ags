// Dev-only mock for ags used in vitest environment
export function run(entry: string) {
  // no-op stub for tests
  return Promise.resolve({ pid: 0, entry })
}

export default { run }
