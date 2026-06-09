AGENTS.md — Repository agent guidance

Purpose
- Short, high-signal instructions for agents working on this repo. Only include facts an agent would likely miss.

Quick summary
- This repo provides a desktop "bar" launched via `scripts/start-bar.sh` and `ags run app.ts`.
- Frequent failure: runtime TypeError originating in widget/Bar modules where code calls `createState(...).poll(...)`. The installed `gnim`/`ags` runtime may not expose `.poll` on `createState()` results.

Where to look first
- scripts/start-bar.sh — launcher script. Run a shell syntax check before executing: `bash -n scripts/start-bar.sh`.
- app.ts, main.ts — entry points that assemble the Bar UI.
- widget/Bar/modules/Clock.tsx and widget/Bar/modules/Weather.tsx — confirmed crash sites (calls to `createState(...).poll(...)`).
- widget/Bar/index.tsx and widget/bar/Bar.tsx — bar composition and import sources (case-diff duplicates).
- package.json — run scripts; `ags` invocation present.

Exact commands (safe, non-invasive)
- Check ags binary and version: `command -v ags && ags --version`.
- Dry-run the launcher (capture logs):
  - `pkill -x ags || true`
  - `ags run app.ts > /tmp/ags_run.log 2>&1 &`
  - `sleep 2 && sed -n '1,200p' /tmp/ags_run.log`
- Shell syntax check: `bash -n scripts/start-bar.sh`.
- Search for the problematic API usage: `rg "createState\(|\.poll\(" -n widget || true`.
- Inspect system/runtime gnim package if present (do NOT start GUI processes):
  - `command -v node && node -e "console.log(require.resolve('gnim'))" 2>/dev/null || true`
  - `grep -R "createState" $(node -e "try{console.log(require.resolve('gnim'))}catch(e){process.exit(0)}") 2>/dev/null || true`

Repro tip for maintainers
- The reported crash shows: `TypeError: createState(...).poll is not a function` pointing to widget/Bar/modules/Clock.tsx. Reproduce locally with the `ags run app.ts` log capture above on a machine with a display server (Wayland/X).
- DO NOT attempt to run UI binaries in a headless CI runner. If you need automated verification, run inside a container with a nested XWayland or use a headful runner.

Root causes & fixes (short)
- Cause: API mismatch between code (expects `.poll`) and installed `gnim`/`ags` runtime.
  - Fix A (recommended): Replace `.poll(...)` calls with a supported polling API (e.g., runtime-specific `createPoll`, GLib timeout, or setInterval) in Clock/Weather modules. Effort: Low.
  - Fix B: Add a small compatibility shim at app startup that detects missing `.poll` and provides a wrapper. Effort: Low-Medium; risk: masks upstream incompatibility.
  - Fix C: Pin or upgrade the runtime version that provides `.poll` and document the required version in install scripts/README. Effort: Medium.

Agent workflow notes
- Always run `sdd-init` (or check engram topic `sdd-init/reaan-dotfiles-ags`) before making SDD changes — it caches testing/runtime capabilities and the skill registry.
- Save findings to Engram under `sdd/topbar-failure/*` (explore, repro-logs, static-search) using `mem_save` with `capture_prompt: false` for artifacts.
- Load the skill registry `.atl/skill-registry.md` early; many repo-specific rules live there.

Do / Don't (quick)
- Do: run `bash -n scripts/start-bar.sh` and capture `ags run` output into a log file before editing files.
- Do: inspect `widget/Bar/modules/*` for `.poll` usages (they're the first place to fix).
- Don't: start GUI processes in CI or headless runners.
- Don't: assume `node_modules` match runtime-installed modules; the system `ags` runtime may ship its own `gnim` implementation.

Committing
- Use conventional commits. Keep commit messages concise and reference the failing modules (e.g., `fix(bar): replace createState().poll with runtime-supported polling in Clock`).

References
- Skill registry: .atl/skill-registry.md
- Engram topics created during triage: `sdd-init/reaan-dotfiles-ags`, `sdd/topbar-failure/explore`, `sdd/topbar-failure/repro-logs`, `sdd/topbar-failure/static-search`
