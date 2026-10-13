<p align="center">
  <img src="apps/platform/public/logo.png" alt="Zoff logo" width="192">
</p>

# Vibes Frontend

Production images are published by the per-app `*-release.yaml` workflows only
after a pull request merges into `main`. Each workflow builds that exact merged
commit, retains its app-specific path filters and `ASSET_ORIGIN` setting, and
uses a private temporary Docker configuration removed after success or failure.
Direct pushes, unmerged PR closures, and manual dispatches do not publish images.

The TypeScript workspace for [Zoff](https://zoff.me): free shared music rooms
for YouTube and SoundCloud, with no listener account required. Build a queue
together, vote on songs, chat, and listen on the web, phones, tablets, and TVs.

## Applications

| Application | Runtime and purpose |
| --- | --- |
| [Platform](apps/platform/README.md) | React Router SSR web app: rooms, public-room browsing, shared queues, chat, party view, and product guides |
| [Admin](apps/admin/README.md) | Separate React Router SSR app for protected global administration and usage views |
| [Embed](apps/embed/README.md) | React Router SSR room player for embedding on other sites |
| [Remote](apps/remote/README.md) | React Router SSR paired controller for another Zoff player |
| [Cast](apps/cast/README.md) | Standalone Vite/React Router receiver running in the Google Cast runtime, not an SSR app |
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
| `@vibes/native-router` | Shared native routing support |
| `@vibes/serve` | Node/Express serving, compression, metrics, and tracing |
| Tailwind and iconography packages | Shared styling configuration and generated icon exports |

Apps do not import one another's UI. DOM REST reads and mutations belong in
React Router loaders/client loaders and actions/client actions, including Cast
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
