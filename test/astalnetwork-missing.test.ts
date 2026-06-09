import { describe, it, expect } from 'vitest'

describe('compat: AstalNetwork missing', () => {
  it('module authors import without throwing when AstalNetwork absent', async () => {
    // Import the Network module which uses safeRequire for AstalNetwork
    const mod = await import('../widget/Bar/modules/Network')
    expect(mod).toBeDefined()
  })
})
