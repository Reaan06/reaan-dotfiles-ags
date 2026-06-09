// Vendor mock for AstalBluetooth typelib used in tests
module.exports = {
  get_default() {
    return {
      isPowered: false,
      devices: [],
    }
  }
}
