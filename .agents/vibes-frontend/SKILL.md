# Frontend Skill

Use these rules for frontend work in this repository.

## Workflow

1. This repository is the frontend pnpm monorepo.
2. `apps/` contains runnable apps.
3. `packages/` contains reusable packages.
4. `packages/api` is the only frontend package that may import `wiretyped` or perform backend API/SSE wiring.
5. Put shared validation schemas and their derived types in `@vibes/models`.
6. Put shared utility helpers in `@vibes/shared`.
7. Read nearby route, component, hook, store, and package code before editing.
8. Run `pnpm lint`, `pnpm typecheck`, and the relevant focused tests before finishing.

## Monorepo

- Keep root `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `node_modules`, generated route types, and build output inside this repository.
- `apps/platform` is the React Router/Vite platform app.
- `apps/cast` is the cast receiver app.
- `apps/mobile` is the mobile app.
- `packages/api` owns backend API/SSE wiring and exported API hooks.
- `packages/models` owns shared types and Yup schemas.
- `packages/shared` owns utilities, hooks, stores, and constants such as `safeWrap`, `safeWrapAsync`, and playback state.
- `packages/ui` owns shared UI and player components.
- `packages/player` re-exports player UI where needed.
- Dependencies used across multiple workspaces should be workspace dependencies where appropriate.

## API Package

- Export and consume API helpers from `@vibes/api`.
- `packages/api` is the only package that may import `wiretyped`.
- Do not mention `wiretyped` outside `packages/api`; call exported clients/helpers API clients.
- Components must not call backend APIs directly. Backend API and SSE calls should happen in loaders, actions, or hooks exported from `@vibes/api`.
- Route components should use React Router `useFetcher`/`fetcher.Form` for mutations instead of calling API methods directly.
- Components and routes must not call `fetch()` directly.
- Backend routes, SSE handling, browser API wiring, and provider token handling live inside the API package or app-level services that consume it.
- Request/response schemas and derived types live inside `@vibes/models`.
- Frontend env access should be centralized, not scattered through components.
- Use `wiretyped` with Yup validation for backend API calls and SSE inside `packages/api`.
- Do not instantiate `EventSource` directly outside the approved API/SSE wiring.

## React Router

- Keep route files thin.
- Put route loaders in colocated `loader.ts` files.
- Put route actions in colocated `action.ts` files.
- Put route-specific components under `apps/platform/src/components` when they are not generally reusable.
- Keep app-level hooks under `apps/platform/src/hooks`.
- Keep app-level services under `apps/platform/src/services`.
- The platform app uses React Router with SSR and a custom TypeScript server. Server loaders/actions are allowed and should use `getServerApi()` so backend calls still go through `@vibes/api`.
- Avoid hydration mismatches and keep browser-only APIs behind client-side guards.

## Code Style

- Use Biome only.
- Use double quotes and 2-space indentation.
- Use early returns.
- Use `safeWrap` and `safeWrapAsync` from `@vibes/shared` instead of local `try/catch`.
- Only the implementations of `safeWrap` and `safeWrapAsync` are allowed to use `try/catch`.
- Prefer errors as values.
- Define types as `interface` or `type`; avoid inline function-signature object types.
- Avoid `any`, `// @ts-ignore`, `// @ts-expect-error`, and broad lint suppressions.
- Never return more than two values from a function.

## UI

- Keep the interface useful as the first screen; do not build a marketing landing page.
- Use restrained, scannable UI.
- Ensure interactive elements have `cursor-pointer` and visible hover/loading states.
- Keep Tailwind classes statically discoverable.
- Avoid arbitrary Tailwind values when built-in utilities are enough.
