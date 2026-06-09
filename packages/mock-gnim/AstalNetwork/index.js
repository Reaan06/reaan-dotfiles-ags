// Minimal mock for AstalNetwork used by tests
module.exports = {
  get_default() {
    return {
      // Provide properties used by the Network module
      wifi: null,
      // createBinding expects accessors, but widget uses createBinding from gnim
    }
  }
}
