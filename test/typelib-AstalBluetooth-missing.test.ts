import { describe, it, expect } from 'vitest'

describe('compat: AstalBluetooth missing', () => {
  it('importing Bluetooth module should not throw when AstalBluetooth absent', async () => {
    const mod = await import('../widget/Bar/modules/Bluetooth')
    expect(mod).toBeDefined()
  })
})
