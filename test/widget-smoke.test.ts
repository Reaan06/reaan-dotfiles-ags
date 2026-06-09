import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Headless smoke tests for widget modules
describe('widget modules (headless)', () => {
  beforeEach(() => {
    // prevent real timers or side effects
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('imports Clock and Weather without throwing', async () => {
    // Import modules dynamically; they should not require real GJS typelibs at import time
    // Use a simple mock for GLib used in Clock
    vi.stubGlobal('GLib', {
      DateTime: {
        new_now_local: () => ({ format: (f: string) => 'mocked' })
      }
    })

    const Clock = await import('../widget/Bar/modules/Clock')
    const Weather = await import('../widget/Bar/modules/Weather')

    expect(typeof Clock.default).toBe('function')
    expect(typeof Weather.default).toBe('function')
  })
})
