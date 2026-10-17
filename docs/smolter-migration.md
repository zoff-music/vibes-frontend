# Smolter 0.3.3 integration review

This supplements draft PR #413. It is not a ten-pass or physical-device sign-off.
The integration uses the published [0.3.3 release](https://github.com/kasperrt/smolter/releases/tag/v0.3.3)
containing [upstream PR #13](https://github.com/kasperrt/smolter/pull/13), retaining
the 0.3.2 integration from [upstream PR #12](https://github.com/kasperrt/smolter/pull/12).

## Runtime boundaries

- Platform, Admin, Remote and Embed use Preact SSR through the shared Express host.
- Cast uses its browser receiver entry; Samsung Tizen uses a packaged hash-routed browser entry.
- Mobile retains Expo Router. Android TV retains Expo's registered root/session flow.
- Server handlers stay in server-only route modules. Vite's browser inventory rejects server modules and React DOM/React Router runtimes.

## Changes

- All nine Smolter dependency declarations and the lockfile resolve published 0.3.3. The temporary 0.3.1 patch and patch registration are removed; unrelated native patches remain. There are no Smolter local-source links, aliases or monkey patches.
- Removed temporary `dataPath` configuration and environment patching. Official `dataEndpoint` options connect generated routes, development middleware and production handlers. Admin uses `/admin/_smolter`, Remote `/remotes/_smolter`, Embed its configured base plus `/_smolter`; Platform retains `/_smolter`.
- Removed the post-mount deployment watcher. Platform, Admin, Remote, Embed and Cast pass deployment options directly to mounting. Packaged Tizen has `{ hash: true }` and no deployment watcher.
- Removed the copied data-cache middleware and obsolete React Router data-response hook. The released adapter owns private/no-store policy.
- Room entry uses loader `reason`, not browser history timing. Initial, navigation, fetcher and absent reasons request twelve upcoming items. Explicit revalidation and action refreshes recover the full queue.
- Tizen parses multipart submissions with `request.formData()` and forwards abort signals. REST orchestration remains in its client action module.
- Profile revalidation compares normalized action pathnames. Admin logout explicitly targets `/admin`, including from Users. Admin session reads forward cancellation.
- SSR entries export their build-time client asset base, so hydration entry and preload URLs preserve CDN configuration without moving data transport to the CDN.

## Previous 0.3.2 integration checks

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

## 0.3.3 validation

The upgrade from integration commit `5b893c2` changes dependency pins, the lockfile,
tests and documentation only. Scoped transport, bootstrap recovery, queue loader
reasons, Tizen form parsing, profile normalization, Admin logout, streaming/cache
policy and CDN-aware entries/preloads remain unchanged.

Workspace lint/typechecking, frozen installation with pnpm 12.3.4 and all six
production web builds passed again, including browser-boundary checks. The npm
package integrity matches the lockfile; the installed dependency resolves to the
registry-backed 0.3.3 store, not a checkout or patch. Sixteen focused Node tests
pass (including the deployment suite's parent test and seven scenarios).

Production Platform was exercised through a local fault-injection reverse proxy
with fixture APIs. No application router code was patched for these checks:

| Scenario | Result |
| --- | --- |
| Privacy → failed Security intent prefetch → first click, newer manifest | Keyboard-focus intent downloaded the Security chunk and received 404. Prefetch alone caused no manifest request or document reload. The first click checked the manifest, loaded one Security document and hydrated; Settings opened. No second click. |
| Security then Terms with manifest delayed 1,800 ms | Both clicks preceded completion. One manifest request and one Terms document request; no Security or Privacy reload. Latest destination won. |
| Missing initial Security chunk | One recovery reload retained `?audit=initial#policy-scope`; Security hydrated and Settings opened. |
| Deployment changes during navigation | First manifest check returned the current build; failed chunk triggered a second check returning a newer build. One Security reload, working Settings. |
| Unchanged manifest / HTTP 503 manifest | Prefetch left Privacy intact. Clicking reached the Security URL with the route error UI, without reloading Privacy or looping. |
| Disconnected manifest / all local-origin requests disconnected after Privacy loaded | Prefetch left Privacy intact; committed navigation showed an error at Security without a document reload. After connectivity was restored, Try again recovered Security. Socket closure produced bounded browser retries, not a document reload loop. This simulates transport loss, not an OS offline toggle. |
| Profile save followed by recovery navigation | One successful fixture PATCH; subsequent Security recovery did not resubmit it. An initial harness-routing 404 was corrected before this successful check. |

`packages/serve/src/deployment.test.ts` uses the published public router/client APIs,
controlled event/manifest fixtures and a reload observer. It asserts idle failures
do not check or consume the marker; latest overlapping destination retains query
and hash; unchanged/503/rejected fetches leave recovery available; initial and
active-navigation recovery preserve destinations; the same build reloads at most
once; and a redirecting mutation with a preload error executes once, without a
deployment fetch/reload. Query/hash preservation for overlapping navigation and
the mutation-in-flight chunk case are deterministic API tests, not full browser
end-to-end tests. The browser overlapping-navigation check used ordinary policy URLs.

Recovery cannot execute if the initial entry script itself is missing. Streaming
still starts the shell before deferred data completes, but hydration waits for the
document stream to finish; this is not progressive hydration. The 1,500 ms stats
measurement above belongs to the previous integration, not a new benchmark.

## Remaining blockers and limitations

1. The previously blocking stale intent-prefetch lost-click issue is resolved in the tested production flow by 0.3.3. No local router workaround was added.
2. Real paired-controller playback, queue voting/reconnect races, camera QR scanning, physical Cast and Samsung TV, and native iOS/Android/Android TV runtime parity remain unverified here. No simulator or emulator was started for this upgrade.
3. Broader Back/Forward races, OS-level offline behavior, mutation/chunk-failure combinations beyond the documented tests, customized Embed-base browser flows, and manual route-array HMR still need their complete regression matrix. Recovery was fault-injected in Platform, not independently in every hosted app. A successful build does not establish full parity.
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

### 0.3.2 → 0.3.3

Same production build command and gzip-level-9 reporting script, measured before
and after this upgrade. Values are bytes. The small changes below are not a
meaningful performance improvement; generated identities can affect compression.

| App | 0.3.2 all JS gzip | 0.3.3 all JS gzip | Delta | 0.3.3 static entry closure |
| --- | ---: | ---: | ---: | ---: |
| Platform | 284,406 | 284,386 | -20 | 69,079 |
| Admin | 120,673 | 120,666 | -7 | 52,059 |
| Embed | 113,564 | 113,548 | -16 | 47,680 |
| Remote | 155,730 | 155,714 | -16 | 55,492 |
| Cast | 193,955 | 193,931 | -24 | Not measured |
| Tizen | 156,913 | 156,890 | -23 | Not measured |

All-JS totals include lazy chunks and legacy variants, not initial-route transfer.
Static entry closures omit dynamic matched routes, CSS, fonts and other assets.
