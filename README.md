<p align="center">
  <img src="apps/platform/public/logo.png" alt="zoff logo" width="192">
</p>

# Vibes Frontend

A TypeScript monorepo for Zoff's SSR web, native mobile, television, Cast, and
remote-control clients, built with pnpm workspaces.

## Applications

- **`apps/platform`**: The main web application for room management, queueing, and social interaction (SSR-enabled)
- **`apps/admin`**: Admin application served separately while preserving the admin route surface
- **`apps/cast`**: A standalone Chromecast Receiver application for synchronized playback on Google Cast devices (SSR-enabled)
- **`apps/embed`**: A standalone SSR embed player served at `/embed/:roomName` by default
- **`apps/mobile`**: Native Expo application for iOS and Android
- **`apps/remote`**: Lightweight web remote for controlling a paired Zoff screen
- **`apps/tv`**: Zoff TV, delivered as native Android TV and Samsung TV builds

## Shared Packages

- **`packages/api`**: Type-safe API client
- **`packages/models`**: Shared domain types, interfaces, and validation schemas
- **`packages/shared`**: Shared React hooks, utilities, and Zustand stores (includes safeWrap error handling)
- **`packages/ui`**: Shared UI through explicit `@vibes/ui/web`,
  `@vibes/ui/native`, and `@vibes/ui/shared` platform boundaries
- **`packages/serve`**: Shared TypeScript server, metrics, and tracing utilities

## Development

Use Node.js 26.8.1 or newer and pnpm 12.3.4, pinned in `package.json`.
The Docker build stages use the same pnpm version and install `libatomic1`,
which its native Linux executable requires on Debian slim images.

```bash
# Install dependencies
pnpm install

# Run the main platform app (port 3001, SSR-enabled)
pnpm dev

# Run all apps
pnpm --recursive dev

# Run the embed app (port 3006)
pnpm --filter @vibes/embed dev

# Run the native iOS/Android development server
pnpm --filter @vibes/mobile start

# Run the Android TV development server
pnpm --filter @vibes/tv start

# Run the Samsung TV browser-runtime preview
pnpm --filter @vibes/tv tizen:dev
```

Set `EMBED_BASE_PATH` in both `apps/platform/.env` and `apps/embed/.env` to
change the local embed mount path. Embed URLs accept the optional boolean query
parameters `player`, `playlist`, `skip`, and `vote`. Embedded playback always
requires an explicit visitor interaction.

For sender and receiver testing with a local API, PostgreSQL database, and
Redis instance, see [Local Cast development](docs/local-cast-development.md).

## Server-Side Rendering (SSR)

The React Router web applications support SSR for improved performance and SEO.
Mobile is a native Expo application. Zoff TV shares its room/session behavior
across two delivery targets: a native Android TV build and the browser runtime
required by Samsung TVs.

- **Platform App**: SSR with room data prefetching
- **Admin App**: SSR for admin views
- **Cast App**: SSR for faster Chromecast loading
- **Development**: Hot module replacement with SSR
- **Production**: Optimized SSR builds
- **Native**: Expo Router on mobile and an Expo Android TV entrypoint
- **Samsung TV**: Vite packages the same TV product for Samsung's browser-based
  application runtime

## Tooling

- **Linting & Formatting**: [Biome](https://biomejs.dev/) (`pnpm lint`, `pnpm fix`)
- **Type Checking**: TypeScript (`pnpm typecheck`)
- **Testing**: Vitest
- **Error Handling**: `safeWrap`/`safeWrapAsync` utilities (no try/catch)
- **Styling**: Tailwind CSS v4 for DOM targets and NativeWind for React Native

## Key Features

- **Dark Mode**: System preference detection with manual toggle
- **Error Handling**: Safe error handling with `safeWrap` utilities
- **Type Safety**: Full TypeScript with `@vibes/api`
- **Real-time**: SSE integration for live updates
- **Cross-platform UI**: Explicit web, native, and renderer-neutral package boundaries

## Rules

Please read the [AGENTS.md](./AGENTS.md) for non-negotiable frontend coding conventions and file layout rules.
