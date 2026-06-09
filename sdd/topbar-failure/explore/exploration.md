## Exploration: topbar-failure

### Current State
Running `ags run app.ts` (safe launcher) fails early in a headless environment with runtime errors. Captured runtime log: /tmp/ags_run.log (example error: missing typelib 'AstalHyprland' causing a JS exception). The bar's widget modules (Clock, Weather) use a polling API pattern like `createState(...).poll(...)` which has historically crashed when the installed `gnim`/`ags` runtime does not provide `.poll` on createState results.

There is an existing compatibility shim at `src/compat/gnim-poll-shim.ts` that exposes `createStateWithPoll()` and `ensurePollPatch()`; current widget modules already import `createStateWithPoll` and call `.poll(...)` on its result.

### Affected Areas
- `widget/Bar/modules/Clock.tsx` — uses `createStateWithPoll(...).poll(1000, ...)`; renders time/date labels.
- `widget/Bar/modules/Weather.tsx` — uses `createStateWithPoll(...).poll(600000, cmd, cb)` to fetch weather via curl.
- `src/compat/gnim-poll-shim.ts` — shim implementation to provide setInterval-based polling in test/CI and to optionally patch runtime.
- `scripts/start-bar.sh` and `package.json` — reproduction and test scripts; `ags run` is used to start the app (we must not run GUI in CI).

Also relevant: system/runtime-provided gjs/typelib dependencies (e.g., AstalHyprland typelib) can cause startup failures unrelated to `.poll`; logs show a missing typelib error in headless runs. These must be considered when reproducing full GUI runs, but are out of scope for the shim approach (we'll run in headless mode by importing modules only).

### Investigation (static & runtime)
- Safe reproduction: executed `ags run app.ts` and captured /tmp/ags_run.log; error observed: `Typelib file for namespace 'AstalHyprland', version '0.1' not found` which aborts gjs before widgets run. Log saved at: /tmp/ags_run.log.
- Static search (widget modules) for `createState(` and `.poll(`:
  - `.poll(` occurrences found in:
    - `widget/Bar/modules/Weather.tsx` (line with createStateWithPoll(...).poll(...))
    - `widget/Bar/modules/Clock.tsx` (two `.poll` calls for time and date)
  - No raw `createState(` usages with `.poll` were found in widget directory; modules already import the shim `createStateWithPoll`.
- The existing shim `src/compat/gnim-poll-shim.ts` implements a test-friendly `createStateWithPoll()` accessor that exposes a `.poll` method implemented with setInterval and avoids monkey-patching the global runtime inside tests.

### Approaches
1. **Tight runtime patch (monkey-patch gnim.createState().poll)** — At app startup, detect installed `gnim.createState` and if its results lack `.poll`, attach a `.poll` implementation that uses the runtime event loop (GLib.timeout_add or a compatible API).
   - Pros: Minimal changes to widget modules; matches runtime behavior closely.
   - Cons: Risky to monkey-patch runtime-provided objects; needs careful cleanup; platform differences (GLib vs setInterval) across environments.
   - Effort: Medium

2. **Compatibility shim + migrate modules to use shim accessor (current)** — Provide `createStateWithPoll()` that returns an accessor with a `.poll` implemented with setInterval for headless/test; ensure production path uses a `ensurePollPatch()` at startup to patch runtime when safe.
   - Pros: Explicit, testable, safe in CI (no GUI). Widgets already import shim in this repo, so changes are small.
   - Cons: Two code paths (shim vs runtime patch) must be kept consistent; developers must remember to import shim or run `ensurePollPatch()` at app bootstrap.
   - Effort: Low

3. **Remove `.poll` chaining and replace with explicit polling APIs** — Change widgets to call a `createPoll` helper or subscribe to an observable that the app bootstrap controls.
   - Pros: Clean separation of concerns; easier to test and to run in headless.
   - Cons: Larger code changes across modules; higher churn.
   - Effort: High

### Recommendation
Follow Approach 2 (Compatibility shim + minimal migration). Rationale:
- The repository already includes `src/compat/gnim-poll-shim.ts` and widgets are already importing `createStateWithPoll`. That means the repository is mostly migrated and only needs tests and a small runtime patch strategy.
- This approach is low-risk for CI and enables TDD-friendly unit tests that import modules headlessly (no GUI). It also keeps changes minimal and reviewable.

Suggested next steps for implementation (for an SDD apply phase):
1. Add Vitest unit tests for `src/compat/gnim-poll-shim.ts` verifying `.poll` schedules and updates state (use fake timers where appropriate).
2. Add unit tests for `widget/Bar/modules/Clock.tsx` and `Weather.tsx` that import the module headlessly and assert that the exported component function runs without requiring GUI or the AstalHyprland typelib (use mocks for GLib and external commands). For Clock, mock GLib.DateTime; for Weather, mock the cmd runner or replace the network call with a stub.
3. Enhance `ensurePollPatch()` to attempt a safe runtime patch when a runtime `gnim` exists and to prefer GLib.timeout_add on GJS environments, falling back to setInterval in other environments. Keep the function opt-in (call from app bootstrap) to avoid surprising side-effects in tests.
4. Add an integration smoke test that imports `widget/Bar/modules/Clock.tsx` and `Weather.tsx` and asserts no exceptions are thrown when using shim/mocks.
5. Commit changes in small work-unit commits, run headless tests, iterate until green, and open a draft PR.

### Risks
- System typelibs or other runtime dependencies (AstalHyprland, GLib versions) will still break a full `ags run` in headless CI. Tests must avoid starting the GUI and should mock these dependencies.
- Over-aggressive monkey-patching of runtime `gnim` may mask real incompatibilities between code and runtime; prefer explicit shim usage in widgets.

### Ready for Proposal
Yes — the repo already contains most of the pieces. The apply phase should implement tests, strengthen the shim (safe runtime patch path), and add small module tests and a headless smoke test.

### Artifacts produced during exploration
- Reproduction log: `/tmp/ags_run.log` (captured runtime error)
- Static search results: occurrences in `widget/Bar/modules/Clock.tsx` and `widget/Bar/modules/Weather.tsx`
- Existing shim: `src/compat/gnim-poll-shim.ts`

---
Generated by sdd-explore executor.
