---
name: vibes-frontend
description: Build, refactor, review, or debug the Vibes frontend monorepo, including React Router web apps, the native Expo mobile app, shared TypeScript packages, API boundaries, Biome, Tailwind, and NativeWind.
---

# Vibes Frontend

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
- `apps/admin` is the React Router/Vite admin app.
- `apps/cast` is the cast receiver app.
- `apps/embed` is the standalone SSR embed player.
- `apps/mobile` is the native-only Expo Router app for Android and iOS. It has no web target.
- `packages/api` owns backend API/SSE wiring and exported API hooks.
- `packages/models` owns shared types and Yup schemas.
- `packages/shared` owns utilities, hooks, stores, and constants such as `safeWrap`, `safeWrapAsync`, and playback state.
- `packages/ui` owns shared UI and player components.
- `packages/serve` owns shared TypeScript server, metrics, and tracing utilities.
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

## Native Mobile

- Keep Expo Router route files under `apps/mobile/src/app` thin. Routes may use the default exports Expo Router requires; move stateful workflows into hooks and substantial UI into components.
- Put native components in `apps/mobile/src/components`, app hooks in `apps/mobile/src/hooks`, and native infrastructure in `apps/mobile/src/lib` or providers.
- Do not import DOM-based `@vibes/ui` components into the mobile app. Reuse models, API clients, and non-DOM helpers from the shared packages.
- Consume backend operations through hooks from `@vibes/api`. The native transport may inject `expo/fetch` only when constructing the shared API client; screens and components must never call endpoints with `fetch` directly.
- Keep authentication and persisted native preferences in Expo SecureStore rather than browser storage.
- Keep room-wide state in `AppProvider`, but extract self-contained workflows such as controller remotes and machine pairing into focused hooks.
- Keep provider playback and remote synchronization behind dedicated components/hooks; do not duplicate timing or API behavior in routes.
- The app is Android/iOS only. Do not add Expo web configuration, `react-native-web`, `react-dom`, web scripts, or browser favicon assets.

## Code Style

- Use Biome only.
- Use single quotes and 2-space indentation.
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
- Do not use ternaries to render JSX or DOM element branches. Render each branch with an explicit `&&` condition. Ternaries remain allowed for scalar values such as props, labels, and computed data.
- Do not explicitly pass `undefined` to JSX props. Omit optional attributes with a conditional JSX spread instead.
- Ensure interactive elements have `cursor-pointer` and visible hover/loading states.
- Keep Tailwind classes statically discoverable.
- Avoid arbitrary Tailwind values when built-in utilities are enough.
- In `apps/mobile`, use NativeWind `className` utilities for all static layout, spacing, sizing, color, and typography. Inline React Native styles are reserved for runtime-calculated geometry or values required by a native API.
- Preserve native accessibility roles, labels, focus behavior, safe areas, and platform interaction conventions.
