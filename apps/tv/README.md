# Zoff TV

Zoff TV provides the Cast-style Zoff room experience as a dedicated television
application for Android TV and Samsung Tizen TVs. The two targets share the
typed room/session hook, `@vibes/api`, `@vibes/models`, and Zustand room stores,
but render with target-appropriate UI primitives:

- Android TV uses Expo, NativeWind, React Native TV focus handling, and official
  provider WebViews.
- Samsung TV uses a Tizen web package with Tailwind, spatial remote navigation,
  and official provider iframes.

The queue is intentionally bounded to five visible rows. Viewers scan the QR
code to add songs and vote from another device rather than manipulating a long
queue with the television remote.

tvOS is intentionally not targeted. Apple TV does not expose a WebView, so it
cannot run YouTube's required official IFrame Player. Extracting direct YouTube
media streams is not a supported or policy-compliant replacement.

## Features

- Join or create a room by name.
- Generate a new room and playlist from the AI prompt toggle.
- Browse up to six currently active public rooms.
- Live room, listener, playback, generation, and queue updates over SSE.
- Official YouTube, SoundCloud, and Spotify provider surfaces.
- Cast-style current track, five-song queue, listener count, votes, and a QR
  code linking directly to the room.
- Directional focus and visible focus feedback for television remotes.

## Install and validate

From the repository root:

```sh
pnpm install
pnpm --filter @vibes/tv lint
pnpm --filter @vibes/tv typecheck
pnpm --filter @vibes/tv validate
```

The production API defaults to `https://zoff.me`. Override it for a reachable
local backend:

```sh
EXPO_PUBLIC_API_URL=http://192.168.1.20:8080 pnpm --filter @vibes/tv start
VITE_API_URL=http://192.168.1.20:8080 pnpm --filter @vibes/tv tizen:dev
```

## Android TV

Expo Go does not support television projects. Generate and run a development
build instead:

```sh
pnpm --filter @vibes/tv android:prebuild
EXPO_TV=1 pnpm --filter @vibes/tv android
```

The config plugin marks Leanback as required, disables the touchscreen
requirement, installs the 320×180 TV banner, and registers the Leanback launcher
activity. Use an Android TV emulator or physical Android/Google TV device.

## Samsung Tizen

Build the self-contained Tizen web package:

```sh
pnpm --filter @vibes/tv tizen:build
```

The output is written to `apps/tv/dist/tizen` and includes `config.xml`, the
application icon, bundled Pixelify Sans font, JavaScript, and CSS. In Tizen
Studio:

1. Import `apps/tv/dist/tizen` as an existing Tizen web project.
2. Select the Samsung TV certificate profile for the target device.
3. Build the signed package and run it on a TV emulator or registered device.

The Tizen target uses `tizen.html` as its configured entry point and requires
the Internet privilege for the Zoff API and provider players.

## Visual review

Store submission and review screenshots belong in [`docs`](./docs/README.md).
Capture both landing and active-room states at 1920×1080 after verifying focus,
text truncation, QR readability, and official provider controls.
