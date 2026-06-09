import { describe, it, expect } from 'vitest'

describe('compat: AstalWp missing', () => {
  it('importing Volume module should not throw when AstalWp absent', async () => {
    const mod = await import('../widget/Bar/modules/Volume')
    expect(mod).toBeDefined()
  })
})
