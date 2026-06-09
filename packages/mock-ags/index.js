// Vendor mock for `ags` used in CI and local tests when vendored
function run(entry) {
  // emulate launching: return a resolved promise with pid 0
  return Promise.resolve({ pid: 0, entry })
}

module.exports = { run }
module.exports.default = module.exports
