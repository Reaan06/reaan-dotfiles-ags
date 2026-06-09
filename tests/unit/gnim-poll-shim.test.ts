import { describe, it, expect } from 'vitest'

// Strict TDD: reference production API that does not exist yet — test should fail (RED)
describe('gnim-poll-shim', () => {
  it('exports ensurePollPatch and createStateWithPoll', async () => {
    const shim = await import('../../src/compat/gnim-poll-shim')
    expect(typeof shim.ensurePollPatch).toBe('function')
    expect(typeof shim.createStateWithPoll).toBe('function')
  })
})
