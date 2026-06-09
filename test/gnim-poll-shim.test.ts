import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createStateWithPoll } from '../src/compat/gnim-poll-shim'

describe('gnim-poll-shim', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('should update state immediately and on interval', async () => {
    let count = 0
    const s = createStateWithPoll(0)
    s.poll(1000, () => ++count)
    // initial run scheduled immediately
    expect(s()).toBe(1)
    // advance timers by one interval
    vi.advanceTimersByTime(1000)
    // allow any pending promises to settle
    await Promise.resolve()
    expect(s()).toBe(2)
  })
})
