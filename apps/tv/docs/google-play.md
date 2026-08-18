# Google Play listing

## Application identity

- Name: `Zoff TV - Shared Music Queue`
- Package: `me.zoff.tv`
- Category: Music & Audio
- Price: Free
- Website: `https://zoff.me`
- Privacy policy: `https://zoff.me/privacy-policy`
- Support: `https://github.com/zoff-music/vibes-frontend/issues`

## Short description

Turn your TV into a shared music room powered by your phone.

## Full description

Zoff TV brings shared music rooms to Android TV and Google TV. Join an existing
room, create a new room, browse active public rooms, or describe a playlist and
let Zoff generate it for you.

The television keeps the current provider player, upcoming songs, listener
count, and a scannable room QR code visible. Guests use their phones to add
songs and vote, so the remote can stay on the table.

Zoff uses the official embedded players and APIs for enabled third-party music
providers. No Zoff account is required.

## Release notes

Improves live room synchronization after network interruptions and long periods
of inactivity.

## Pre-release checklist

1. Run `pnpm --filter @vibes/tv validate` from the repository root.
2. Verify the development build on an Android TV emulator and a physical TV.
3. Confirm the Leanback launcher, 320×180 banner, landscape orientation, and
   remote focus order.
4. Verify YouTube and SoundCloud only when enabled by the backend.
5. Verify the QR code and all safe-area boundaries at 1920×1080.
6. Build the production AAB through EAS.
7. Upload the first AAB manually to Google Play before enabling API submission.
8. Keep signing credentials and service-account keys outside the repository.
