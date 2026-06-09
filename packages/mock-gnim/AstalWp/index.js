// Vendor mock for AstalWp typelib used in tests
module.exports = {
  get_default() {
    return {
      audio: { defaultSpeaker: { volume: 0.5, mute: false } }
    }
  }
}
