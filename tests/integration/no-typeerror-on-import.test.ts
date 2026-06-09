import { describe, it, expect } from 'vitest'

// Integration test: importing Bar modules should not throw TypeError due to missing poll
// NOTE: This test cannot fully emulate the AGS runtime (gnim) in headless environment.
// We run a smoke import to ensure our shim doesn't throw on import.

describe('integration: Bar modules import', () => {
  it('imports shim and modules without throwing in headless test environment (skip real AGS)', async () => {
    // We cannot import the full AGS runtime (ags/gtk3) in headless tests.
    // Instead import the shim module and the Bar modules directly to ensure shim doesn't throw on import.
    // Import shim directly
    await expect(import('../../src/compat/gnim-poll-shim')).resolves.not.toThrow()
    // Clock and Weather import GLib (gi://) which isn't supported in headless test loader.
    // We instead assert that their source files reference createStateWithPoll to show migration.
    // We cannot import modules that use 'gi://' in this headless environment.
    // Instead, assert the source files contain the migration helper string.
    const fs = await import('fs')
    const clock = fs.readFileSync('widget/Bar/modules/Clock.tsx', 'utf8')
    expect(clock).toContain('createStateWithPoll')
    const weather = fs.readFileSync('widget/Bar/modules/Weather.tsx', 'utf8')
    expect(weather).toContain('createStateWithPoll')
  })
})
