# App Store release checklist

## App record

- [ ] Create the App Store Connect record with bundle ID `me.zoff.mobile` and
      SKU `zoff-mobile-ios`.
- [ ] Add the public Apple ID as `submit.production.ios.ascAppId` in
      `apps/mobile/eas.json`.
- [ ] Select Music as the primary category and Social Networking as secondary.
- [ ] Set the app to Free and confirm territory availability.
- [ ] Complete the content-rights and age-rating questionnaires.
- [ ] Complete App Privacy using [`metadata/app-privacy.md`](./metadata/app-privacy.md).

## Metadata and assets

- [ ] Copy [`metadata/en-US.md`](./metadata/en-US.md) into the English (U.S.) localization.
- [ ] Upload [`images/app-icon-1024.png`](./images/app-icon-1024.png).
- [ ] Upload the numbered iPhone 6.9-inch screenshots in order.
- [ ] Upload the numbered iPad 13-inch screenshots in order.
- [ ] Add the reviewer notes and owner-only reviewer contact values.
- [ ] Open every public URL from a signed-out browser.

## Build verification

From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm --filter mobile lint
pnpm --filter mobile typecheck
pnpm dlx expo-doctor@latest apps/mobile
pnpm --filter mobile exec expo export --platform ios --output-dir /tmp/zoff-ios-export
```

- [ ] Test room creation, join, search, add, vote, skip, pause/play, and settings.
- [ ] Test light and dark appearance on iPhone and iPad.
- [ ] Test YouTube and SoundCloud playback for providers enabled in production.
- [ ] Test Spotify if it is globally enabled before submission.
- [ ] Test QR/manual remote pairing on physical devices.
- [ ] Test Google Cast discovery and playback on a physical device and receiver.
- [ ] Confirm no screenshots, logs, or metadata contain secrets or private room data.

## Build and submission

Create the production build only after the checklist above is complete:

```sh
cd apps/mobile
pnpm dlx eas-cli build --profile production --platform ios
pnpm dlx eas-cli submit --profile production --platform ios
```

The tag workflow uploads to TestFlight only. It does not submit a public App
Store version for review.
