import { describe, it, expect, vi } from 'vitest'

// Smoke test for Clock and Weather modules in headless environment
vi.stubGlobal('GLib', {
  DateTime: {
    new_now_local: () => ({ format: (_f: string) => 'MOCK' }),
  },
})

describe('widget smoke', () => {
  it('imports Clock and Weather without throwing', async () => {
    const Clock = await import('../widget/Bar/modules/Clock')
    const Weather = await import('../widget/Bar/modules/Weather')
    expect(typeof Clock.default).toBe('function')
    expect(typeof Weather.default).toBe('function')
  })
})
