import { describe, it, expect } from 'vitest'

describe('compat: AstalHyprland missing', () => {
  it('importing Workspaces should not throw when AstalHyprland absent', async () => {
    const mod = await import('../widget/Bar/modules/Workspaces')
    expect(mod).toBeDefined()
  })
})
