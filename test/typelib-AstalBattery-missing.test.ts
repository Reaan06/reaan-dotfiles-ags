import { describe, it, expect } from 'vitest'

describe('compat: AstalBattery missing', () => {
  it('importing Battery module should not throw when AstalBattery absent', async () => {
    const mod = await import('../widget/Bar/modules/Battery')
    expect(mod).toBeDefined()
  })
})
