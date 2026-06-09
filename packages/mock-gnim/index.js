// Vendor mock for `gnim` used in CI and local tests when vendored
function createState(initial) {
  let value = initial
  const accessor = (() => value)
  accessor.poll = (intervalMs, maybeCmdOrCb, maybeCb) => {
    let cmd = undefined
    let cb = undefined
    if (Array.isArray(maybeCmdOrCb)) {
      cmd = maybeCmdOrCb
      cb = maybeCb
    } else {
      cb = maybeCmdOrCb
    }

    const run = () => {
      try {
        if (cmd) {
          // best-effort: if child_process is available, run sync; otherwise call cb with ''
          try {
            const cp = require('child_process')
            const out = cp.spawnSync(cmd[0], cmd.slice(1), { encoding: 'utf8' }).stdout
            if (typeof cb === 'function') {
              const res = cb(out)
              if (res !== undefined) value = res
            }
          } catch (e) {
            if (typeof cb === 'function') {
              const res = cb('')
              if (res !== undefined) value = res
            }
          }
        } else if (typeof cb === 'function') {
          const res = cb()
          if (res !== undefined) value = res
        }
      } catch (e) {
        // swallow
      }
    }

    // run immediately, then schedule
    try { run() } catch (e) {}
    const id = setInterval(run, intervalMs)
    // store interval id so callers can clear if they want
    accessor.__pollId = id
    return accessor
  }
  return accessor
}

function createStateWithPoll(initial) {
  return createState(initial)
}

function ensurePollPatch() {
  // no-op for mock; real runtime shim will patch when required
}

function patchGnim(gnim) {
  if (!gnim || typeof gnim.createState !== 'function') return
  if (gnim.__pollPatched) return
  const orig = gnim.createState.bind(gnim)
  gnim.createState = function (initial) {
    const s = orig(initial)
    try {
      if (!s || typeof s.poll === 'function') return s
      s.poll = (intervalMs, maybeCmdOrCb, maybeCb) => {
        const acc = createState(s())
        return acc.poll(intervalMs, maybeCmdOrCb, maybeCb)
      }
    } catch (e) {}
    gnim.__pollPatched = true
    return s
  }
}

module.exports = { createState, createStateWithPoll, ensurePollPatch, patchGnim }
module.exports.default = module.exports
