Topbar compatibility shim (gnim.createState().poll)

What
- Small compatibility shim and helper createStateWithPoll to avoid "createState(...).poll is not a function" TypeError when the installed AGS/gnim runtime lacks the poll API.

How to test in a headful environment
1. Ensure AGS and gnim runtime are installed and available in PATH
2. Run: ./scripts/start-bar.sh
3. Observe the bar starts without TypeError. If TypeError occurs, ensure shim is imported before Bar modules (app.ts)

Notes
- Unit tests run in headless CI and cannot import gi:// GLib or the ags runtime. Integration checks that require a display must be run locally in a headful environment.

Note: The start script will attempt to call the shim at runtime when 'ags' is present. Unit tests included in this change are headless-only and stub GLib where necessary.
