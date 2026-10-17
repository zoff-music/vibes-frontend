<p align="center">
  <img src="apps/platform/public/logo.png" alt="Zoff logo" width="192">
</p>

# Vibes Frontend

## Development runtimes

The DOM apps use Preact and `@kasperrt/smolter/preact`, with flat route modules
under each app's `src/routes` (Tizen: `src/tizen/routes`). Smolter owns route
matching, data requests, revalidation, and hydration; `@vibes/serve` supplies
Express hosting, metrics, and Vite integration.

Mobile uses Expo Router for native tabs, sheets, deep links, and screen navigation.
Android TV uses Expo's root component and its existing single-screen room flow.
Neither native bundle contains a second router or route registry. App hooks call
the existing typed API handlers directly; Tizen keeps Smolter for DOM routing.

| App | Command | Local URL |
| --- | --- | --- |
| Platform | `pnpm --filter @vibes/platform dev` | http://127.0.0.1:3001/ |
| Admin | `pnpm --filter @vibes/admin dev` | http://127.0.0.1:3005/admin |
| Embed | `pnpm --filter @vibes/embed dev` | http://127.0.0.1:3006/embed/ROOM |
| Remote | `pnpm --filter @vibes/remote dev` | http://127.0.0.1:3007/remotes/join |
| Cast | `pnpm --filter @vibes/cast dev` | http://127.0.0.1:3003/casting/receiver/ |
| Tizen | `pnpm --filter @vibes/tv tizen:dev --port 3008` | http://127.0.0.1:3008/tizen.html |
| Mobile | `pnpm --filter @vibes/mobile start --port 8081` | Native development client |
| Android TV | `pnpm --filter @vibes/tv start --port 8082` | Native development client |

Local web requests use each Vite server's `/api` proxy to `https://zoff.me`.
SSR uses the same backend through `VITE_API_URL_INTERNAL`. Development links
between web apps select the corresponding local port. Native applications keep
their existing backend configuration. Cast receiver sessions and native playback
require their respective devices or development clients.

Run `pnpm lint`, `pnpm typecheck`, `pnpm build`, and
`pnpm --filter @vibes/shared test:navigation` to check the workspace.

Production images are published by the per-app `*-release.yaml` workflows on
pushes to `main` in `zoff-music/vibes-frontend`, including PR merges and direct
commits. Each workflow builds that exact pushed commit, retains its app-specific
path filters and `ASSET_ORIGIN` setting, and
uses a private temporary Docker configuration removed after success or failure.
Forks, other branches, unmerged PR closures, and manual dispatches cannot publish.

The reusable `security.yaml` workflow runs Semgrep and `pnpm audit` in parallel
before every upstream `main` release build. PRs do not trigger workflows. Semgrep
findings, scan errors, and dependency advisories rated moderate or higher block
publishing. Neither scan has publishing permissions or deployment secrets.

The TypeScript workspace for [Zoff](https://zoff.me): free shared music rooms
for YouTube and SoundCloud, with no listener account required. Build a queue
together, vote on songs, chat, and listen on the web, phones, tablets, and TVs.

## Applications

| Application | Runtime and purpose |
| --- | --- |
| [Platform](apps/platform/README.md) | Preact + Smolter SSR web app: rooms, public-room browsing, shared queues, chat, party view, and product guides |
| [Admin](apps/admin/README.md) | Separate Preact + Smolter SSR app for protected global administration and usage views |
| [Embed](apps/embed/README.md) | Preact + Smolter SSR room player for embedding on other sites |
| [Remote](apps/remote/README.md) | Preact + Smolter SSR paired controller for another Zoff player |
| [Cast](apps/cast/README.md) | Standalone Vite/Preact + Smolter receiver running in the Google Cast runtime, not an SSR app |
| [Mobile](apps/mobile/README.md) | Native-only Expo Router app for iOS and Android phones and tablets |
| [TV](apps/tv/README.md) | One TV product with an Expo Android TV renderer and a DOM-based Samsung Tizen renderer |

Features depend on the target runtime and enabled providers. Playback uses
official provider players; autoplay, embedding, and Cast availability remain
subject to browser, device, and provider restrictions.

## What Zoff Provides

- Rooms with their own settings, optional administrator passwords, public
  discovery, and private link sharing.
- Shared queues, votes, playlist imports, and prompt-based playlist generation.
- Server-mode playback progression or host-mode control, with room-level
  permissions for adding and skipping.
- Live chat and room activity, with a per-device chat toggle.
- Replayable SSE and compact queue updates across supported clients.
- Share links and QR codes, configurable embeds, paired remote controls, and Cast.
- A shared visual language with light/dark themes, accessible controls, and
  layouts adapted to touch, keyboard, and TV remote input.

## Shared Packages

| Package | Responsibility |
| --- | --- |
| `@vibes/api` | React-free REST capabilities, typed transport/error handling, SSE plumbing, and reusable SSE lifecycle hooks |
| `@vibes/models` | Compiled Zod 4 schemas and derived domain types |
| `@vibes/shared` | Renderer-neutral hooks, stores, constants, and safe-wrap utilities |
| `@vibes/ui/web` | DOM controls and provider players |
| `@vibes/ui/native` | Shared React Native controls and provider-player wrappers |
| `@vibes/ui/shared` | Renderer-neutral presentation, icons, and formatting |
| `@vibes/serve` | Node/Express serving, compression, metrics, and tracing |
| `@vibes/tailwind` | Shared Tailwind configuration, theme tokens, and fonts |

Apps do not import one another's UI. DOM REST reads and mutations belong in
Smolter loaders/client loaders and actions/client actions, including Cast
and Tizen. Native workflows compose the shared API from app-owned hooks.
Components can trigger fetchers and subscribe to SSE without owning raw HTTP calls.

## Development

Use the Node engine and exact pnpm version pinned in [package.json](package.json).
Install with the committed lockfile; do not independently upgrade tooling to
follow this README.

```bash
pnpm install --frozen-lockfile
pnpm dev                                  # Platform, port 3001
pnpm --filter @vibes/embed dev             # Embed, port 3006
pnpm --filter @vibes/remote dev             # Remote, port 3007
pnpm --filter @vibes/cast dev               # Cast, port 3003
pnpm --filter @vibes/mobile start          # Native mobile Metro server
pnpm --filter @vibes/tv start              # Native Android TV Metro server
pnpm --filter @vibes/tv tizen:dev           # Samsung TV browser preview
```

Configure each app's environment using its README. Run the
[backend](https://github.com/zoff-music/vibes-backend) with PostgreSQL and Redis;
apply the [migrator](https://github.com/zoff-music/vibes-migrator) first.
See [local Cast development](docs/local-cast-development.md) for sender/receiver setup.

Embed URLs support `player`, `playlist`, `skip`, `vote`, and `autoplay`
options. Autoplay defaults off. Enabling it attempts audible playback, but a
blocked attempt still requires the visitor to click play. Configure
`EMBED_BASE_PATH` consistently in Platform and Embed.

## Validation and Delivery

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm --filter @vibes/mobile validate
pnpm --filter @vibes/tv validate
```

The root build covers the web applications and Tizen bundle. It does not build,
submit, or publish native binaries. Mobile and Android TV use their app-specific
Expo/EAS configuration and release instructions; Tizen has separate packaging
and signing. A documentation change alone does not require a native release.

Web apps use content-hashed assets. Platform, Admin, Embed, and Remote provide
SSR; Cast and Tizen use client-side DOM runtimes. Shared styles use Tailwind v4
on DOM and NativeWind on native targets. Biome and TypeScript enforce workspace
quality, alongside API-boundary checks.

Read [AGENTS.md](AGENTS.md) and the
[frontend skill](.agents/skills/vibes-frontend/SKILL.md) before contributing.
The backend [architecture](https://github.com/zoff-music/vibes-backend/blob/main/docs/ARCHITECTURE.md)
and [flows](https://github.com/zoff-music/vibes-backend/blob/main/docs/FLOWS.md)
describe the cross-repository contracts.

## Static asset origin

Web builds accept `ASSET_ORIGIN`, for example `https://assets.example.com`.
Leave it empty to use same-origin files. The production workflows pass the
`ASSET_ORIGIN` GitHub Actions variable to each Docker build; changing it requires
rebuilding and deploying the affected apps. This does not change API URLs,
SSE subscriptions, router paths, manifests used for route discovery, or cookies.

All five web apps share one origin with these independent asset prefixes:

| App | Built assets |
| --- | --- |
| Platform | `/assets/` |
| Admin | `/admin/assets/` |
| Embed | `/embed/assets/` |
| Remote | `/remotes/assets/` |
| Cast | `/casting/receiver/assets/` |

Public images use each app's base path. Imported images, CSS, fonts and dynamic
chunks use Vite's generated URLs. Keep Embed's build-time `EMBED_BASE_PATH`
aligned with its runtime path and ingress. Native and packaged TV builds are
unchanged. Cast retains its legacy JavaScript and CSS targets.

SSR responses preconnect to the asset origin alongside their font and module
preloads while loaders run. Cast provides the matching document hint. This
lets the browser start the separate asset connection before discovering later
chunks, without moving document or data requests away from the application.

Set the web servers' runtime `ASSET_HOST` to the asset hostname. Requests on
that host serve static files only, with anonymous cross-origin access for
modules and fonts; missing files, HTML, API and data routes never fall through
to SSR. Hashed files retain immutable one-year caching and prebuilt compression;
unhashed public images have a one-hour cache lifetime. Do not route APIs or SSE
through the asset host or proxy the application's main hostname to enable this.

Roll out server support first with an empty `ASSET_ORIGIN`, then verify the
asset host's DNS, TLS, CORS, compression and app prefixes. Only then enable the
build variable. To roll back asset URLs, clear that variable and rebuild. Keep
the asset host available for already-open pages. CDN caching is not permanent
storage: it does not by itself guarantee retention of previous build files.


## Production deployment updates

The DOM apps use published [Smolter 0.3.5](https://github.com/kasperrt/smolter/releases/tag/v0.3.5)
without a local router patch. See [migration validation](docs/smolter-migration.md)
for verified behavior and remaining merge blockers.

Platform, Admin, Embed, Remote and Cast emit a per-build
`smolter-manifest.json`. The shared Express host serves it with
`Cache-Control: no-store`, including on the configured asset hostname. HTML is
revalidated; content-hashed assets remain immutable. A CDN must honor these
headers and deploy each manifest alongside its matching HTML and assets.

Smolter checks this manifest before path/query navigation and Back/Forward. A
changed version reloads the destination using the new build. Missing lazy chunks
trigger another check to cover deployments racing with navigation. Failed checks
continue normal routing, and a per-build session marker prevents reload loops.
Hash links do not check; mutations are never replayed. There is no background polling.

Mounting receives the deployment options before the first lazy route import.
Recovery still requires the entry script to load; retain previous hashed assets
through rollouts. A missing entry script cannot execute recovery code.

SSR apps use distinct same-origin data endpoints: `/_smolter`,
`/admin/_smolter`, `/remotes/_smolter` and `/embed/_smolter` (or the configured
embed base). Vite-generated transports and the Express adapter must agree.
Data responses use `Cache-Control: private, no-store`, including failures and
mutations. Cast and packaged Tizen use client handlers, not server transport.

Production SSR streams the shell while optional homepage statistics and room
lists resolve. Hydration starts after the document stream completes; this is
not progressive hydration. Development HTML transformation buffers, so measure
streaming with production builds. Keep `preact-render-to-string >=6.8.1`.
SSR hydration entries and modulepreloads use the build's asset base, including
the configured CDN origin; data requests remain on the application origin.

Development uses Vite HMR and route discovery updates; no deployment checks run.
Packaged Tizen and native apps do not use this web deployment mechanism.
