# Zoff Mobile

Native Expo app for Zoff rooms and remotes. It uses the same typed `@vibes/api`,
`@vibes/models`, and shared safety utilities as the web apps, while rendering
native iOS and Android controls. The queue uses React Native's virtualized
`FlatList` with a bounded render window, so a large room does not mount every
song at once.

Native colors and spacing mirror the values in `packages/tailwind/theme.css`.
NativeWind compiles the shared Tailwind 4 theme into React Native styles; no
DOM-oriented UI components are shipped in the native bundle.

## Included flows

- Join, create, and change rooms, including protected rooms and currently active
  public rooms.
- Play, pause, host seek, skip, vote, search, and add songs or provider
  playlists from pasted links.
- Official embedded players for enabled YouTube, Spotify, and SoundCloud
  tracks. YouTube uses `react-native-youtube-iframe`, which wraps the official
  IFrame Player API and exposes player state, error, and seek controls to the
  native app.
- Google Cast discovery and the Zoff custom receiver handshake.
- Pair a remote by QR code or one-time code and control the paired machine.
- Authenticate as a room admin and update room mode, queue behavior, public
  visibility, and enabled providers from native room-settings sheets.
- Native system tabs: iOS uses the system tab bar and Liquid Glass where the OS
  supports it; Android uses its platform-native tab presentation. Search,
  creation, and other transient tasks use native page-sheet/modal presentation
  instead of web-style popovers.
- Automatic light/dark appearance based on the device setting.

## Requirements

- Node.js 18 or newer and the repository's pinned pnpm version.
- Xcode, CocoaPods 1.15.2 or newer, and an iOS simulator; or Android Studio
  with an Android emulator.
- A physical device is recommended for Cast and QR testing.
- The phone and Cast device must be on the same Wi-Fi network.

Google Cast is a native module and is not available in Expo Go. Use a development
build for meaningful testing.

## Install

From the repository root:

```sh
pnpm install
pnpm --filter mobile typecheck
pnpm --filter mobile lint
```

The app uses `https://zoff.me` by default. To use a local backend, expose the Go
API on an address reachable by the simulator or phone and set:

```sh
EXPO_PUBLIC_API_URL=http://192.168.1.20:8080 pnpm --filter mobile start
```

Do not use `localhost` for a physical phone; it refers to the phone itself.

## Run a development build

Generate native projects and launch locally:

```sh
pnpm --filter mobile exec expo prebuild --clean
pnpm --filter mobile exec expo run:ios
# or
pnpm --filter mobile exec expo run:android
```

After the first native build, start Metro with:

```sh
pnpm --filter mobile start -- --dev-client
```

Test at least these flows before publishing:

1. Join a room and confirm its provider list, current song, and queue load.
2. Search each enabled provider, add a result, vote, pause/play, seek, and skip.
3. Queue several hundred fixture rows and confirm scrolling stays smooth and
   memory remains stable.
4. Pair a web machine using both QR and one-time-code paths; change playback and
   confirm the machine follows without counting the remote as a listener.
5. Connect to a Cast device and confirm the receiver joins the selected room.
6. Test light and dark device appearances on both iOS and Android.

## EAS development and preview builds

Install and authenticate the EAS CLI, then associate the project with the Zoff
Expo organization on the first run:

```sh
pnpm dlx eas-cli login
pnpm dlx eas-cli init
pnpm dlx eas-cli build --profile development --platform ios
pnpm dlx eas-cli build --profile development --platform android
```

Internal release-candidate builds use the `preview` profile:

```sh
pnpm dlx eas-cli build --profile preview --platform all
```

## Initialize Expo and App Store Connect

The Expo project and Apple credentials must be created by an authenticated
project owner. None of these credentials belong in this public repository.

From `apps/mobile`:

```sh
pnpm dlx eas-cli login
pnpm dlx eas-cli init
pnpm dlx eas-cli credentials --platform ios
```

During credential setup, configure an App Store Connect API key for EAS Submit.
Store the key in EAS credentials, not in Git, `.env`, `app.json`, `eas.json`, or
the workflow file. Once the App Store Connect app record exists, add its public
Apple ID as `submit.production.ios.ascAppId` in `eas.json`.

Link the GitHub repository from the Expo project dashboard before enabling the
tag-triggered workflow.

## Automated TestFlight releases

`apps/mobile/.eas/workflows/testflight.yml` builds an iOS production binary and
uploads it to TestFlight when a matching release tag is pushed:

```sh
git tag mobile-v0.2.0
git push origin mobile-v0.2.0
```

Do not push a matching tag until Apple credentials, the App Store Connect app
record, TestFlight information, and internal tester groups have been verified.
The workflow uploads to TestFlight only. It does not submit a version for public
App Store review.

For a dry run that creates no build and performs no submission, validate the
workflow after logging in:

```sh
pnpm dlx eas-cli workflow:validate .eas/workflows/testflight.yml
```

## Publish to Apple and Google

Before the first store build:

1. Confirm ownership of the bundle/package ID `me.zoff.mobile` in Apple
   Developer and Google Play Console.
2. Run `eas init` and commit the generated Expo project ID if it is not already
   present. Do not copy a project ID from another app.
3. Configure signing credentials through EAS, privacy declarations, store
   screenshots, support URL, and the Zoff privacy-policy URL.
4. Verify the registered Cast receiver `1FAF5D9F` remains published and that its
   sender configuration permits the production iOS and Android apps.
5. Complete provider-policy review. YouTube, Spotify, and SoundCloud playback is
   intentionally rendered through their official controls; do not replace it
   with extracted media URLs.
6. Review the copy-ready App Store packet in `docs/app-store/`, including its
   screenshots, metadata, privacy answers, age rating, review notes, and final
   release checklist.

Create and submit production builds:

```sh
pnpm dlx eas-cli build --profile production --platform all
pnpm dlx eas-cli submit --profile production --platform ios
pnpm dlx eas-cli submit --profile production --platform android
```

Store submission is intentionally not automated from CI until the Apple team,
Google Play service account, and final store metadata are configured by the app
owner.
