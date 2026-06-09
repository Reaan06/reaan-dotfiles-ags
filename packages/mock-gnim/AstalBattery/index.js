// Vendor mock for AstalBattery typelib used in tests
module.exports = {
  get_default() {
    return {
      percentage: 100,
      is_charging: false,
    }
  }
}
