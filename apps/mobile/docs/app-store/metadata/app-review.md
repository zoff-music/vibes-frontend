# App Review information

## Review notes

Copy this into **App Review Information → Notes**:

```text
Zoff is a shared music-room app. It does not require a Zoff account.

Basic review flow:
1. Open the Rooms tab.
2. Enter a new room name and tap Join room.
3. When the room does not exist, choose Create a new room and complete the native creation sheet.
4. Open Player, tap Add song, search an enabled provider, and add a result.
5. Use the queue vote button, playback controls, and room settings.

Zoff for iOS supports YouTube and SoundCloud. Provider access uses Zoff's registered provider API credentials and the providers' documented APIs. Search results contain provider metadata and links; Zoff does not host a third-party music catalog.

Playback is foreground-only and uses provider-maintained playback surfaces: the official YouTube IFrame Player integration and the official SoundCloud embedded player/widget. Zoff preserves the provider player, branding, controls, attribution, and outbound links. A listener can open the source on the provider's own service.

Zoff does not download, cache for offline use, extract, proxy, restream, transcode, record, or redistribute third-party audio or video. It does not expose direct media URLs or bypass advertising, access controls, territorial controls, embedding restrictions, or provider playback restrictions. Closing or backgrounding the playback experience does not provide background audio playback.

The shared room stores only queue metadata and playback coordination state. Each user's device requests playback from the provider through that provider's maintained player. Zoff's server never receives or relays the media stream.

The attached content-rights statement identifies the integrations and their public policy documentation. The app no longer includes the previously supported third provider.

Camera access is optional and is used only to scan a Zoff remote-pairing QR code. The same pairing flow can be completed by manually entering the code.

Google Cast requires a compatible receiver on the same network. Remote pairing and Cast are optional and are not required to review the primary room, search, queue, and playback flows.

The app has no hidden paid features, in-app purchases, or subscriptions.
```

## Sign-in information

```text
Sign-in required: No
Demo account: Not applicable
```

Do not put room-admin passwords, production secrets, provider credentials, or
remote pairing tokens in App Review notes.

The reviewer contact name, email, and telephone number are account-specific and
listed in [`owner-values.md`](./owner-values.md).
