# Valibot migration

Baseline: main `c0c3c582f2e37fa9e6bf98a5668c2ca830b02927` (Zod Mini 4.6.7).
Candidate: Valibot 1.4.2, matching the workspace's existing override. Every
direct declaration and lockfile resolution uses that version. Registry SHA-512:

```text
gjdCvJ6d3RyHAneqxMYMW9QMCwYMb3jpOO0IyHZV1bnRHFBHrX3VkIILt5XYR0WhwHiH7Mty8ovuPZ/O3gamrg==
```

## Behaviour

- All 95 exported schemas use Valibot; derived types use `InferOutput`.
- Direct parsing in web/native request handlers uses `safeParse`/`parse`.
- WireTyped continues using Standard Schema; no transport adapter was added.
- Unknown object keys are stripped; optional/null/default handling, trimming,
  finite numbers, safe integers, bounds and URL/coercion validation are retained.
- An input guard rejects arrays for all-optional objects. Plain Valibot objects
  would otherwise accept those arrays, unlike the previous schemas.
- Omitted room mode still becomes `server`; legacy falsy mode inputs retain
  their existing normalization. Cast default arrays remain independent.
- Application-authored validation messages remain unchanged. Valibot's generic
  messages and internal issue codes are not identical to Zod's. Consumers use
  Standard Schema issues and do not rely on ZodError or Zod-specific codes.
- Locale initialization and the Zod compiler are removed. Models are now
  side-effect-free. Expo's unrelated transitive Zod 3 dependency remains.

## Production JavaScript sizes

Both revisions were built with Node 26.8.1, pnpm 12.3.4, the same app build
settings, asset configuration and minifier. `scripts/report-web-bundles.mjs`
reads every emitted `.js` and sums independent gzip level-9 compression sizes.
Source maps, CSS, fonts and SSR server output are excluded.

| App | Zod gzip bytes | Valibot gzip bytes | Saved bytes | Reduction |
| --- | ---: | ---: | ---: | ---: |
| Platform | 283,327 | 267,330 | 15,997 | 5.6% |
| Admin | 122,802 | 106,795 | 16,007 | 13.0% |
| Embed | 113,981 | 98,134 | 15,847 | 13.9% |
| Remote | 156,007 | 140,028 | 15,979 | 10.2% |
| Cast | 194,699 | 160,454 | 34,245 | 17.6% |
| Tizen | 156,647 | 139,666 | 16,981 | 10.8% |

These are total emitted JavaScript inventories, **not initial-route network
transfers**. Lazy assets are included. Cast includes both modern and legacy
outputs; a device does not normally download both. No native download-size,
startup-time, validation-throughput or LCP improvement is claimed.

## Validation

- Frozen install passes; registry integrity matches the lockfile.
- Workspace lint/API-boundary checks and TypeScript checks pass.
- All six web production builds pass: Platform, Admin, Remote, Embed, Cast,
  and packaged Tizen. Generated browser-module reports contain Valibot, no
  Zod, and no forbidden server/React runtime modules.
- 114 repository tests pass, including 99 model tests and three API transport
  tests. The model corpus covers 16,789 accepted/rejected/output comparisons
  against the original Zod implementation, with every public schema represented.
- 20 shared transport/cache/revalidation/deployment tests, three theme tests,
  one frame-policy test and five hosted TV-player tests pass.
- Mobile and TV validation pass, including Tizen packaging.
- Production Expo exports compile iOS mobile, Android mobile and Android TV
  JavaScript/Hermes bundles. No native binary was submitted or published.
- `git diff --check` passes.

## Cast legacy support

The receiver retains `@vitejs/plugin-legacy`, Chrome >=80, `chrome80` CSS,
regenerator polyfills and its existing CSS cascade-layer transformation.
Neither its build target nor fallback loading behaviour was removed.

`pnpm --filter @vibes/cast test:legacy` checks the built HTML's `nomodule`
entry/polyfill references, corresponding files and classic SystemJS
registration for the legacy entry and lazy provider chunks. URL validation
does not require newer `URL.canParse` support.

This is build/fixture evidence, not a new physical Chromecast test. Physical
Cast, Samsung TV, camera pairing and native playback were not revalidated.
No live backend mutations, deployment or infrastructure changes were performed.
