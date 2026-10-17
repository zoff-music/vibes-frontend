# Frontend Coding Rules

Non-negotiable conventions. Follow strictly.

## Required Skill Check

- Before making changes or reviewing code, check the repository's `.agents/` directory for applicable skills.
- Frontend work in this repository requires reading `.agents/skills/vibes-frontend/SKILL.md` in full before acting.
- Treat the skill and this `AGENTS.md` as cumulative, mandatory guidance. If additional applicable skills are added under `.agents/`, read those in full as well.

## Critical Rules

- **No `any` type** - use explicit types, compose when needed
- **Limit Return Values** - NEVER return more than 2 values. 3 or more is strictly illegal.
- **No `@ts-ignore` or `@ts-nocheck`** - fix the type
- **No `try/catch`** - use `safeWrap`/`safeWrapAsync` from `@vibes/shared`
- **Use Biome** for ALL linting and formatting. No ESLint.
- **Run `pnpm lint`** to check both format and lint rules before committing.
- **Run `pnpm typecheck`** to verify TypeScript compilation before committing.
- **Use `@vibes/api`** for ALL API calls / SSE.
- **Only SSE hooks in `@vibes/api`** - reusable SSE subscription hooks are allowed. REST/request hooks, providers, stores, and application state orchestration are forbidden; REST capabilities remain plain React-free functions.
- **NEVER use `fetch()` or `new EventSource()`** in app code. Only `@vibes/api` clients; native API construction may inject `expo/fetch`.
- **Smolter REST boundary** - In every DOM app, including Cast and Samsung Tizen, REST calls belong only in `loader`, `clientLoader`, `action`, or `clientAction` modules. Components may submit through fetchers and subscribe to SSE through `@vibes/api`, but must never execute REST requests inline.
- **Native navigation** - Mobile uses Expo Router; Android TV keeps Expo’s registered root and single-screen session flow. Do not implement or add a native router or route registry. Native app hooks call typed API handlers directly. Samsung Tizen remains a Smolter DOM app.
- **Unified Build System** - Apps build through the pnpm workspace
- **Content Hashing** - All assets use content-based hashing for cache busting

## File Layout

- DOM apps keep flat routes in `src/routes`. Each route has `route.tsx`, separate `loader.ts`, `clientLoader.ts`, `action.ts`, `clientAction.ts`, boundaries and revalidation modules as needed.
- Shared non-page DOM loaders/actions use `resources.<name>` routes: one plural word, no hyphens (for example `resources.recents`). Let discovery infer paths and IDs; see the skill for scope and module structure.
- Route-only helpers belong in that route's `utils` directory. Cross-route helpers belong in `src/utils`; constants belong in `src/constants`.
- Root modules live in `src/root`. Client hydration and server rendering use `entry.client.tsx` and `entry.server.tsx`.
- Mobile's only route tree is Expo Router's `src/app`; screens/components, hooks and typed request functions live outside it. Do not retain a parallel `src/routes` tree or native loader/action modules.
- Android TV has a registered root; Tizen keeps its DOM routes in `src/tizen/routes`.
- Shared packages are `api`, `models`, `shared`, `ui`, `serve` and `tailwind`. Import other packages through their declared exports, never relative source paths.
- Do not add forwarding packages or aliases that duplicate existing exports. Keep framework-required entrypoints.

## Packages

- `@vibes/api`: API client (`import { api } from '@vibes/api'`)
- `@vibes/models`: Shared types and schemas (`import { RoomV2, PlaylistItem, PlaybackStateV2 } from '@vibes/models'`)
- `@vibes/shared`: Shared utilities (`import { safeWrap, usePlaybackStore, SourceType } from '@vibes/shared'`)
- `@vibes/ui/web`: DOM UI and player components (`import { VideoPlayer, Toast } from '@vibes/ui/web'`)
- `@vibes/ui/native`: React Native controls and official native provider-player wrappers
- `@vibes/ui/shared`: Platform-neutral icons, formatting, playback calculations, and presentation helpers

## Error Handling

Never use try/catch. Use the wrap utilities from `@vibes/shared`:

```typescript
import { safeWrap, safeWrapAsync } from '@vibes/shared';

// Sync
const [error, result] = safeWrap(() => JSON.parse(data));
if (error) {
  // handle error
  return;
}
// use result

// Async - CRITICAL: destructure as [error, data]
const [error, data] = await safeWrapAsync(loadSomething());
if (error) {
  // handle error
  return;
}
// use data
```

**Important**: `safeWrapAsync` returns `[Error | null, T | null]` - always destructure as `[error, data]`, not `[data, error]`.
**Important**: `@vibes/api` methods already return `[error, data]`; do not wrap `api.get()`, `api.post()`, `api.put()`, or similar API calls in `safeWrapAsync`.

## API Calls

Always use `@vibes/api`:

```typescript
import { api } from '@vibes/api';

// GET request
const [error, room] = await api.v2.get('/rooms/{id}', { id: roomId });

// POST request
const [error, item] = await api.v2.post('/rooms/{id}/playlist-items', { id: roomId }, {
  sourceType: 'youtube',
  sourceId: 'dQw4w9WgXcQ',
  title: 'Never Gonna Give You Up',
  publisher: 'Rick Astley',
  thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
  duration: 213
});

// PUT request
const [error, playbackState] = await api.v2.put('/rooms/{id}/states', { id: roomId }, {
  action: 'play',
  positionMs: 45000
});
```

## Rendering, Data and Navigation

- DOM apps use Preact and `@kasperrt/smolter/preact`. Build plugins and server APIs use the corresponding `/vite` and `/server` subpaths.
- Use Vite for client and server builds. Express integration, compression, metrics and tracing live in `@vibes/serve`.
- Hydrate the server-rendered content with the same route data, theme and asset URLs. Do not replace existing SSR content with a mount-time loading screen.
- Load styles and font preloads in the document head. Keep browser-only behavior behind client guards.
- Preserve shared elements during navigation. Hash changes must not start page view transitions.
- Use `shouldRevalidate` and targeted revalidation instead of refreshing every route after every action.
- Shared Zustand stores own room, queue and playback state. Subscribe to backend events through the SSE hooks in `@vibes/api`; do not implement parallel transports.
- SoundCloud is available only for Music rooms. Keep official YouTube and SoundCloud players and Cast SDK behavior.

## Styling

Use Tailwind CSS v4 or NativeWind with dark mode support. Static presentation must not use inline styles or CSS-in-JS. React Native may use inline styles only for measured/runtime geometry, progress, or required native API style objects.
Use `classNames` from `@vibes/shared` for conditional or composed class names. Do not interpolate class names with template strings.

```tsx
// Good - with dark mode support
<button className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white px-4 py-2 rounded-lg transition-colors duration-200">

// Glass morphism pattern (existing design language)
<div className="glass p-4 rounded-xl hover:shadow-retro active:scale-95 transition-all">

// Responsive design
<div className="text-sm md:text-base lg:text-lg">

// Bad
<button style={{ backgroundColor: 'purple' }}>
```

## Component Guidelines

- Props interfaces defined above component
- Destructure props in function signature
- Export named components; framework route and entrypoint files may use required default exports
- Support dark mode
- Include proper focus states for accessibility
- Do not use ternaries to render JSX or DOM element branches. Use explicit `&&` conditions for each branch. Ternaries are allowed for scalar props, labels, and computed values.
- Do not explicitly pass `undefined` to JSX props. Use a conditional JSX spread to omit optional attributes.

```typescript
import { classNames } from '@vibes/shared';

interface ButtonProps {
  variant: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function Button({ variant, children, onClick, disabled }: ButtonProps) {
  return (
    <button
      className={classNames(
        'px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800',
        variant === 'primary'
          ? 'bg-primary text-white hover:bg-primary-dark dark:bg-primary-light dark:hover:bg-primary' 
          : 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
```

## Room Modes

Handle different room modes in the UI:

```typescript
// Server mode: Server controls playback automatically
if (room?.mode === 'server') {
  // Show play/pause controls for all users
  // Show skip voting UI
}

// Host mode: Only host can control playback
if (room?.mode === 'host') {
  if (room.hostId === userId || isAdmin) {
    // Show full playback controls
  } else {
    // Show limited UI (add songs, vote)
  }
}
```

## Casting Integration

Use the platform Cast store and its SDK service for discovery, connection and playback. Preserve the local receiver emulator used for development. Native apps use the official native Cast SDK. Do not replace either integration with custom media transport.

## Development Workflow

1. **Type Safety**: Run `pnpm typecheck` before committing
2. **Code Quality**: Run `pnpm lint` for formatting and linting
3. **API Integration**: Use `@vibes/api` for all API calls
4. **Error Handling**: Use `safeWrap`/`safeWrapAsync` utilities
5. **State Management**: Use Zustand stores for global state
6. **Styling**: Use Tailwind CSS v4 with dark mode support
7. **SSR**: Test both server-side rendering and client hydration
