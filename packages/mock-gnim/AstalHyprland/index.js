// Vendor mock for AstalHyprland typelib used in tests
module.exports = {
  get_default() {
    return {
      // minimal stubs used by Workspaces and KeyboardLayout
      focusedWorkspace: null,
      dispatch: (evt, arg) => {},
      kbdLayout: 'EN',
    }
  }
}
