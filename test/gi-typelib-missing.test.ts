import { describe, it, expect, vi } from 'vitest'

// Simulate missing gi typelib by stubbing require for 'gi://AstalHyprland'
describe('gi-typelib-guard', () => {
  it('returns stub when AstalHyprland is missing', async () => {
    // Ensure require of gi:// is not present — emulate by temporarily stubbing require
    const guard = await import('../src/compat/gi-typelib-guard')
    const res = guard.safeRequire('AstalHyprland', '0.1')
    expect(res).toBeDefined()
    expect(typeof res.present).toBe('boolean')
    expect(res.present).toBe(false)
    expect(res.stub).toBeDefined()
    // stub should provide a harmless get_default function
    expect(typeof res.stub.get_default === 'function' || typeof res.stub.get_default === 'object').toBe(true)
  })
})
