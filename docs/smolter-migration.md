# Smolter integration review

## Published 0.4.4 pre-merge validation

All nine Smolter declarations and the lockfile now resolve published 0.4.4.
The version-specific release-age exception was updated; native patches remain
unchanged. Frozen installation passes and lockfile integrity matches npm.
No local Smolter patch, copied router or source alias was introduced. Vibes
does not use the removed React resource-router or public safeWrapAsync exports.
Scoped transports, deployment bootstrap, streaming and existing Preact entries
remain unchanged.

Fresh validation: six production builds (Platform, Admin, Remote, Embed, Cast,
Tizen), workspace lint/typechecking, 20 transport/recovery tests, three theme
tests, one framing test, one packaged-Tizen test and 12 repository regressions.
The Cast sender now delegates session lifecycle to Google's CastContext, uses
the CAF sender types, preserves its injected SDK script and retries failed
owned script loads. A mocked SDK regression covers discovery, connect, resume,
disconnect and listener cleanup; it does not establish physical Cast playback.

The mobile landing redesign and shared first-render safe-area handling are
included, alongside passwordless-room saved-credential cleanup. iOS 0.7.0 (94)
was uploaded to TestFlight before this web dependency upgrade. No Android build
was published. Device verification of the layout fix remains outstanding.
Earlier browser timings and recovery scenarios below are historical evidence,
not new 0.4.4 measurements. Physical devices, paired playback and live queue
reconnects have not received a fresh sign-off in this pass.

## Live rooms SSR follow-up

Live rooms now resolves in the server loader and renders cards directly in the
initial HTML; only optional statistics remains deferred. Requests still start
in parallel. The existing public-request cache retains successful room lists for
10 seconds per API origin and Music/Watch mode, in each server process. It shares
concurrent reads, isolates reader cancellation and does not cache errors. No
cookies, private room details or complete documents are cached by this change.
Cold requests wait for the rooms API; warm requests may show counts up to ten
seconds old. Empty-room filtering and unavailable/empty states remain intact.

Validation: workspace lint/typechecking, Platform production build and three
cache regressions pass. Production HTML contains the fixture room card without
running JavaScript. Consecutive Music requests reused one rooms read; Watch
issued its own read and did not display the Music fixture. With optional stats
delayed 1,500 ms, one local request had 7.7 ms TTFB and 1,510 ms completion;
this confirms stats remains deferred, not a general performance benchmark.

## Resource routes, shared headers and native structure

- `resources.recents` now owns `/resources/recents`; remembered-room storage,
  eligibility, playback reads, dismissal and 30-second refresh remain unchanged.
- `resources.remotes` replaces the action-only `/remote-control` URL with
  `/resources/remotes`. It has no UI component, manual ID/path or legacy alias.
  Enable/update/delete behavior, abort signals and revalidation are retained.
  Robots already excludes the entire `/resources/` prefix.
- Shared header, brand and navigation snapshots now animate geometry rather
  than popping between layouts. Native same-origin cross-document transitions
  cover Platform/Remote handoffs; ordinary content still fades and reduced
  motion disables animations. Cross-origin localhost ports cannot share snapshots.
- Mobile uses only Expo Router's `src/app`, composing components directly.
  Android TV retains Expo's registered root and single-screen flow. Both native
  targets use named `src/requests` functions, not loader/action route trees.
  Samsung Tizen retains its separate Smolter DOM routes. No request behavior,
  storage key, native navigation semantics or dependency was changed.
- AGENTS and the frontend skill now specify plural one-word DOM resource names.
  Existing profile resources (`resources.profile`, `admin.resources.profile`,
  `remotes.resources.profile`) and `resources.root` do not follow that naming
  convention; they are reported here, not mechanically renamed. The hosted TV
  player is a navigable document, not a shared application data action.

Validation for this change: workspace lint/typechecking, Mobile validation,
TV validation (including Tizen production packaging/test), Platform and Remote
production builds, 13 resource/reminder/navigation tests and two native
structure/deep-link tests. A single-origin production browser fixture observed
non-skipped `pageswap`/`pagereveal` transitions in both Platform/Remote directions;
the hydrated Settings control remained usable. No physical native/device sign-off
or release was performed. PR #413 remains draft.

Header follow-up: outgoing header, brand and navigation snapshots now crossfade
for 220 ms while their geometry animates, instead of becoming transparent on
the first frame. Two regression tests cover snapshot styles and reduced-motion
opt-out. Workspace lint/typechecking and both production builds pass. The
single-origin browser check completed transitions in both directions and
confirmed the emitted animation styles. One initial forward navigation was
skipped by Chromium with `ViewTransition opt-in disabled`; subsequent forward
and return navigations completed. Cold-cache transition reliability and
frame-by-frame visual continuity are not signed off by this check.

## Fresh 0.4.2 integration and validation

This section supersedes version-specific statements below; earlier sections are
historical evidence, not newly repeated browser sign-off. PR #413 remains draft.
Release: https://github.com/kasperrt/smolter/releases/tag/v0.4.2.
Upstream fix: https://github.com/kasperrt/smolter/pull/21.

### Dependency and consumer changes

All nine declarations resolve the published 0.4.2 package. Frozen installation
passes with pnpm 12.3.4 and Node 26.8.1. Registry tarball SHA-512, lockfile and
release integrity agree:

```text
sha512-5IU94gut76HFeX2OFsR1xa9MYoXjpNdzUcBf6Y4DLY3cVt9dWrkRyl9A08zHLgevy4gHycS0vT/maR5mNV4ZXg==
```

Preact remains 11.0.1 and preact-render-to-string 6.8.1. No Smolter patch, local
source alias, copied router or monkey patch was added. Native patches remain.

- Migrated both deferred homepage boundaries, `CommunityStats` and
  `PublicRoomDiscovery`, from outer native Suspense to `Await fallback`.
  Existing error/null handling is retained. No other deferred Await boundaries
  were found in route or persistent-root application components.
- Platform retains early hydration; other SSR applications remain unchanged.
- Removed file-route `id`/`routePath` overrides and redundant server-entry path
  mapping. Manual Cast/Tizen route configuration remains intact.
- Renamed resource folders to `robots[.]txt`, `llms[.]txt`, `sitemap[.]xml` and
  `[.]well-known.security[.]txt`. Their public URLs do not change. The unlisted
  TV resource keeps its existing path and no longer exports a path override.
- Layout/background selection uses the public router snapshot's matched path,
  rather than IDs absent from generated routes. Room chrome, policy navigation
  and backgrounds retain their intended scope.
- Scoped transport, bootstrap recovery, loader reasons, Tizen form parsing,
  profile URL normalization, Admin logout, root CSS links, CDN asset URLs and
  private/no-store integration were preserved.

### Newly exercised production behavior

Tests used minified production Platform builds and local fixture APIs only.
No production data or infrastructure was accessed.

- With stats delayed eight seconds, Settings opened and profile input was
  editable while the document was still loading. Successful settlement retained
  input and focus; no duplicate initial stats/public-room requests were logged.
- With stats returning HTTP 503 after eight seconds, Settings opened at 216.3ms,
  profile input occurred at 449.2ms, and document completion occurred at 8030ms.
  One profile PATCH and one subsequent root refresh occurred. Dialog and saved
  input survived; optional homepage requests were not repeated by the mutation.
  These are single-sample observed interaction times, not minimum readiness.
- Public rooms settled at three seconds while stats remained pending until
  eight seconds, then the reverse order was tested. Each resolved boundary
  removed its fallback without replacing the other boundary.
- Navigation to Terms before document completion removed both homepage heading
  and optional sections. Late data did not restore them. Back restored the
  homepage and Forward removed it again. The initial Back assertion timed out
  before the delayed loader finished; eventual correctness passed, not a claim
  that Back renders before optional client-navigation data completes.
- A marked head script executed once. Marked head style remained and its CSS
  custom property computed to the expected value during streaming.
- The four dotted resource URLs returned HTTP 200 with text/plain or
  application/xml as appropriate, after supplying fixture security contact and
  expiry settings. Generated-route tests verify each exact path and loader.

Workspace lint/typechecking and all six web production builds pass, including
browser-boundary checks. Twenty-seven focused transport, cache, recovery,
revalidation and navigation tests pass; eleven production-route/resource tests
pass. Four new recovery cases cover a completed page action overlapping two
fetchers: first fetcher completion, failure, disposal and watcher replacement.
All preserve the second submission's protection, execute each mutation once,
leave the marker unused while protected, and allow later query/hash recovery.
These are deterministic public-API tests, not a combined streaming-browser
recovery sign-off.

### Size and timing

Same Node/pnpm, build command, minification and gzip level 9; sum of individually
compressed emitted JavaScript files. Both builds include the same pre-existing,
unfinished local Cast refactor, excluded from this integration commit. These
are working-tree comparison inventories, not clean-commit initial transfers.

| App | 0.4.1 JS gzip bytes | 0.4.2 JS gzip bytes | Delta |
| --- | ---: | ---: | ---: |
| Platform | 283995 | 283332 | -663 |
| Admin | 122694 | 122736 | +42 |
| Embed | 113824 | 113977 | +153 |
| Remote | 155969 | 155980 | +11 |
| Cast | 194215 | 194654 | +439 |
| Tizen | 156391 | 156632 | +241 |

Local HTTP, warm process, uncompressed document, three sequential samples:

| 0.4.2 fixture | Shell TTFB ms | Completion ms | Document bytes |
| --- | --- | --- | ---: |
| No optional delay | 4.884, 4.554, 3.261 | 5.899, 5.576, 4.330 | 37660 |
| Stats delayed 1500ms | 19.199, 3.762, 3.929 | 1510.268, 1505.380, 1508.637 | 37660 |

The shell does not wait 1500ms for stats. No matched 0.4.1 HTTP/browser timing
baseline was rerun, so this does not establish a TTFB improvement. Initial-route
JS/CSS transfer, fresh request counts, causal waterfall, LCP, CLS, cold-cache and
throttled multi-sample comparisons remain unmeasured in this run. Total emitted
JS is not initial-route transfer and includes lazy/legacy chunks. No performance
claim versus React Router or wouter is made.

### Concrete upstream feedback

1. Generated file routes have no ID while `useMatches()` derives IDs from
   `route.id` and otherwise returns an empty string. A component matching the
   former explicit file ID stops recognizing its route after required override
   removal. Vibes now uses matched paths. Upstream should document a stable
   generated identity contract or expose the matched pattern directly through
   an appropriate hook; no runtime route registry is needed in Vibes.
2. Ordinary errors in loader-only document resources become HTTP 200 JSON.
   Minimal public-API reproduction on published 0.4.2:

   ```js
   import { dispatchRoute } from '@kasperrt/smolter/preact/server';
   const response = await dispatchRoute(
     new Request('http://localhost/probe.txt'),
     [{ path: '/probe.txt', loader() { throw new Error('fixture failure'); } }],
     true,
   );
   console.log(response.status, await response.text());
   // 200 {"__routeError":{"message":"fixture failure"}}
   ```

   Expected: non-success HTTP status for a failed document resource (normally
   500). This also occurs with the final argument false; distinguish an
   intentional transport envelope from public document HTTP semantics. Vibes
   reproduced it through security.txt with a missing fixture expiry setting.
   Supplying the setting fixes the fixture, not the upstream error-status path.

### Limitations and remaining checks

Native Preact streamed Suspense remains an upstream limitation. The supported
integration is `Await fallback`; JavaScript is required to replace early HTML
fallbacks. The default deferred deadline remains a total 30 seconds, unchanged.

An abrupt socket-cut attempt produced the test browser's incomplete-response
error page, preventing a meaningful mounted-state deadline assertion. It is not
a passing interrupted-stream test or an attributed Smolter defect. Nested and
persistent-root deferred fixtures, arbitrary rejected promises (distinct from
API errors converted to null), combined pending-stream/history/manifest races,
and frame-by-frame flash detection remain unverified. Admin authentication and
Tizen hash flows retain historical evidence only in this run.

Physical Cast/Samsung, native parity, camera pairing, paired playback, live
queue reconnects and the Mobile AppProvider stale-room race remain separate
open work. The unfinished local Cast SDK refactor is not shipped by this commit.

This supplements draft PR #413. It is not a ten-pass or physical-device sign-off.
The integration uses the published [0.4.1 release](https://github.com/kasperrt/smolter/releases/tag/v0.4.1)
including [fetcher recovery ownership](https://github.com/kasperrt/smolter/pull/20)
and [early hydration and asset hints](https://github.com/kasperrt/smolter/pull/16), retaining
the 0.3.2 integration from [upstream PR #12](https://github.com/kasperrt/smolter/pull/12).

## Runtime boundaries

- Platform, Admin, Remote and Embed use Preact SSR through the shared Express host.
- Cast uses its browser receiver entry; Samsung Tizen uses a packaged hash-routed browser entry.
- Mobile retains Expo Router. Android TV retains Expo's registered root/session flow.
- Server handlers stay in server-only route modules. Vite's browser inventory rejects server modules and React DOM/React Router runtimes.

## Changes

- All nine Smolter dependency declarations and the lockfile resolve published 0.4.1. The temporary 0.3.1 patch and patch registration are removed; unrelated native patches remain. There are no Smolter local-source links, aliases or monkey patches.
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

## 0.4.1 consumer validation

Starting consumer commit: `fb32ff6fb473549dfdde0ddc0408a2c3bf6a03ec`.
Only dependency pins, release-age allowance, lockfile, regression tests and
documentation changed. Platform retains early hydration. Scoped transports,
bootstrap recovery, loader reasons, Tizen parsing/hash routing, profile URL
normalization, Admin logout, streaming/cache policy and asset URLs are unchanged.
No nonce was invented, CSS restructured, or additional SSR app opted into early
hydration. The root stylesheet still uses its existing rendered link.

### Dependency and normal checks

- Node 26.8.1, pnpm 12.3.4, Preact 11.0.1, preact-render-to-string 6.8.1.
- Frozen install, workspace lint/typechecking and all six production builds pass.
- Twenty focused tests pass: sixteen transport/cache/revalidation/deployment
  tests (including the deployment parent), three theme tests and one framing test.
- The downloaded npm tarball, npm metadata and lockfile agree on integrity:
  `sha512-Ftmt9ZqfytDf1Ey3IW/I3bJ+rDdlFSAdqlwWLB7vjmrFS4SXOnufk/vJcc+QV7mcOzYc10xhux8FnucWvRIjQg==`.
- All nine installed references resolve to the registry-backed 0.4.1 store.
  No Smolter patches, source links, internal imports or copied routers were added.
- Generated SSR route manifests contain 676 asset references; every target exists.
  Browser boundary checks ran as part of the production builds.

### Repeatable recovery regressions

`packages/serve/src/deployment.test.ts` adds two public-API tests. Both fail with
a separately installed published 0.4.0 and pass with published 0.4.1:

1. An active chunk failure starts a deferred manifest check. Two fetchers created
   after watcher installation submit independent actions and both complete before
   the newer manifest resolves. Each action runs once; no reload or marker occurs.
   The failed route explicitly disables action revalidation so this tests the old
   check, not a fresh chunk failure caused by another loader invocation.
2. Two fetchers submit; the first completes while the second remains pending.
   Navigation to `/security?pending=true#scope` completes without recovery or
   marker consumption. Once the second settles, a later navigation recovers to
   `/terms-of-service?settled=true#terms` exactly once; both actions ran once.

Each subtest now gets its own simulated browser EventTarget. Production entries
still use `mountApplication(..., { deployment })`, which installs tracking before
rendered components create fetchers. No consumer watcher-order workaround exists.

### Fresh browser evidence

Production Platform used a local fixture API, with optional statistics delayed
eight seconds. Settings opened at 3,101 ms and profile input occurred at
3,330.5 ms, both while the document was loading. One profile PATCH and one root
refresh occurred before completion at 8,085.4 ms. Statistics/public-room reads
were not duplicated. Security navigation before settlement retained Security
after completion; the homepage heading and statistics region were absent.
Marked head script/style nodes remained; no console errors were recorded in that
Vibes run. These timings include automation overhead, not earliest readiness.

A separate minified production fixture used public `renderApplication`,
`mountApplication`, `serverRoute`, `useFetcher` and the Node request handler.
It had a twenty-second deferred value, real HTTP fixture actions and an eight-
second manifest delay (explicit fifteen-second watcher timeout). Reloads were
observed through the public reload callback, not executed as document reloads:

- Both fetcher actions completed at 5,120 ms while loading; the older recovery
  check produced no callback. Input survived completion. A later navigation
  invoked recovery for `/destination?settled=1#latest`.
- With the second action delayed fifteen seconds, navigation completed at
  11,316 ms while loading with no recovery. The second action finished at
  18,106.7 ms while loading. A later recovery retained the query/hash destination.
- Each scenario's server log recorded one invocation per independent action.

This is isolated browser coverage plus a real Vibes profile/streaming check,
not a claim that two real product mutations were exercised concurrently in Vibes.
The deterministic tests assert marker state directly; the browser fixture
verified later recovery eligibility instead of inspecting storage internals.

### Upstream investigation: abandoned Suspense fallback

The isolated fixture exposes a separate early-hydration cleanup issue. After
navigating away before the deferred value settles, `Optional data pending`
remains beside the new destination, even after document completion. Removing
deployment watching and submitting no mutations still reproduces it. The DOM
contains the new destination followed by an orphaned `$s` comment and fallback
paragraph. The old page does not replace the destination, but stale fallback
content survives. This was **not reproduced in the real Vibes homepage → Security
flow**; do not describe it as a confirmed Vibes visual regression.

Reproduction shape for upstream, requiring no private fixture API:

1. Render a whole-document Preact root with `<main><NavigateButton /><Outlet /></main>`
   and `<Scripts />`, using `renderApplication(..., { earlyHydration: true })`.
2. `/` returns `{ optional: new Promise(resolve => setTimeout(() => resolve('done'), 20000)) }`.
3. Its component renders `<Suspense fallback={<p>Optional data pending</p>}><Await
   resolve={data.optional}>{value => <p>{value}</p>}</Await></Suspense>`.
4. `/destination` renders `<h2>Destination ready</h2>`.
5. Mount through the public `mountApplication`; click a real root button calling
   `router.navigate('/destination?pending=1#scope')` before twenty seconds.
6. After completion, require the destination heading and zero old fallback
   paragraphs. The fixture currently retains a fallback paragraph after the heading.

Do not patch this inside Vibes. Upstream should add a regression asserting removal
of old fallback nodes, not only the presence of the new destination.

### Matched performance comparison

Platform 0.4.0 was freshly built from the starting commit in an isolated worktree,
with the same runtime, fixtures and build settings. HTTP measurements used gzip,
keep-alive, serial alternating requests, five warmups then thirty samples per
route/version; the delayed case used six samples. Values below are median ms:

| Route | 0.4.0 shell TTFB | 0.4.1 shell TTFB | 0.4.0 completion | 0.4.1 completion |
| --- | ---: | ---: | ---: | ---: |
| Homepage | 5.89 | 6.17 | 8.66 | 9.47 |
| Privacy | 8.37 | 6.04 | 10.06 | 7.89 |
| Empty fixture room | 7.46 | 7.95 | 7.58 | 8.18 |
| Homepage +1,500 ms stats delay | 5.65 | 6.75 | 1,510.72 | 1,512.49 |

There is no demonstrated TTFB improvement. Local variation is substantial:
homepage TTFB p95 was 10.13 versus 18.57 ms. No production latency claim follows.

Three unthrottled browser loads per version, with proxy `no-store` responses:

| Metric | 0.4.0 | 0.4.1 |
| --- | ---: | ---: |
| JavaScript requests | 41 | 41 |
| Encoded JS body bytes | 88,200 | 88,249 |
| Stylesheet requests | 1 | 1 |
| Encoded CSS body bytes | 17,336 | 17,336 |
| Median LCP (range), ms | 296 (248–296) | 216 (212–296) |
| Observed CLS | 0 | 0 |
| Median final observed JS response end, ms | 237.5 | 193.3 |

These small samples do not establish an LCP improvement. Final JS response time
includes optional resources and is not required-code readiness or a causal serial
dependency chain. DOMContentLoaded is not used as hydration readiness. No warm
browser-cache or representative network/CPU-throttled results were collected.
The root CSS downloaded once; hints were not changed. Browser encoded sizes use
negotiated compression and measurement instrumentation, not the gzip inventory.

All-emitted JS, individual gzip level 9 under Node 26.8.1, compared with saved
0.4.0 inventories using the same script/settings:

| App | 0.4.0 JS gzip | 0.4.1 JS gzip | Delta | JS files | 0.4.1 CSS gzip |
| --- | ---: | ---: | ---: | ---: | ---: |
| Platform | 284,811 | 284,935 | +124 | 126 | 21,618 |
| Admin | 120,825 | 120,916 | +91 | 16 | 14,262 |
| Embed | 113,763 | 113,856 | +93 | 8 | 14,056 |
| Remote | 155,814 | 155,899 | +85 | 21 | 14,133 |
| Cast | 194,127 | 194,297 | +170 | 13 | 15,009 |
| Tizen | 156,339 | 156,419 | +80 | 3 | 5,762 |

Each app emits one CSS file. Inventories include lazy and legacy output, not
initial-route transfer. Build identities may move compressed sizes slightly.

### Still not freshly verified on 0.4.1

Bootstrap mutation overlap; Back/Forward with both stream and manifest pending;
root-only/fetcher-only chunk failures; interrupted streams/offline reconnection;
arbitrary rejected deferred promises reaching their boundary; separate CDN origins
and customized app bases; complete Admin/Tizen browser regressions; native and
physical-device parity. Earlier results remain historical, not new sign-off.
The possible Mobile AppProvider stale-room race remains unresolved. Keep #413 draft.

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

## Legacy cleanup and shared-element transitions

Removed the unused `/explore/rooms`, `/discover/:topic`, and old
`/discovery/:topic` redirect routes. Existing bookmarks to those retired aliases
no longer redirect; current links use `/rooms/explore` and the explicit
`/discovery/*` pages. Shared discovery components and hooks now live outside
route directories. Removed unused v2 `playlist-items` API declarations; v3
`items` remains the application contract.

Cast sender, receiver and emulator payloads now use `PlaylistItem`, including
`publisher`, directly. The sender passes the original item rather than
reconstructing it from SDK metadata, preserving queue identity and metadata.
Removed the old `Song` schema and artist/publisher conversion. Google Cast SDK
metadata still uses its required artist field. Old already-running receivers
must restart when deploying this wire-contract change. Chrome 80 build support
remains intentional and is unrelated to the retired payload shape.

Policy pages match hero, policy navigation, contents and document regions by
view-transition name. Shared regions animate geometry instead of fading the
whole page; reduced motion disables their animation. Browser checks on a local
production build covered Privacy → Terms → Security, computed transition names,
disabled root fade, and absence of console errors. Physical Cast hardware and
frame-by-frame visual timing have not been signed off by these checks.

Shared dialogs now retain their portal during exit; lazy parent boundaries
propagate removal to the modal's presence boundary. Room settings also has an
exit animation and a parent presence boundary. No new animation dependency was
added. Room-name suggestions remain an active `/rooms/create` loader intent;
there is no `resources.room-suggest` route in this checkout.

Local production browser checks confirmed close-time DOM retention followed by
removal for Personal Settings, room settings, sharing and Cast to Device.
Personal Settings and Cast restored trigger focus and cleared the body scroll
lock after exit. Policy browser Back and section hash navigation also worked.
Workspace lint/typechecking, all six web production builds, five Cast/reminder
unit tests and five TV player resource tests passed. These tests do not establish
physical device playback parity.

## 0.4.5-beta.1 local evaluation — 18 October 2026

Status: blocked for adoption by a published Vite analyzer incompatibility. These
results are new local evidence, not a production or device sign-off.

Baseline commit: `3f0b100dd860fa0419d4d5589a7b466c66e1607b`, Smolter 0.4.4.
Runtime: Node 26.8.1, pnpm 12.3.4, TypeScript 7.0.2, Vite 8.3.4,
Preact 11.0.1 and preact-render-to-string 6.8.1.

All nine dependency declarations and the lockfile now use the published exact
beta locally. npm reports `beta: 0.4.5-beta.1`, `latest: 0.4.4`. Registry integrity
matches the lockfile:

```text
sha512-OkLa2EOSAcgobO8lJEo19teCJ8uV6u6D/bw5yxfwVGUH7jJf24OK3iIXfMBcYRazX/46zTA9es1oEUmCXJ+FMA==
```

Platform explicitly retains `dataEndpoint: '/_smolter'` in applicationPlugins;
the other existing scoped endpoints remain unchanged. No product data-prefetch
opt-in or suffix-transport migration was made. Native patches remain intact;
no Smolter patch, source alias, copied router or compiler downgrade was added.
The release-age exception includes the beta and retains the previous stable
exception so pnpm can validate existing lock entries during upgrades.

### Blocking upstream reproduction

All six stable production builds pass. With the beta, Platform, Admin, Remote,
Embed, Cast and Tizen production builds fail in the published
`dist/vite/prefetch-analysis.js:33`:

```text
TypeError: Cannot read properties of undefined (reading 'fileExists')
const configPath = ts.findConfigFile(root, ts.sys.fileExists);
```

The declared TypeScript peer range is `>=5.4`, which accepts this repository's
7.0.2. That package resolves to `typescript/lib/version.cjs` and does not expose
`sys`, `createProgram` or `createSourceFile`. Reproduce without application code:

```sh
node --input-type=module -e 'import {createRequire} from "node:module"; const r=createRequire(import.meta.resolve("@kasperrt/smolter/preact/vite")); const ts=r("typescript"); console.log({resolved:r.resolve("typescript"),version:ts.version,sys:typeof ts.sys,createProgram:typeof ts.createProgram,createSourceFile:typeof ts.createSourceFile});'
```

Upstream should make the build-only analyzer independent of an incompatible
host compiler API, or support the current API explicitly. A conservative
fallback must retain capabilities rather than remove required code. Packed
consumer tests should include TypeScript 7; peer declarations must match actual
support. Vibes has not worked around this defect.

### Newly verified checks

- Frozen installation, workspace lint, workspace typechecking and diff whitespace checks pass.
- `pnpm --filter @vibes/serve test:transport`: 35 passing tests.
- Eight new prefetch tests cover deduplication, consume-once reuse, root/action
  exclusion, mutation/fetcher/revalidation invalidation, failure/redirect retry,
  16-entry eviction, 30-second expiry and disposal cancellation.
- Six new granular-manifest cases cover unchanged destinations after unrelated
  changes, changed destinations/shared dependencies, missing metadata, legacy
  metadata and missing-chunk cache bypass. Query/hash intent is retained.
- A one-origin Express fixture verifies suffix/legacy coexistence across four
  application mounts, trailing slashes, resource paths, duplicate query keys,
  GET/POST/PATCH/DELETE bodies, cookies, fixture authorization and no-store data
  responses. This is not a fresh real Admin authentication browser test.
- Existing recovery coverage remains passing, including speculative failures,
  overlapping navigation, Back/Forward, initial chunks, concurrent fetchers,
  mutation ownership and non-replay. These use controlled public-API fixtures.
- Three theme tests, one framing test and three public-room-cache tests pass.

### Limits and next steps

The beta has no successful production build, so no matched beta bundle delta,
initial-transfer measurement, LCP, interaction readiness or navigation timing
can be reported. Stable build inventories were saved using the existing bundle
report script; upstream size numbers are not substituted for consumer results.

After an upstream fix, repeat six builds and production browser tests for
intent/viewport links, typed spreads, HMR, actual generated fingerprints from
two builds, streaming/recovery overlap, app auth and pagination, CDN/CSP/styles
and per-application suffix hosting. None of those browser scenarios is signed
off by the deterministic tests above. Physical devices and native parity remain
untested. Temporary fixture servers and the baseline browser tab were stopped;
existing development processes were preserved. Changes remain local, uncommitted;
nothing was merged, deployed or published.

## 0.4.5-beta.3 local evaluation — 18 October 2026

This supersedes the beta.1 build blocker, but is not release approval. The
branch remains local and uncommitted on baseline commit
`3f0b100dd860fa0419d4d5589a7b466c66e1607b`; no PR exists for this local beta branch.

All nine declarations and the lockfile use exact npm `0.4.5-beta.3`. npm's beta
tag matches; latest remains 0.4.4. Registry and lockfile integrity agree:

```text
sha512-1igNMvhy1yFI6VpSfcyqm3N0IFz2ThQW9+zB3aiPObFCJwO4B+tRUCV4PxNk/02YbwG27Cua1pK/zYuQ5WFYJA==
```

Node 26.8.1, pnpm 12.3.4, Vite 8.3.4, Preact 11.0.1 and renderer 6.8.1
remain unchanged. Host TypeScript stays 7.0.2; Smolter resolves its own
`typescript-compiler` alias to 6.0.3 with the compiler API present. No local
Smolter modifications, compiler overrides or native-patch changes were made.
Existing explicit data endpoints are retained. Suffix requests are tested in
the adapter fixture, not enabled for production browser generation.

### Results

- Frozen installation passes. All six production builds pass, including Cast
  legacy output and Tizen classic-script preparation.
- Workspace lint/typechecking pass after aligning test syntax with the existing
  TypeScript library target. API boundary checks pass.
- Transport suite: 34 passes and one failing child regression (the Node runner
  reports 36 tests, 34 pass, 2 fail because its parent also fails).
- Theme (3), framing (1) and public-room cache (3) tests pass.
- Browser-manifest targets and import references exist for Platform (213),
  Admin (38), Remote (44) and Embed (29). Cast/Tizen do not emit that same Vite
  inventory. Browser-output scans found no compiler API, Node filesystem or
  server telemetry signatures; this is not proof against every possible leak.
- New nonblocking gate test verifies route work completes before releasing a
  manifest promise, the late response does not reload, and the next eligible
  navigation recovers. Failed/offline/unchanged routine checks remain throttled.
- Existing public-API tests retain prefetch caching, scoped/suffix transport,
  mutation non-replay, concurrent fetcher ownership, initial recovery and
  overlapping navigation coverage. Assertions requiring first-navigation
  reloads were updated to the documented background-check semantics, not
  removed wholesale.

### Confirmed regression: action redirect chunk recovery

Minimal public-API sequence, with window as EventTarget, location at
`http://localhost/admin`, a Map-backed sessionStorage, and fetch returning
`Response.json({version: 'new'})`:

1. Create a data router with `/admin` action returning HTTP 303 to
   `/admin/users?created=1#user`.
2. Give `/admin/users` a loader that dispatches `vite:preloadError`, then
   rejects with `TypeError('Missing redirect chunk')`.
3. Register a root revalidator counting calls.
4. Install `watchDeployment` with version `old`, manifestURL
   `/smolter-manifest.json`, and a reload observer.
5. Await `router.submit('/admin', new FormData())`, then wait 100 ms.

Both versions execute one mutation, one root refresh and one manifest request.
Stable 0.4.4 reloads to the redirect destination and consumes one recovery
marker. Beta.3 performs zero reloads and consumes zero markers; the router is
idle at the redirect destination. The standalone reproduction removes test
suite cross-contamination as an explanation. This is a deterministic package
regression, not yet a real Admin-login browser reproduction. Do not repair it
with a Vibes router wrapper; retain the failing regression for upstream.

### Production browser observations

Actual Platform production output was served through a localhost proxy and
fixture API. A second temporary Platform build used the public deployment
`timeout: 60000` option so an explicit held gate could not pass by hitting the
default two-second timeout. This option was reverted from source; no package
code was patched. Size measurements below use the ordinary, unmodified build.

- Privacy to Security renders while the manifest response remains held.
  Security data and manifest requests started in the same logged millisecond.
- Settings becomes interactive and a typed display name survives releasing a
  newer/incompatible manifest. No late document reload occurs. The next Terms
  navigation makes one document request, as expected for known incompatibility.
- Same-document Back to Privacy and Forward to Security finish while the gate
  is held. One manifest request is shared; no document requests occur.
- Keyboard-focus intent prefetch of Security receives a controlled chunk 404.
  It causes no manifest request and no navigation. After restoring asset
  availability, the first committed click causes one manifest request and one
  document recovery to Security. No second click is needed. The route error
  screen is briefly observable before recovery; absence of visual flashes is
  therefore not signed off.
- No hydration errors were observed in these flows. Localhost analytics warnings
  were present. Modal opening/closing requires waiting for its asynchronous
  mount/exit before targeting underlying controls; premature clicks in the
  automation were not treated as routing failures.

### Matched measurements

The comparison baseline is 0.4.4, not beta.2. Same consumer commit, Node,
pnpm, production build configuration and local API URL; gzip level 9 through
the existing bundle inventory script. Totals sum separately compressed emitted
JS files, including lazy/legacy assets, and are not initial-route transfer:

| App | 0.4.4 JS gzip bytes | Beta.3 | Delta |
| --- | ---: | ---: | ---: |
| Platform | 274988 | 276458 | +1470 |
| Admin | 106773 | 107554 | +781 |
| Remote | 140373 | 141154 | +781 |
| Embed | 98087 | 98553 | +466 |
| Cast | 160312 | 161002 | +690 |
| Tizen | 139492 | 140085 | +593 |

A separate public-router API benchmark used 20 runs per version, one new
router per run, an identical 100 ms delayed unchanged manifest and a trivial
destination loader. Stable median navigation completion was 102.88 ms versus
0.23 ms on beta.3; median loader start was 102.86 versus 0.22 ms. These are
Node API timings, not browser paint, interaction, LCP or network-transfer
measurements. Browser gate observations establish real consumer progress while
pending but are not a statistical latency comparison.

Initial-route transfer, matched browser interaction latency, LCP/CLS, detailed
visual flashes, full production auth/mutation recovery, all initial/offline
chunk scenarios, separate CDN/prefix recovery and HMR are not newly signed off.
No native simulator, physical-device or playback parity claim is made.
Temporary servers and browser tabs were closed. The test-only timeout was
removed and Platform rebuilt with its ordinary deployment options. Existing
development processes and unrelated backend changes were left untouched.

## Published 0.4.5-beta.4 consumer validation

The existing uncommitted beta integration was upgraded from beta.3 to exact
`0.4.5-beta.4` in all nine declarations and the pnpm lockfile. The narrowly
scoped release-age exception includes the requested beta. Native patches and
TypeScript 7.0.2 are unchanged. No Smolter patch, local source alias, compiler
override, router wrapper or recovery workaround was added.

Node 26.8.1 and pnpm 12.3.4 were used. npm reports beta.4 on `beta` and 0.4.4
on `latest`. Downloading the registry tarball and hashing it with SHA-512
produced the same integrity as npm and the lockfile:

```text
sha512-CvbwvhDXyfA9zU7zIBclfRJQcSNyU8kVqAe+wKE7onIMP030Fegll7NpbMF4LFtdF52fhdfnCO7QM2vWD0aviA==
```

Frozen installation, workspace lint/typechecking, all six production builds,
theme tests (3), framing tests (1), and the transport/recovery/prefetch suite
(45 tests) pass. Cast retains legacy output and Tizen retains classic-script
packaging. Generated manifest targets/import references were checked for
Platform, Admin, Remote and Embed. Browser-output scans found no compiler API,
Node filesystem or server telemetry signatures; this remains a bounded scan,
not a general proof that no server code can ever leak.

### Original reproduction and ownership

The unchanged standalone rejected-promise reproduction now records exactly one
mutation, one root refresh, one manifest request, one reload and one marker.
Its final destination is `http://localhost/admin/users?created=1#user`.
This resolves the beta.3 failure documented above.

Additional public-API regressions gate root refresh and manifest completion
independently. Fast confirmation waits for the root gate; delayed confirmation
recovers after that gate has already completed. Both preserve the destination
and the one-mutation/one-root-refresh counts. Another tracked fetcher protects
the reload until it settles, including rejection. New navigation, history
intent, a newer mutation, cleanup and watcher reinstallation invalidate the
old queued recovery without consuming a marker.

The newer-mutation fixture permits subsequent route revalidation to succeed:
otherwise it creates a second chunk failure and therefore a legitimate new
recovery, which is not evidence that the original recovery survived invalidation.
Existing tests also retain initial recovery, overlapping destination intent,
prefetch behavior, unavailable/offline/unchanged checks, throttling and later
eligible recovery. These deterministic tests are not all browser race tests.

### Production browser redirect recovery

Production Admin output was served locally against the fixture API in Chromium.
The real login form/action executed. Because that action normally redirects to
its own already-loaded `/admin` route, a browser interception changed only the
`x-smolter-redirect` response header to `/admin/users?created=1#user`. The Users
lazy route chunk returned a real HTTP 404 once. The root-data transport response
was explicitly gated. Deployment metadata reported a changed version/shared
fingerprint. This is a fault-injected consumer flow, not unmodified production
authentication or a separate deployed build pair.

Both fast and delayed manifest cases passed:

- One action POST and one client root refresh before document recovery.
- No document reload or recovery marker while protected root work was held.
- One manifest request, one recovered document and one session marker.
- `/admin/users?created=1#user` retained, with the Admin prefix intact.
- No action replay after document navigation. The new document naturally does
  its SSR reads; those are not counted as an extra client root revalidation.
- The recovered Users page hydrates and accepts input.

**Still unresolved:** the generic `ADMIN UNAVAILABLE` boundary is visible while
recovery waits. Beta.4 fixes the lost recovery, not interim error presentation.
No consumer suppression was added. Failed/offline/unchanged checks must continue
to expose usable error UI.

### Nonblocking navigation and measurements

The actual Platform production build navigated Privacy to Security with a
manifest held by the local proxy. In one unthrottled Chromium observation,
Security rendered after 176.5 ms and Settings opened after 474.9 ms, before the
two-second default manifest timeout and before releasing the gate. The pending
response therefore did not serialize destination work. After the profile's
initial load settled, typed input survived manifest release with no document
reload. The next Terms navigation made exactly one recovery document request.

An earlier automation attempt filled the profile before its initial value had
settled; that initial value replaced the input. Waiting for the profile before
typing isolates deployment recovery from that separate initialization race.
No claim is made that the profile initialization race was fixed here.

The following comparison uses the saved beta.3 production inventory and the
beta.4 rebuild with the same consumer source/configuration, Node runtime,
fixture API URL and gzip level 9. These are sums of independently compressed
emitted JavaScript files, including lazy and legacy output, not initial-route
transfer or an estimate of additive runtime costs:

| App | Beta.3 gzip bytes | Beta.4 gzip bytes | Delta |
| --- | ---: | ---: | ---: |
| Platform | 276458 | 276503 | +45 |
| Admin | 107554 | 107616 | +62 |
| Remote | 141154 | 141212 | +58 |
| Embed | 98553 | 98604 | +51 |
| Cast | 161002 | 161115 | +113 |
| Tizen | 140085 | 140126 | +41 |

Matched beta.3/beta.4 browser latency and initial-transfer measurements were not
performed. These one-run browser timings are not evidence of lower TTFB, LCP
or statistically improved navigation speed. Full browser Back/Forward races,
first-click intent-prefetch recovery, offline recovery, separate CDN origins,
streaming/mutation combinations and all native/physical-device behaviors are
not freshly signed off by this run. Their historical or deterministic evidence
must remain distinct. Temporary browser sessions and fixture servers were
closed; no native simulator was started. Nothing was merged or deployed.

## Beta.5 follow-up (2026-10-18)

All nine declarations and the lockfile now use published `0.4.5-beta.5`.
The npm `beta` tag matches; `latest` remains 0.4.4. A fresh tarball download
hashed to the supplied and lockfile SHA-512:

```text
sha512-sYXBZ0/MYSz4Imo78h2mbITKcNEC+hSBW5ArT+LBeOMUNnQ1Xkn9zpBusGVyleIRodjIqyxFvCdhAtLGnRPTug==
```

The existing consumer branch remains uncommitted, based on `3f0b100`. This
follow-up changes dependencies, the release-age exception, one overlapping
chunk-error regression and this report. Application code/configuration from
the previous integration is retained. No package patch, compiler override,
local Smolter source alias or recovery workaround was introduced. Native
patches are unchanged. Nothing was published, merged or deployed.

### Production Admin presentation acceptance

Both versions were rebuilt from identical consumer source/configuration using
Node 26.8.1, pnpm 12.3.4, and the same local fixture API URL. The browser test
uses production Admin output, the real login form/action and fixture API. As
before, interception changes the action response's `x-smolter-redirect` header
to `/admin/users?created=1#user`, since normal login redirects to the already
loaded `/admin` route. The Users lazy chunk returns HTTP 404 once. The client
root refresh and deployment response have independent explicit gates.

A test-only MutationObserver installed before hydration reports added error
heading subtrees and character-data changes to the browser harness. Observations
survive document navigation in the harness, so checking only the final page
cannot miss an intermediate error node. No observer is added to product code.
The unchanged assertion fails on freshly rebuilt beta.4: `ADMIN UNAVAILABLE`
is inserted while the root refresh remains protected. It passes on beta.5.

| Manifest scenario | Login POST | Client root refresh | Manifest reads | Automatic reloads | New markers | Terminal error observed |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Immediate newer deployment | 1 | 1 | 1 | 1 | 1 | No |
| Gated newer deployment | 1 | 1 | 1 | 1 | 1 | No |
| Unchanged deployment | 1 | 1 | 1 | 0 | 0 | Yes |
| HTTP 503 | 1 | 1 | 1 | 0 | 0 | Yes |
| Simulated manifest connection failure | 1 | 1 | 1 | 0 | 0 | Yes |
| Existing marker | 1 | 1 | 1 | 0 | 0 | Yes |

Successful cases use built-in document navigation, not a custom reload callback.
Neither reload nor marker consumption occurs while protected work remains held.
Users hydrates, accepts input, retains the prefix/query/hash, and login is not
replayed. Document SSR reads after recovery are separate from the one client
root refresh counted here.

Failure cases expose the genuine error after the manifest gate resolves; the
previous view is not retained indefinitely. Clicking the error's Reload button
after the chunk is restored reaches the usable Users page. That deliberate
manual reload is not included in the table's automatic-reload count. An existing
marker remains unchanged. The disconnect case aborts only the manifest request;
it is not an actual Chromium offline/online transition. Cleanup/reinstallation
ownership remains covered by public-API tests, not a fresh renderer-cleanup
browser test.

### Platform browser regressions

- Keyboard-focus intent prefetch of Security on Privacy receives a real chunk
  404, with zero manifest requests, document requests or markers. Restoring the
  asset and clicking once starts eligible recovery. The held check emits no
  terminal error node; built-in recovery reaches Security with one document
  request, and Settings opens. Mouse-hover, viewport and typed-spread behavior
  are not inferred from this keyboard test.
- Privacy to Security renders with the manifest held, then Settings opens and
  accepts profile input after its initial value has settled. Releasing newer
  metadata preserves input with zero reloads. The next Terms navigation recovers
  exactly once.
- Back and Forward both render while a manifest is held, with zero document
  requests and one shared manifest request. The measured sequence completed in
  about 67 ms, before the unmodified two-second recovery timeout.
- One local ordinary-navigation observation recorded destination rendering at
  105 ms and Settings opening at 437 ms while the gate remained closed. These
  are diagnostic timings, not a matched statistical performance benchmark.

### Validation and matched emitted inventory

Frozen installation, workspace lint/typechecking and all six production builds
pass. The transport/prefetch/cache/revalidation/recovery suite passes 46 tests;
theme passes 3, framing 1, and public-room cache 3. The original standalone
rejected-promise redirect reproduction still records one mutation, root refresh,
manifest check, reload and marker, targeting
`http://localhost/admin/users?created=1#user`. Existing ownership assertions were
retained, and overlapping chunk-error events now have an additional regression.

Vite asset targets/import references and generated route-preload targets were
checked. Browser output scans found no compiler dependency, Node filesystem or
server telemetry signatures. These bounded scans are not an exhaustive proof
against every possible server-code leak. Cast legacy and Tizen classic-script
build output remain intact.

Fresh beta.4 and beta.5 production rebuilds used the same source, environment,
minification and gzip level 9. The inventory sums independently compressed
emitted JavaScript, including lazy and legacy assets. It is not initial transfer.

| App | Rebuilt beta.4 gzip bytes | Beta.5 gzip bytes | Delta |
| --- | ---: | ---: | ---: |
| Platform | 276508 | 276624 | +116 |
| Admin | 107610 | 107076 | -534 |
| Remote | 141208 | 141342 | +134 |
| Embed | 98608 | 98734 | +126 |
| Cast | 161099 | 161354 | +255 |
| Tizen | 140126 | 140288 | +162 |

Use this fresh matched baseline, not the preceding run's saved inventory, for
the beta.5 delta. Bundle splitting/minification changes can affect consumer
totals differently from isolated upstream entrypoint measurements. No matched
initial-route transfer/request-count or LCP/TTFB/CLS improvement is claimed.

No new package defect was reproduced. Remaining unverified areas include true
browser offline/online recovery, renderer cleanup/reinstallation presentation,
all ownership races in a real browser, separate CDN recovery, streaming/mutation
combinations, and native/device/playback parity. Earlier results remain historical
unless explicitly rerun above. Temporary fixture servers and browser sessions
were stopped; pre-existing processes were preserved. No simulator was started.

## Beta.6 follow-up (2026-10-19)

All nine declarations and the lockfile now use npm `0.4.5-beta.6`. Registry
metadata, independently downloaded tarball SHA-512 and lockfile integrity agree:
`sha512-Z/qqADAcdWnsS5abuVBapEmE2xVg2ZgAt8tCYpQgJDHzmPFzGuyzLJZbvP2gh5HJTk4r5uCy5ju80Zz3fLy8RA==`.
Frozen installation passed. npm beta was beta.6 and latest remained 0.4.4.
No application configuration, native patch, compiler override or router workaround
was added. Work remains uncommitted on `test/smolter-045-beta`, based on `3f0b100`;
there is no open PR for this branch. Nothing was merged or deployed.

### Fresh checks

- Workspace lint and typechecking passed; final changed-test lint/typechecking passed.
- All six production builds passed, including existing Cast/Tizen legacy output.
- Transport/cache/revalidation/deployment/prefetch suite: 52 passing tests.
- Theme: 3; framing: 1; public-room cache: 3 passing tests.
- Added page/fetcher synchronous/asynchronous action-failure prefetch checks,
  lazy import retry and lazy module-preparation retry checks through public APIs.
- Existing deterministic tests cover overlapping submissions, failure/disposal,
  navigation/history/mutation invalidation, cleanup/reinstallation and throttling.
- Generated route asset targets exist for Platform (18), Admin (4), Remote (4),
  Embed (1) and Cast (1). Tizen does not emit that inventory.
- Browser output scan found no `typescript-compiler`, `node:fs` or
  `@opentelemetry/sdk-node` references; this is a bounded scan, not a formal proof.
- `git diff --check` passed.

Fresh production Admin tests passed on both rebuilt beta.5 and beta.6. The real
login action's redirect header was fixture-adjusted to
`/admin/users?created=1#user` (normal login redirects to already-loaded `/admin`).
Users' lazy chunk returned 404 once. Root refresh and manifest responses were
explicitly gated. Fast and delayed manifest cases each recorded one login,
one client root refresh, one check, one automatic document recovery and one
marker. No reload/marker consumption occurred during protected root work.
Users hydrated and accepted input. A test-only MutationObserver reported no
intermediate ADMIN UNAVAILABLE node during successful built-in recovery.

Unchanged, HTTP 503, synthetic network-disconnected and existing-marker manifests
showed usable terminal errors, with no automatic reload or newly consumed marker.
Manual Reload succeeded after restoring the asset. These cases' final document
count includes that deliberate manual reload, not automatic recovery.

Platform keyboard-focus intent prefetch failure caused zero speculative manifest
checks/reloads/markers. The first click recovered once, retained the usable view
without terminal error nodes, and Settings worked afterward. Held-manifest
navigation rendered Security in about 108 ms and opened Settings in about 442 ms;
late manifest completion preserved input without a document reload. The next
eligible navigation recovered once. Back/Forward completed in about 81 ms while
the check remained held, with zero document requests and one manifest request.
These are single-run functional observations, not performance benchmarks.

Real Platform homepage tests held stats for six seconds. Settings/input worked
at approximately 299 ms (success), 252 ms (API 503) and 254 ms (navigate-away),
while readyState remained loading. Document completion was approximately six
seconds. Input survived success/failure, one profile PATCH occurred in each of
those two cases, and navigation to Security was not undone by late stats.
Each visit requested stats once. Vibes converts the API failure to null; this is
not arbitrary promise-rejection coverage. Two early harness attempts were invalid:
`/music` is a room path in this checkout, and a global name-input selector also
matched the room form. Corrected tests used `/` and the Settings dialog input.

### Isolated streaming failures requiring upstream investigation

An additional production-minified public-API Preact fixture reproduced both
failures below on beta.5 and beta.6 with Preact 11.0.1 and render-to-string 6.8.1.
These are not established beta.6 regressions and have not been reproduced in
the actual Platform page layout. No workaround was added.

Fixture structure, sufficient to reconstruct on another machine:

```tsx
function Layout({ children }) {
  return <Document><head><title>Deferred fixture</title></head>
    <body>{children}<Scripts /></body></Document>;
}
function Root() {
  const [count, setCount] = useState(0);
  return <main><input aria-label="Retained input" />
    <button onClick={() => setCount(count + 1)}>Count {count}</button>
    <Link to="/next">Next</Link><Outlet /></main>;
}
function Home() {
  const data = useLoaderData();
  return <Suspense fallback={<p>Pending optional</p>}>
    <Await resolve={data.optional} errorElement={<p>Optional failed</p>}>
      {value => <p>{value}</p>}
    </Await></Suspense>;
}
const root = { Layout, default: Root };
const routes = [
  { path: '/', default: Home },
  { path: '/next', default: () => <h1>Next page</h1> },
];
```

Use public Preact exports for router components/hooks, `preact/compat` for
Suspense/useState and `preact/document` for Document/Scripts. Server-only `/`
loader returns `{ optional: new Promise((resolve, reject) => { ... }) }` with
externally gated settlement. Render via `renderApplication(request, serverRoutes,
root, '/entry.js', { earlyHydration: true })` through the public HTTP
`createRequestHandler`; entry calls `mountApplication(routes, root)`.
Bundle browser and server against the same published version, ESM, production
minification, automatic JSX with `jsxImportSource: 'preact'`.

1. **Abandoned resolved content:** load `/` only until response commit; wait for
   Pending optional, click Count 0 and verify Count 1, type into the input while
   readyState is loading. Click Next and wait for Next page. Resolve the original
   optional promise to `Optional resolved`. Wait for document load and two
   animation frames. Actual visible main contains Next page followed by
   `<!--$s:-23--><p>Optional resolved</p><!--/$s:-23-->`. Expected: only the
   destination content. An earlier count before animation frames merely saw
   hidden preact-island markup; the final failure verifies insertion in main.
2. **Interrupted stream:** perform the same early interaction without navigation,
   then destroy the original Node ServerResponse from a separate control request,
   without settling the promise. Optional failed never appears within 10 seconds;
   Pending optional remains. At the one-second observation readyState is still
   loading. Server logs ERR_STREAM_PREMATURE_CLOSE. This demonstrates a bounded
   failed interruption test, not proof of infinite pending time. A synthetic
   interrupted response is not a complete browser offline/reconnect test.

The same fixture's ordinary resolve and arbitrary reject cases passed on beta.6:
counter remained 1 and input survived, with rejection rendering Optional failed.

### Matched emitted size comparison

Fresh beta.5 and beta.6 builds used the same consumer source, Node 26.8.1,
pnpm 12.3.4, production fixture API origin and existing build settings.
The existing bundle-report script sums gzip level 9 per emitted JavaScript file,
including lazy and legacy output. These are not initial-route transfer sizes.

| App | Beta.5 gzip B | Beta.6 gzip B | Delta B |
| --- | ---: | ---: | ---: |
| Platform | 276,623 | 277,028 | +405 |
| Admin | 107,080 | 107,242 | +162 |
| Embed | 98,739 | 98,873 | +134 |
| Remote | 141,340 | 141,511 | +171 |
| Cast | 161,356 | 161,660 | +304 |
| Tizen | 140,288 | 140,439 | +151 |

Initial transfer, matched repeated interaction timing, LCP, TTFB and CLS were not
measured in this run. No general speed improvement is claimed. Still unverified:
real offline/online recovery, separate-CDN browser matrix, all ownership races in
production UI, explicit root revalidation during an unfinished stream, HMR in this
version, native/device/paired playback/live queue parity. Temporary processes were
stopped; existing development servers were preserved. No simulator was started.

## Beta.7 follow-up (2026-10-19)

All nine declarations and the lockfile now use published npm `0.4.5-beta.7`.
The downloaded tarball, registry metadata and lockfile match:
`sha512-giSSxJM22WzJJ4jNyEmx1DH9HyKSiQ3Llm4wRyEYCT3sYHnlzjATHWkc+e/fPeHS8PjCRcEejnMt/MgHwPKytw==`.
Frozen installation passed; beta points to beta.7 and latest remains 0.4.4.
The existing narrowly scoped release-age exception was updated; native patches,
compiler versions, transport, SSR, deployment and CDN configuration are unchanged.
No package patch, source alias, replacement routing or timeout override was added
to Vibes. Work remains local and uncommitted on `test/smolter-045-beta` at
`3f0b100dd860fa0419d4d5589a7b466c66e1607b`; no open PR exists for this branch.

### Original reproductions and timeout compatibility

The preceding section's production-minified public-API fixtures were rerun
against beta.6 as negative controls, then rebuilt against beta.7 with the same
Preact 11.0.1 / render-to-string 6.8.1 dependencies.

- Beta.6 again visibly inserted abandoned resolved content after navigation and
  missed the ten-second interrupted-stream failure deadline.
- Beta.7 passed ordinary resolve, arbitrary rejection, navigation before settlement
  and interruption without a deferredTimeout override. Navigation cleanup checks
  wait for document completion plus two animation frames and are document-wide.
- Input and counter survived. Interrupted-stream failure appeared about 8.4 s
  after mount completion in the instrumented repetition, and navigation afterward
  worked. No browser page errors were captured. Destroying the response produced
  the expected server ERR_STREAM_PREMATURE_CLOSE; cancellation messages also
  occurred when closing pages with renderer work pending.
- A six-second optional result succeeded with the released default.
- A fixture-only 12,000 ms budget allowed a nine-second successful result.
- With the default budget, failure UI appeared before a later approximately
  nine-second settlement; that late result did not replace the failure UI.

The interruption result is the new eight-second total budget, not immediate
disconnect detection. Vibes' default REST timeout is 10,000 ms: optional initial
data completing between the hydration deadline and the REST deadline can now
reach fallback UI first. No override was silently added. Deliberately slower
optional data would require an explicit product decision about a longer budget.

### Repeated ownership matrix

Final production-minified fixture runs passed five repetitions each (50 total):

1. Settlement racing navigation.
2. Navigate away and return before original settlement.
3. Two independent boundaries, first then second.
4. Two independent boundaries, second then first.
5. Nested rejection before navigation.
6. Nested rejection after navigation.
7. Persistent root boundary beside the abandoned route boundary.
8. Root revalidation replacing pending values with synchronous data.
9. Two routes sharing the same component.
10. Back/Forward before settlement.

Assertions cover exactly one initial server route load, counter exactly one,
retained input/focus, correct query/hash destination, zero browser page errors,
no duplicate active resolved content and no stale fallback/resolved/error nodes
anywhere after document completion and renderer frames. Intermediate assertions
scope to main; final absence assertions do not ignore hidden renderer staging.
Root revalidation uses public loaderPath registration and a resource loader;
no router internals are modified. Four additional single-run budget cases passed:
six-second success, longer explicit budget, interrupted default and late default.

Early fixture corrections are not package defects: the root-revalidation fixture
initially omitted loaderPath; a nested test initially waited for a transient
nested fallback before allowing rejection. The final nested fixture supplies two
independently gated loader promises rendered as nested boundaries, releases the
outer gate, allows rendering, then rejects the inner gate before/after navigation.
It verifies the active error where applicable and final document-wide cleanup.

### Recovery and real Vibes streaming

All six production Admin cases passed: fast/delayed newer manifests, unchanged,
HTTP 503, synthetic connection failure and already-consumed marker. The real
login action's redirect is fixture-adjusted to `/admin/users?created=1#user`, since
normal login targets the already-loaded Admin root. A genuine Users chunk 404
and explicitly gated root refresh are retained.

Each successful case recorded one login mutation, client root refresh, manifest
request, built-in recovery navigation and marker. Protected work prevented early
reload/marker consumption. A test-only DOM observer saw no intermediate ADMIN
UNAVAILABLE node. Recovered Users accepted input. Failure cases exposed usable
terminal errors, did not automatically reload or consume another marker, and
recovered on manual Reload after asset restoration. No mutation replay occurred.

Platform keyboard-intent prefetch failure caused no speculative manifest check,
reload or marker. First committed click recovered once without terminal error
nodes, and Settings worked. Back/Forward remained nonblocking while a manifest
was held (about 80 ms, zero document requests). Held-manifest navigation rendered
Security in about 110 ms and opened Settings in about 466 ms. Late completion
preserved input and did not reload; the next eligible navigation recovered once.
One chained fixture startup attempt could not find Settings; an isolated repeat
passed. Proxy readiness alone did not guarantee upstream readiness, so that
attempt is not treated as evidence of a package regression.

Actual Platform six-second statistics success, API-503-to-null and navigation-away
cases passed. Final instrumented runs opened Settings/entered input at about
279/261/261 ms while readyState was loading, with document completion around six
seconds. Each profile-save case executed one backend PATCH and one root transport
GET (`/_smolter?url=%2Fresources%2Froot`), without repeating stats. Input/dialog
survived. Navigation stayed on Security after settlement. Root request counting
decodes the encoded transport URL; matching its raw path initially missed it.
There were no browser page errors. This is separate from arbitrary promise
rejection, and does not imply the original stale-content bug existed in Vibes.
All timing values are single-run functional observations, not speed benchmarks.

### Build gates and matched emitted inventory

Passed frozen installation, workspace lint/typechecking, all six production
builds, 52 transport/cache/revalidation/deployment/prefetch tests, three theme
tests, one framing test, three public-room-cache tests, generated route target
validation and git diff --check. Existing Cast legacy and Tizen packaging remain.
Browser-output scans found no typescript-compiler, node:fs or server telemetry
SDK references; these are bounded scans, not a formal proof.

Fresh beta.6 and beta.7 production builds use identical consumer source/build
configuration, Node 26.8.1 and pnpm 12.3.4. The existing inventory script sums
gzip level 9 separately for each emitted JS file, including lazy/legacy output.

| App | Beta.6 gzip B | Beta.7 gzip B | Delta B |
| --- | ---: | ---: | ---: |
| Platform | 277,027 | 277,307 | +280 |
| Admin | 107,239 | 107,499 | +260 |
| Embed | 98,876 | 99,159 | +283 |
| Remote | 141,516 | 141,755 | +239 |
| Cast | 161,658 | 162,203 | +545 |
| Tizen | 140,439 | 140,729 | +290 |

These are emitted inventories, not initial-route transfers. No matched LCP,
TTFB, CLS, request-count or general performance improvement is claimed.
No new confirmed package defect remains from the completed scenarios. Full
browser offline/reconnect, separate-CDN matrix, physical/native devices, live
queue/paired playback, and new-version HMR remain unverified. Temporary fixture
servers and browser sessions were stopped, existing development processes were
preserved, and no simulator was started. Nothing was committed, pushed, merged,
published or deployed.

## Stable 0.4.5 release validation (2026-10-19)

All nine declarations now pin published npm `@kasperrt/smolter@0.4.5`.
Registry metadata, the downloaded tarball and lockfile agree on:

```text
sha512-TFttpKg6QI5QHeZG5BYjSXVgSWcXnSZoeR8Lvol7VxN4XOwYdPS2+R7hwxgLdOEy22QnujSYoagNA+PkMU1EZw==
```

The release is a promotion of beta.7: all 173 published dist files compared
byte-for-byte equal, and dependency maps match. Installed resolution is the npm
artifact, not a local checkout. The release-age exception is narrowly scoped to
stable versions 0.4.4 and 0.4.5. Native patches are unchanged. Platform explicitly
retains its `/_smolter` endpoint; scoped endpoints, suffix compatibility, CDN
bases, bootstrap recovery and early hydration remain intact. No router workaround
or timeout override was introduced.

Fresh stable validation passed frozen install, lint, typechecking, six production
builds, 52 transport/prefetch/revalidation/recovery tests, three theme tests, one
framing test and three public-room-cache tests. The package audit found no known
vulnerabilities. All 609 generated route asset references exist. Bounded browser
output scans found no compiler API package, Node filesystem import or server
telemetry SDK. Cast legacy output and Tizen packaging remain included.

Fresh production-browser results:

- Admin fast/delayed manifest recovery: one login, client root refresh, manifest,
  built-in recovery and marker each; no intermediate ADMIN UNAVAILABLE node;
  Users hydrated and accepted input. The fixture adjusts the login redirect to
  `/admin/users?created=1#user` to exercise the lazy destination.
- Unchanged, 503, disconnected manifest and existing-marker cases exposed usable
  errors without automatic loops or mutation replay. Manual Reload after restoring
  the asset worked. The disconnected case is not browser-wide offline coverage.
- Keyboard intent failure caused no speculative recovery. First click recovered
  once without terminal error nodes. Held-manifest Back/Forward used zero document
  requests. Security rendered and Settings accepted input before a held routine
  manifest completed; late completion preserved input, and the next navigation
  recovered once.
- Actual Platform six-second statistics success, API-failure-to-null and navigation
  away passed. Settings/input worked around 247–287 ms while the document remained
  loading until approximately six seconds. Save cases each had one profile PATCH
  and one root refresh, without duplicate stats. Input/dialog survived settlement;
  navigation remained on Security. Browser page-error collections were empty.
- Rebuilt minified public-API streaming fixtures passed four original cases and
  54 extended cases: 50 ownership-race repetitions plus six-second settlement,
  explicit longer budget, interrupted stream and late default-budget settlement.
  Final document-wide checks found no abandoned content. Interrupted streams
  reached failure UI around 8.44 seconds from mount, with shell state intact.
  This uses the eight-second budget, not immediate disconnect detection.

One Platform harness initially checked proxy readiness rather than upstream
readiness. It reached an unavailable fixture before the application started.
The harness now waits for a successful document response; the repeat passed.
This was a fixture defect, not a consumer or package failure.

Stable emitted JS gzip-level-9 inventories (all lazy/legacy output included):
Platform 277,307 B; Admin 107,495 B; Embed 99,153 B; Remote 141,744 B;
Cast 162,191 B; Tizen 140,729 B. Against the beta.7 inventories above, deltas are
0, -4, -6, -11, -12 and 0 B respectively. These tiny build-output differences
are not runtime size optimizations: package implementation files are identical.
These are not initial-route transfer totals. Timing observations are functional
checks, not matched performance benchmarks or claims about LCP/TTFB.

The default deferred budget remains eight seconds; intentional longer waits need
an explicit application decision. Full offline/reconnect and separate-CDN matrices,
native/physical devices, live queues and paired playback remain outside this
release validation. Temporary fixture processes were stopped; no simulator was
started. Web publication follows the repository's normal main-branch workflows.
