# `@vibes/native-router`

A small React Native data runtime for the mobile and Android TV apps. It mirrors
the React Router data vocabulary without importing React Router's DOM/framework
entrypoint, which cannot be bundled by Expo/Hermes.

Route modules are discovered by each app's Metro `require.context` manifest and
export the same named data functions used by the web apps:

```ts
export { action } from './action';
export { loader } from './loader';

export function shouldRevalidate() {
  return false;
}
```

Views read route data with `useLoaderData` or `useRouteLoaderData`, submit
mutations with `useFetcher`/`fetcher.Form`, read the current action result with
`useActionData`, and request explicit refreshes with `useRevalidator` or
`fetcher.load`.

The package is transport-free. REST clients and request capabilities belong in
route `loader.ts` and `action.ts` modules. SSE connections intentionally remain
in the focused hooks exported by `@vibes/api`: a loader has no portable
unmount/disposal contract, so returning a live connection from loader data can
leak or retain the wrong authenticated subscription after navigation.
