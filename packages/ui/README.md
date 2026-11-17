# Shared UI

Import DOM components from `@vibes/ui/web`, native components from
`@vibes/ui/native`, and renderer-neutral helpers from `@vibes/ui/shared`.

## Browser tests

Tests live beside their components as `*.browser.test.tsx`. Vitest Browser Mode
runs them in Chromium through its Playwright provider, with Vite compiling
Preact and the shared Tailwind stylesheet. No application server or backend is
required.

From the repository root:

```sh
pnpm exec playwright install chromium
pnpm --filter @vibes/ui test
pnpm --filter @vibes/ui test:watch
```

CI uses the matching Playwright container image and runs all suites through
the single `pnpm test` step in the shared test workflow. The player integration
suite runs in both Chromium and WebKit. `pnpm lint` and
`pnpm typecheck` cover the tests and their configuration.

The queue regression covers the 12-item server preview, hydration, the full
3,500-song snapshot, native title/artist matching, selection preservation,
scroll-to-match, voting/reordering, and bounded artwork/control counts at desktop
and mobile widths under 4× CPU slowdown. Headless `window.find` does not reveal
its selection like the browser toolbar, so the test explicitly scrolls the
matched text into view. It does not claim physical mobile browser coverage.

The package also owns the YouTube/SoundCloud player integration and native
bridge suites under `tests/players`, plus queue animation, hydration, chart,
and route transition regressions under `tests`. The real-provider soak test
is discovered by Vitest but requires four explicit `PLAYER_TRACKS`; it skips
when those optional external tracks are not supplied. Deterministic provider
SDK integration tests run in both browsers on every PR.
