# Zoff Remote

The lightweight web controller for pairing with and operating another Zoff
screen. Visitors can scan the displayed QR code or enter a remote ID and
pairing code manually.

## Visual preview

![Zoff Remote pairing screen](./docs/pairing.png)

## Development

From the repository root:

```sh
pnpm --filter @vibes/remote dev
```

The development server runs at `http://localhost:3007/remotes/join`.

Validate the app with:

```sh
pnpm --filter @vibes/remote lint
pnpm --filter @vibes/remote typecheck
pnpm --filter @vibes/remote build
```

## Loading and compilation

React Compiler processes app components and shared DOM controls. The Latin font
is preloaded in HTML and early response hints, with other supported glyphs
loaded on demand. Safe multi-pass minification and build-time Brotli/gzip
compression reduce transfers without changing the browser target. The shared
server retains content types, encoding negotiation, and immutable asset caching.
