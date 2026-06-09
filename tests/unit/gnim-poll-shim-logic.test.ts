import { describe, it, expect, vi } from 'vitest'

// Test the pure helper createStateWithPoll behavior (no gnim dependency)
import { createStateWithPoll } from '../../src/compat/gnim-poll-shim'

describe('createStateWithPoll logic', () => {
  it('starts with initial value and updates after poll', async () => {
    const accessor = createStateWithPoll('init')
    expect(accessor()).toBe('init')

    accessor.poll(10, () => 'updated')

    // Wait a bit for interval to run
    await new Promise((r) => setTimeout(r, 30))
    expect(accessor()).toBe('updated')
  })
})
