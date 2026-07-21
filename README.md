# Vibes Frontend

A React Router + Vite + TypeScript monorepo using pnpm workspaces.

## Applications

- **`apps/platform`**: The main web application for room management, queueing, and social interaction (SSR-enabled)
- **`apps/admin`**: Admin application served separately while preserving the admin route surface
- **`apps/cast`**: A standalone Chromecast Receiver application for synchronized playback on Google Cast devices (SSR-enabled)
- **`apps/embed`**: A standalone SSR embed player served at `/embed/:roomName` by default

## Shared Packages

- **`packages/api`**: Type-safe API client
- **`packages/models`**: Shared domain types, interfaces, and validation schemas
- **`packages/shared`**: Shared React hooks, utilities, and Zustand stores (includes safeWrap error handling)
- **`packages/player`**: Re-export package for shared player UI where needed
- **`packages/serve`**: Shared TypeScript server, metrics, and tracing utilities

## Development

```bash
# Install dependencies
pnpm install

# Run the main platform app (port 3001, SSR-enabled)
pnpm dev

# Run all apps
pnpm --recursive dev

# Run the embed app (port 3006)
pnpm --filter @vibes/embed dev
```

Set `EMBED_BASE_PATH` in both `apps/platform/.env` and `apps/embed/.env` to
change the local embed mount path. Embed URLs accept the optional boolean query
parameters `autoplay`, `playlist`, and `vote`.

## Server-Side Rendering (SSR)

The web applications support SSR for improved performance and SEO:

- **Platform App**: SSR with room data prefetching
- **Admin App**: SSR for admin views
- **Cast App**: SSR for faster Chromecast loading
- **Development**: Hot module replacement with SSR
- **Production**: Optimized SSR builds

## Tooling

- **Linting & Formatting**: [Biome](https://biomejs.dev/) (`pnpm lint`, `pnpm fix`)
- **Type Checking**: TypeScript (`pnpm typecheck`)
- **Testing**: Vitest
- **Error Handling**: `safeWrap`/`safeWrapAsync` utilities (no try/catch)
- **Styling**: Tailwind CSS v4 with dark mode support

## Key Features

- **Dark Mode**: System preference detection with manual toggle
- **Error Handling**: Safe error handling with `safeWrap` utilities
- **Type Safety**: Full TypeScript with `@vibes/api`
- **Real-time**: SSE integration for live updates
- **Responsive**: Mobile-first design with Tailwind CSS v4

## Rules

Please read the [AGENTS.md](./AGENTS.md) for non-negotiable frontend coding conventions and file layout rules.
