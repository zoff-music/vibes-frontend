# `@vibes/native-router`

A small React Native data runtime for the mobile and Android TV apps. It mirrors
the React Router data vocabulary without importing React Router's DOM/framework
entrypoint, which cannot be bundled by Expo/Hermes.

The mobile manifest discovers Expo Router's route files directly. Those files
remain the single navigation owner and compose the screen with the same named
data functions used by the web apps:

```tsx
import { Route } from '@vibes/native-router';
import { RoomScreen } from '@/routes/rooms.$id/component';

export { loader } from './loader';

export default function RoomRoute() {
  return (
    <Route routeId="rooms.$id">
      <RoomScreen />
    </Route>
  );
}

export function shouldRevalidate() {
  return false;
}
```

Substantial rendering stays in screen components, while the Expo file owns the
route boundary and its data exports. Loader/action-only modules use the
`resource.ts` name and are reserved for genuine resource routes submitted to or
loaded by a rendered route.

Views read route data with `useLoaderData` or `useRouteLoaderData`, read the
current action result with `useActionData`, and request explicit refreshes with
`useRevalidator`. `useFetcher` returns a two-part `[state, operations]` tuple;
the operations expose `Form`, `load`, and `submit` while state exposes the
current data, public error, and navigation state.

Session routes can opt into `persistent` lifecycle semantics. Their loader and
action state survives temporary unmounts until the application explicitly calls
`router.disposeRoute(routeId, params)`. Mobile uses this for the active room:
the retained Expo tab keeps the player component mounted across Add, Settings,
and Remote navigation, while Leave is the single explicit disposal boundary.
When an action already returns the next route snapshot, `hydrateRoute` seeds the
persistent loader state so mounting it does not repeat the same REST reads.

The package is transport-free. REST clients and request capabilities belong in
route `loader.ts` and `action.ts` modules. SSE connections intentionally remain
in the focused hooks exported by `@vibes/api`: a loader has no portable
unmount/disposal contract, so returning a live connection from loader data can
leak or retain the wrong authenticated subscription after navigation.
