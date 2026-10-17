# Smolter 0.3.2 integration review

This supplements draft PR #413. It is not a ten-pass or physical-device sign-off.
The integration uses the published [0.3.2 release](https://github.com/kasperrt/smolter/releases/tag/v0.3.2)
containing [upstream PR #12](https://github.com/kasperrt/smolter/pull/12).

## Runtime boundaries

- Platform, Admin, Remote and Embed use Preact SSR through the shared Express host.
- Cast uses its browser receiver entry; Samsung Tizen uses a packaged hash-routed browser entry.
- Mobile retains Expo Router. Android TV retains Expo's registered root/session flow.
- Server handlers stay in server-only route modules. Vite's browser inventory rejects server modules and React DOM/React Router runtimes.

## Changes

- All nine Smolter dependency declarations and the lockfile resolve published 0.3.2. The temporary 0.3.1 patch and patch registration are removed; unrelated native patches remain.
- Removed temporary `dataPath` configuration and environment patching. Official `dataEndpoint` options connect generated routes, development middleware and production handlers. Admin uses `/admin/_smolter`, Remote `/remotes/_smolter`, Embed its configured base plus `/_smolter`; Platform retains `/_smolter`.
- Removed the post-mount deployment watcher. Platform, Admin, Remote, Embed and Cast pass deployment options directly to mounting. Packaged Tizen has `{ hash: true }` and no deployment watcher.
- Removed the copied data-cache middleware and obsolete React Router data-response hook. The released adapter owns private/no-store policy.
- Room entry uses loader `reason`, not browser history timing. Initial, navigation, fetcher and absent reasons request twelve upcoming items. Explicit revalidation and action refreshes recover the full queue.
- Tizen parses multipart submissions with `request.formData()` and forwards abort signals. REST orchestration remains in its client action module.
- Profile revalidation compares normalized action pathnames. Admin logout explicitly targets `/admin`, including from Users. Admin session reads forward cancellation.
- SSR entries export their build-time client asset base, so hydration entry and preload URLs preserve CDN configuration without moving data transport to the CDN.

## Verified locally

All API-backed browser checks used local fixtures, not production databases or infrastructure.

- Workspace lint and typechecking; six production web builds; frozen pnpm 12.3.4 install.
- Published package resolution without a Smolter patch/local link. Existing `preact-render-to-string` is 6.8.1.
- Eight focused Node tests covering same-origin app routing, GET/POST/PATCH bodies, cache policy, redirecting action/root revalidation, profile rules, theme and frame protection. `test:transport` is available in `@vibes/serve`.
- Four production SSR apps behind one local origin. Security → Privacy → Terms client navigation; direct nested Admin access; login → Users → logout. Backend logs show one login and one logout mutation. The redirect regression test also asserts exactly one destination load and one root refresh.
- Forced Admin session failure returns HTTP 503 and the root error boundary.
- A controlled Admin SSR build with an HTTPS asset origin emits that origin in hydration-entry and preload URLs. All five hosted apps serve their deployment manifests with no-store and cross-origin access headers.
- Homepage → room requests `from=1&to=12&excludeCurrent=true`. Direct room SSR uses the same initial bounds. The fixture has no live queue, so this does not sign off voting/reconnect parity.
- Profile save issues one PATCH and refreshes root/profile state without another homepage stats/public-room read. Light theme persists across Platform → Remote.
- Explorer Music/Watch switching retains the explorer path. Remote join and Embed render on their app prefixes. Cast reaches its ready screen in a normal browser, not physical Cast hardware.
- Tizen multipart join and create render the selected room; hash URL, reload, leave and Back work in the browser package.
- Production homepage baseline shell TTFB 22 ms (warm 8 ms). With 1,500 ms added only to optional stats, shell TTFB was 15 ms and total response time 1,523 ms. These are local fixture measurements, not production latency claims. Hydrated homepage controls worked after completion.
- A missing initial Security chunk triggers one manifest check and one reload to Security; Settings works afterward. A failing manifest (503) causes no reload loop; the unavailable chunk still prevents hydration, as expected without a confirmed replacement.
- Development route addition, ordinary edit, rename and removal invalidate discovery without restarting Vite. The ordinary edit updates the open page through HMR. Temporary routes were removed afterward.

## Remaining blockers and limitations

1. **Stale intent-prefetch recovery can lose the first click.** Start on Privacy, make the Security lazy chunk return 404 and advertise a newer deployment manifest. Clicking Security first starts intent prefetch; its preload-error recovery reloads Privacy, not Security. A second click succeeds. The released watcher starts with the current location as its recovery destination, before navigation records another destination. This needs an upstream regression test/fix, not copied router code in Vibes.
2. Real paired-controller playback, queue voting/reconnect races, camera QR scanning, physical Cast and Samsung TV, and native iOS/Android/Android TV runtime parity remain unverified here. No simulator or emulator was started for this upgrade.
3. Actual offline behavior, unchanged-manifest missing chunks, rapid overlapping navigation/Back/Forward, mutation/chunk-failure combinations, customized Embed-base browser flows, and manual route-array HMR changes still need their complete regression matrix. A successful build does not establish these behaviors.
4. The earlier audit identified a possible native stale-room request race in Mobile's AppProvider. This web integration does not claim to resolve it.

Do not merge or deploy until remaining blocking behavior is resolved and the relevant runtime checks are complete.

## Bundle methodology

Use `node scripts/report-web-bundles.mjs`: every emitted JavaScript file is compressed individually at gzip level 9. The baseline is the local 0.3.1 audit build including its temporary patch, not main. Both use production Vite/minification; these inventories include lazy chunks and Cast legacy output and are **not initial-route transfer sizes**. Entry closures below include static imports, not dynamically matched routes or assets. Build identities can change compression by a few bytes.

| App | 0.3.1 audit JS gzip | 0.3.2 JS gzip | Delta | 0.3.2 static entry closure |
| --- | ---: | ---: | ---: | ---: |
| Platform | 284,002 | 284,406 | +404 | 69,086 |
| Admin | 119,660 | 120,673 | +1,013 | 52,059 |
| Embed | 113,211 | 113,564 | +353 | 47,681 |
| Remote | 155,348 | 155,730 | +382 | 55,490 |
| Cast | 193,239 | 193,955 | +716 | Not measured |
| Tizen | 155,844 | 156,913 | +1,069 | Not measured |

This is a correctness upgrade, not a claimed bundle-size reduction.
