import { describe, it, expect } from 'vitest'
import { createStateWithPoll, ensurePollPatch, patchGnim } from '../src/compat/gnim-poll-shim'

describe('gnim poll shim - public API', () => {
  it('createStateWithPoll updates value via poll callback', async () => {
    const acc = createStateWithPoll('x')
    expect(acc()).toBe('x')
    acc.poll(10, () => 'y')
    await new Promise((r) => setTimeout(r, 30))
    expect(acc()).toBe('y')
  })

  it('patchGnim attaches poll to gnim.createState accessors', () => {
    const fakeGnim: any = { createState: (v: any) => (() => v) }
    patchGnim(fakeGnim)
    const acc = fakeGnim.createState('a')
    // should return an accessor with a poll function
    expect(typeof acc.poll).toBe('function')
  })
})
