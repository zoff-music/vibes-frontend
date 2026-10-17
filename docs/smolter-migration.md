# Smolter 0.4.0 integration review

This supplements draft PR #413. It is not a ten-pass or physical-device sign-off.
The integration uses the published [0.4.0 release](https://github.com/kasperrt/smolter/releases/tag/v0.4.0)
including [early hydration and asset hints](https://github.com/kasperrt/smolter/pull/16), retaining
the 0.3.2 integration from [upstream PR #12](https://github.com/kasperrt/smolter/pull/12).

## Runtime boundaries

- Platform, Admin, Remote and Embed use Preact SSR through the shared Express host.
- Cast uses its browser receiver entry; Samsung Tizen uses a packaged hash-routed browser entry.
- Mobile retains Expo Router. Android TV retains Expo's registered root/session flow.
- Server handlers stay in server-only route modules. Vite's browser inventory rejects server modules and React DOM/React Router runtimes.

## Changes

- All nine Smolter dependency declarations and the lockfile resolve published 0.4.0. The temporary 0.3.1 patch and patch registration are removed; unrelated native patches remain. There are no Smolter local-source links, aliases or monkey patches.
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

## 0.3.4 validation and performance against main

The published dependency upgrade preserves the 0.3.2 consumer integration without
adding router workarounds. Registry integrity matches the lockfile. Frozen install,
workspace lint/typechecking, all six production web builds and browser-boundary
checks pass. Eighteen focused tests pass across transport/recovery, cache,
revalidation, framing and theme (including the recovery parent test).

New public-API regressions cover pending Back checks superseded by Forward to the
current route/hash; a completed mutation invalidating an older recovery check;
and an action redirect whose missing destination chunk recovers to
`/admin/users?created=1#user`, with one mutation and one root refresh. These are
deterministic tests, not physical-device or full Admin browser sign-off.

Fresh production Platform browser checks passed: failed Security intent prefetch
from Privacy made no manifest request or document reload; the first click recovered
to Security and Settings opened. Back followed by Forward while a newer manifest
was delayed 1,800 ms retained Terms without a document reload. The other browser
scenarios documented under 0.3.3 were not all repeated for 0.3.4; their deterministic
recovery assertions were rerun.

### Production comparison, 17 October 2026

Baseline: main `56deeb8abf8fe3c8dc10f0e9a9e3eb5c308e4553`, React 19.2.8 /
React Router 8.4.0. Candidate: this migration with Smolter 0.3.4 / Preact 11.0.1.
Both were production-built and served with Node 26.8.1, pnpm 12.3.4 and the same
local fixture API. This compares the whole migration, not the router in isolation.
No production database or infrastructure was used.

HTTP measurements use direct app servers, gzip, keep-alive, concurrency one, five
warmups and thirty alternating samples per app/path. TTFB below is first **body**
byte, not 103 Early Hints. Processes/provider caches are warm. These localhost
numbers do not estimate Helsinki WAN/TLS/CDN latency or loaded-server throughput.

| Route | Main median / p95 TTFB ms | Smolter median / p95 TTFB ms | Main / Smolter complete ms, median | Main / Smolter document gzip bytes |
| --- | ---: | ---: | ---: | ---: |
| `/` | 2.86 / 4.27 | 3.03 / 3.98 | 5.44 / 3.82 | 18,740 / 9,843 |
| `/privacy-policy` | 1.75 / 3.20 | 1.78 / 1.97 | 2.91 / 1.92 | 14,686 / 7,815 |
| `/audit` fixture room | 5.05 / 6.91 | 4.94 / 8.67 | 6.50 / 5.07 | 10,875 / 4,497 |

The room fixture has an empty queue; this is not a large-playlist or live SSE
benchmark. TTFB is effectively unchanged, and the room p95 is worse in this run.
Smaller documents and faster completion are measurable; a universal speedup is not.

With optional homepage stats delayed 1,500 ms (six samples each), median shell
TTFB remained 6.38 ms on main and 8.12 ms on Smolter, while completion took about
1,511 ms on both. Both stream the shell without waiting for optional stats.
Smolter still waits for the document to finish before hydration; this is not
progressive hydration, and TTFB alone does not measure time to interaction.

Three unthrottled Chromium homepage samples per build at 1280×720 used an otherwise
identical local proxy forcing no-store, collecting through one second after load
without scrolling. Instrumentation was prepended to the existing analytics script,
not inserted into the DOM. An earlier extra-head-script experiment disturbed
whole-document hydration; those samples were discarded as harness artifacts.

| Browser metric | Main | Smolter |
| --- | ---: | ---: |
| Observed JS encoded body bytes | 173,154 | 87,747 |
| Observed JS requests | 38 | 41 |
| Median DOMContentLoaded end | 175.1 ms | 93.4 ms |
| Median LCP (range) | 152 ms (148–152) | 164 ms (160–236) |
| Observed layout shift total | 0 | 0 |

Browser bytes reflect negotiated response compression, not uniformly gzip; include
all observed JS initiators, including modulepreload. Instrumentation contributes
a small symmetric overhead. There were no observed long tasks. This small local
sample is not field Core Web Vitals, INP, hydration timing, slow-device coverage or
a statistically reliable LCP improvement: LCP was worse and request count rose.

Platform's **all emitted** JS gzip-level-9 inventory under Node 26 is 438,227 bytes /
151 files on main versus 284,337 bytes / 126 files on Smolter: approximately 35%
smaller. This includes lazy output, not initial route transfer. Only Platform was
built for the main comparison. No CPU/RSS/load-throughput improvement is claimed.

For continuity with the older Node 22 compression report, compressing the new
production output with the same Node 22 gzip methodology gives these 0.3.3 → 0.3.4
totals: Platform 284,386 → 284,418 (+32), Admin 120,666 → 120,690 (+24), Embed
113,548 → 113,595 (+47), Remote 155,714 → 155,749 (+35), Cast 193,931 → 194,003
(+72), Tizen 156,890 → 156,934 (+44). Different zlib versions produce different
totals; do not compare these directly with the Node 26 main comparison above.

## 0.3.5 integration

All nine dependency pins and the lockfile use the published release, with npm
integrity verified. No local Smolter patch or router workaround was needed.
The 0.3.2 consumer fixes and deployment integration remain unchanged.

Platform's analytics bootstrap appends an externally owned script directly to
`head`; that script now has `data-smolter-preserve`. A focused bootstrap check
verified one append, the marker and the unchanged analytics domain. App-rendered
theme scripts, fonts, metadata and stylesheets are not marked. No server-side
head injection was found in the checked-in serving integration. Infrastructure
outside this repository was not inspected or changed. Future external direct
children of `head` must carry the marker; unmarked arbitrary injection is not
supported. Cast's sender SDK is appended after application hydration, and its
existing lifecycle is unchanged.

Node 26.8.1 / pnpm 12.3.4 frozen install, workspace lint/typechecking, all six
production web builds and browser-boundary checks passed. The eighteen focused
transport/recovery, cache, revalidation, framing and theme tests passed again.
Generated route asset manifests for all four SSR apps were checked against their
emitted files: every preload target exists, with no external package specifier
masquerading as a file. This does not establish a request-count improvement.

The browser recovery and performance results above belong to 0.3.4, not a fresh
0.3.5 browser benchmark. No new physical/native or browser hydration sign-off is
claimed. Progressive hydration remains unimplemented; TTFB/LCP/interactivity
limitations from the earlier report still apply.

Same Node 26 gzip-level-9 all-emitted-JS methodology as the 0.3.4 comparison:

| App | 0.3.4 | 0.3.5 | Delta |
| --- | ---: | ---: | ---: |
| Platform | 284,337 | 284,463 | +126 |
| Admin | 120,354 | 120,489 | +135 |
| Embed | 113,306 | 113,425 | +119 |
| Remote | 155,357 | 155,489 | +132 |
| Cast | 193,241 | 193,476 | +235 |
| Tizen | 155,883 | 156,002 | +119 |

Values are bytes, including lazy/legacy output rather than initial transfer.

## 0.4.0: Platform early hydration

Platform opts into `renderApplication(..., { earlyHydration: true })`. Its optional
homepage statistics/public rooms already return promises; no loader workaround
was needed. Transport endpoints, deployment options, asset bases and root setup
are unchanged. There was no nonce in the existing render options: the root can
read one from context, but the checked-in entry does not supply that context and
the application middleware only sets a frame-ancestors policy. This change does
not invent a nonce, weaken CSP or establish nonce-enforced consumer coverage.

Admin, Remote and Embed were evaluated separately: their current route loaders
await their data rather than returning nested deferred values. Early hydration
remains off for those apps, avoiding an unverified opt-in with no demonstrated
deferred-shell benefit. Their fixture document requests returned HTTP 200.
Cast and packaged Tizen have no SSR option added.

### New validation

All six production builds, browser-boundary checks, frozen installation,
workspace lint/typechecking and eighteen focused tests passed on Node 26.8.1 /
pnpm 12.3.4. Published npm integrity matches the lockfile:
`sha512-jhuqTKtAQ1aCK8IAt9kCJRrTnOMYJsFQcanuUWbEgP4k2eWo60dDvURb4h2VUzWFav3GUl6Vwxwo79qmfIvNZw==`.
No package patches, local aliases or copied router were added.

Local production browser checks used the real Settings UI, a fixture API and a
stream-preserving proxy. Marked external script/style nodes were inserted before
hydration. A MutationObserver measured successful Settings rendering; input
events and document load were recorded separately. Browser automation has
interaction overhead: these are observed successful times, not the earliest
possible hydration-readiness times.

| Scenario | Observed result |
| --- | --- |
| Stats delayed 4,000 ms | Settings appeared at 3,084.9 ms; input was entered at 3,317.9 ms, both while the document was loading. Load completed at 4,037.9 ms. Input survived completion. |
| Stats delayed 6,000 ms then HTTP 503 | Settings appeared at 3,079.3 ms; input at 3,308.3 ms. One profile PATCH succeeded around 3.45 s, followed by one root session/remote refresh, before load completed at 6,028.8 ms. Name and dialog survived. |
| Navigate to Security before six-second stats settle | Security rendered before completion and remained after the late stream finished; the homepage did not return. Settings still worked. The first attempt lacked a fixture SECURITY_EMAIL and correctly showed the route error; it passed after correcting fixture configuration. |
| Marked external head nodes | One script execution was recorded, and one script/style node remained after hydration, profile revalidation and navigation. Computed-style retention and frame-by-frame flash detection were not independently measured. |
| 0.3.5 baseline, same six-second delay | The pre-completion Settings click did nothing; the dialog was still absent after completion. A second click after load worked. |

Fixture logs showed one initial stats/public-rooms request per tested document,
not a duplicate hydration loader request. The profile test issued one PATCH, not
a replay. Vibes converts provider errors to null, so the HTTP 503 case validates
its unavailable-data path, not an arbitrary rejected-promise boundary. Broader
concurrent fetcher and bootstrap-recovery mutation combinations remain untested.

### Fresh performance comparison: 0.3.5 versus 0.4.0

Baseline commit `39144cf3e01f8b7707436fbca13bb9a8aeaf7fce` was built in an isolated
checkout using the same Node 26.8.1 runtime, production configuration and fixture
API. Thirty alternating samples per route after five warmups, direct app ports,
gzip, keep-alive, concurrency one. TTFB is first body byte, excluding Early Hints.

| Route | 0.3.5 median / p95 TTFB ms | 0.4.0 median / p95 TTFB ms | Median completion ms, before / after | Document gzip bytes, before / after |
| --- | ---: | ---: | ---: | ---: |
| `/` | 3.27 / 4.34 | 3.19 / 5.40 | 4.34 / 4.34 | 9,844 / 10,006 |
| `/privacy-policy` | 1.96 / 2.51 | 1.93 / 3.34 | 2.09 / 2.07 | 7,816 / 7,597 |
| Empty fixture room | 4.68 / 6.03 | 4.70 / 5.65 | 4.85 / 4.75 | 4,494 / 4,313 |

With stats delayed 1,500 ms, six samples each: median shell TTFB was 5.20 → 7.41 ms,
completion 1,509.97 → 1,510.54 ms. No TTFB improvement is established. The important
new benefit is the observed pre-completion interaction, not faster HTTP completion.

Three unthrottled local homepage browser samples per build, no-store proxy,
observed through one second after load without scrolling:

| Metric | 0.3.5 | 0.4.0 |
| --- | ---: | ---: |
| JS requests / encoded body bytes | 41 / 87,886 | 41 / 88,171 |
| Stylesheet requests / encoded body bytes | 1 / 17,336 | 1 / 17,336 |
| Median DOMContentLoaded end | 121.8 ms | 138.9 ms |
| Median LCP (range) | 184 ms (152–284) | 228 ms (192–336) |
| Observed layout shift total | 0 | 0 |

Compression was browser-negotiated, not uniformly gzip. Instrumentation was added
to the existing analytics asset for these samples. No console errors were captured
in the candidate measurement tab. These small samples do not establish a reliable
LCP regression or improvement. There is no demonstrated request-count reduction.
Cold/warm HTTP-cache comparisons, realistic latency/CPU throttling and causal
dependency-chain analysis remain outstanding; resource timing alone does not prove
the longest serial chain or required-code readiness.

### CSS hints and build inventories

Every generated JS/CSS route-manifest target exists. All four current SSR route
manifests have zero `styles` entries: Vibes uses root-level stylesheet URL imports.
Consequently no new route-CSS preload benefit was observed. Existing homepage CSS
downloaded once in each sample. Separate-origin CSS preload reuse/CORS matching
was not freshly exercised; do not transfer upstream fixture results to Vibes.

Platform's fresh baseline/candidate all-JS gzip-level-9 inventories were
284,481 → 284,811 bytes, 126 files each; CSS remained 21,618 bytes in one file.
The fresh baseline differs slightly from the prior saved inventory due to build
identity/compression effects. Against the saved 0.3.5 inventories, all-app JS totals:

| App | 0.3.5 saved | 0.4.0 | Delta |
| --- | ---: | ---: | ---: |
| Platform | 284,463 | 284,811 | +348 |
| Admin | 120,489 | 120,825 | +336 |
| Embed | 113,425 | 113,763 | +338 |
| Remote | 155,489 | 155,814 | +325 |
| Cast | 193,476 | 194,127 | +651 |
| Tizen | 156,002 | 156,339 | +337 |

All-emitted totals include lazy/legacy output, not initial transfers. Earlier
0.3.4/main benchmarks and recovery browser checks remain historical evidence.
The nonce-enforced, separate-CDN, full recovery/browser, Admin auth and Tizen
hash-flow matrices have not all been freshly repeated on 0.4.0. No physical or
native parity sign-off is implied. Keep this PR draft.

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
