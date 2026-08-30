---
name: vibes-frontend
description: Build, refactor, review, or debug the Vibes TypeScript frontend monorepo, including React Router SSR web apps, Expo mobile and Android TV apps, Samsung Tizen TV, Chromecast, shared UI platform boundaries, API integration, Biome, Tailwind, and NativeWind.
---

# Vibes Frontend

Apply these repository-specific rules together with `AGENTS.md`.

## Public Repository References

- Keep documentation and skill guidance portable: identify related repositories by their GitHub owner/name, never by a contributor's local filesystem path.
- Do not mention private repositories, private deployment configuration, or private checkout layouts in this public repository.

## Workflow

1. Identify the target runtime before editing: DOM web, native mobile, Android TV, Tizen TV, or Cast.
2. Read the target app's README, nearby code, and package exports.
3. Preserve the `@vibes/ui/web`, `@vibes/ui/native`, and `@vibes/ui/shared` boundaries.
4. Keep routes and entrypoints thin; move workflows into hooks and substantial rendering into components or screens.
5. Run `pnpm lint`, `pnpm typecheck`, and the target app's `validate` or focused tests.

## Workspace Map

- `apps/platform`: primary React Router SSR room application.
- `apps/admin`: React Router SSR administration application.
- `apps/embed`: standalone React Router SSR embed player.
- `apps/remote`: lightweight React Router SSR paired-controller web app.
- `apps/cast`: Chromecast receiver.
- `apps/mobile`: native-only Expo Router app for iOS and Android phones/tablets.
- `apps/tv`: one TV product with a shared session layer, delivered through an Expo Android TV renderer and a Samsung TV DOM renderer.
- `packages/api`: the transport package and the only package that owns `wiretyped`, backend REST calls, typed request capabilities, SSE plumbing, and narrowly scoped reusable SSE hooks.
- `packages/models`: shared compiled Zod 4 schemas and derived domain types.
- `packages/shared`: platform-neutral utilities, hooks, stores, constants, and safe wrappers.
- `packages/ui/web`: DOM components and provider players.
- `packages/ui/native`: React Native primitives and official native provider-player wrappers shared by mobile and Android TV.
- `packages/ui/shared`: icons, provider metadata, formatting, playback calculations, and other renderer-neutral presentation behavior.
- `packages/serve`: shared SSR server, metrics, and tracing utilities.

## Platform Boundaries

- Import DOM renderers only from `@vibes/ui/web`.
- Import React Native renderers only from `@vibes/ui/native`.
- Put behavior that has no DOM or React Native dependency in `@vibes/ui/shared`.
- Do not make one app import components from another app.
- Move a control into `@vibes/ui/native` only when mobile and Android TV genuinely share its behavior and presentation contract. Keep phone sheets, system tabs, TV focus layouts, and other platform-specific composition inside their apps.
- Use official provider players and SDKs. Never extract media streams to bypass platform limits.

## Mobile

- Treat `apps/mobile` as Android/iOS only. Do not add Expo web config, `react-dom`, `react-native-web`, a web script, or favicon assets.
- Keep Expo Router files under `apps/mobile/src/app` as small adapters. Default exports are allowed where Expo Router requires them.
- Put screen fragments in `src/components`, stateful workflows in `src/hooks`, API construction in `src/lib`, and room-wide state in providers.
- Split independent workflows out of `AppProvider`; do not turn the provider into a collection of unrelated API state machines.
- Inject `expo/fetch` only while constructing the shared API client. Native runtime hooks compose React-free request capabilities and may consume reusable SSE hooks from `@vibes/api`; screens and components must not call endpoints directly.
- Persist tokens and preferences with Expo SecureStore, not browser storage.
- Preserve native system tabs, sheets, safe areas, tablet layouts, Cast behavior, QR scanning, and background playback.
- Use a config plugin under `apps/mobile/plugins` for generated native-project mutations. Do not commit generated `ios` or `android` projects or stray root Expo config files.

## TV

- Android TV uses Expo, `react-native-tvos`, NativeWind, directional focus, and `@vibes/ui/native`.
- Samsung TVs require a DOM runtime with its own React Router data route, entrypoint, CSS, spatial navigation, `config.xml`, and store packaging under `apps/tv`; this is a delivery boundary within the same TV app, not a separate product.
- Share app-owned domain hooks between the TV renderers, not UI trees. Keep REST capabilities in `@vibes/api` React-free; reusable SSE lifecycle hooks may also live there.
- Keep the cross-renderer room lifecycle in `useTvSession` with an exported `TvSession` contract. Keep provider surfaces, queue measurement, and focus/navigation in renderer-specific components.
- Design TV screens for ten-foot viewing: large type, strong focus feedback, bounded queues, and no touch-only interaction.
- Verify Leanback launcher metadata, touchscreen optionality, banner assets, and directional focus after Android TV prebuild.

## Web and SSR

- Use React Router data APIs in every DOM app, including the Cast receiver and Samsung Tizen. REST reads belong in `loader` or `clientLoader` modules and mutations belong in `action` or `clientAction` modules.
- Components may trigger route data APIs through fetchers and may subscribe to SSE through `@vibes/api`; they must not execute REST calls inline.
- Keep React Router route files thin and colocate route-specific components, `loader.ts`, and `action.ts` files.
- Use `getServerApi()` in server loaders/actions and `useFetcher` or `fetcher.Form` for route mutations.
- Keep browser-only APIs behind client guards and prevent hydration mismatches.
- Preserve content-hashed assets and the pnpm workspace build system.

## API and Errors

- `@vibes/api` may export reusable hooks only for SSE subscription lifecycle. REST/request hooks, providers, stores, and application state orchestration are forbidden.
- Keep REST capabilities, clients, error helpers, and SSE transport functions React-free. SSE hooks may own effects, callback refs, subscription cleanup, and reconnection notification, but state updates remain callback-driven and app-owned.
- Use exports from `@vibes/api` for every backend call and SSE subscription.
- Never call `fetch`, instantiate `EventSource`, or import `wiretyped` outside approved API-client construction.
- Do not wrap `@vibes/api` calls; they already return `[error, data]`.
- Use `safeWrap` or `safeWrapAsync` from `@vibes/shared` instead of `try/catch`.
- Destructure `safeWrapAsync` as `[error, data]`.
- Put request/response schemas and derived types in `@vibes/models`.

## TypeScript and Components

- Use Biome, single quotes, 2-space indentation, explicit types, and early returns.
- Do not use `any`, `@ts-ignore`, `@ts-nocheck`, broad suppressions, or more than two return values.
- Define props above components and use named exports, except framework-required route/entrypoint defaults.
- Do not render JSX branches with ternaries. Ternaries are allowed for scalar labels, props, and computed values.
- Omit optional JSX attributes with conditional spreads instead of passing `undefined`.

## Styling and Accessibility

- Use Tailwind v4 for DOM apps and NativeWind for React Native apps.
- Keep classes statically discoverable and compose them with `classNames` from `@vibes/shared`.
- Use classes for all static spacing, sizing, color, typography, borders, positioning, and layout.
- Use inline React Native styles only for measured/runtime geometry, percentage progress, native API style objects, or focus transforms that cannot be static classes.
- Prefer built-in utilities over arbitrary values.
- Preserve dark mode, accessible names/roles, visible focus, loading states, safe areas, and target-specific interaction behavior.

## Validation

Run from the repository root:

```sh
pnpm lint
pnpm typecheck
```

Also run the target validation command, for example:

```sh
pnpm --filter @vibes/mobile validate
pnpm --filter @vibes/tv validate
```
