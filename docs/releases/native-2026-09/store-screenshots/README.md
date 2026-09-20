# Store screenshots for mobile 0.4.0 and TV 0.2.0

Fresh full-flow captures for the September 2026 native release, including rooms,
chat, music search, creation, room settings, device settings, remote pairing,
browsing, and the AI entry screen.

The complete replacement packet is not ready yet. The capture run exposed iOS
player-rendering and tablet search-input problems. Failed captures are separated
under `reference/needs-recapture` and must not be uploaded. See
[capture issues](capture-issues.md) for the remaining gaps.

The assets are provided for manual store upload. This packet does not upload
store metadata or submit another binary.

## Upload folders

| Store destination | Folder | Capture size |
| --- | --- | --- |
| App Store Connect, 6.9-inch iPhone | [iphone-6.9](iphone-6.9/) | 1320 × 2868 |
| App Store Connect, 13-inch iPad | [ipad-13](ipad-13/) | 2064 × 2752; landscape alternatives 2752 × 2064 |
| Google Play, phone | [android-phone](android-phone/) | 1080 × 2400 |
| Google Play, tablet | [android-tablet](android-tablet/) | 1600 × 2560; landscape alternatives 2560 × 1600 |
| Google Play, Android TV | [android-tv](android-tv/) | 1920 × 1080 |

## Phone and tablet sequence

| File | Screen |
| --- | --- |
| `01-landing.jpg` | Join or create a room |
| `02-room.jpg` | Live player and shared queue, where capture passed |
| `03-chat.jpg` | Room chat and composer, where capture passed |
| `04-search.jpg` | Provider search results on phones; search entry on tablets |
| `05-create-room.jpg` | Room creation and configuration |
| `06-room-settings.jpg` | Room settings and admin access |
| `07-device-settings.jpg` | Name, chat preference, appearance, and local player |
| `08-remote.jpg` | Remote pairing entry |
| `09-browse.jpg` | Browse public rooms |
| `10-generate-room.jpg` | AI playlist prompt entry |

Use this order once the missing captures have been replaced. For Google Play,
a compact selection is 01, 02, 03, 04, 05, 07, 08, and 09. Additional files are
alternatives or reference captures, not extra required uploads. Version evidence
and scrolled settings are kept in each device's `reference` directory.

The existing [App Store submission packet](../../../../apps/mobile/docs/app-store/README.md)
also points here. Its older compatibility screenshots remain separate and should
not be mixed into a new full-release set to fill the missing captures.

## Television sequence

The TV folder covers the TV product's actual flow: landing, a playing room with
its bounded queue and QR code, public-room browsing, AI prompt entry, and public
room search. The TV product does not have the phone's separate chat, device
settings, or remote-pairing screens.

| File | Screen |
| --- | --- |
| `01-landing.jpg` | Room entry and live rooms |
| `02-room.jpg` | Playing room, queue, and join QR code |
| `03-browse.jpg` | Public-room browser |
| `04-generate-room.jpg` | AI playlist prompt entry |
| `05-search.jpg` | Public-room search results |

## Capture details

- iPhone and iPad use a local release-mode simulator build of the 0.4.0 source.
- The iPad build includes the subsequent settings-activity rendering fix. That
  native fix still requires a new store binary; it is not in submitted build 68.
- Android phone and tablet use the submitted 0.4.0 production bundle, build 82.
- Android TV uses the submitted 0.2.0 production bundle, build 28.
- Android bundles are locally signed with a test key only for emulator installation.
- Screens show real public-room data, which changes over time.
- The room captures use electro without changing its queue, settings, or chat.
- Creation, generation, and remote screenshots show their entry flows. No new
  room, generated playlist, or remote pairing was submitted for these captures.
- Images are unframed and unscaled opaque JPEGs, with no alpha channel.
- No private rooms, credentials, or pairing tokens are included.

Do not use the older draft or landing-only packets to fill gaps. Nothing in this
packet has been uploaded to either store automatically.

Dimensions were checked against Apple's
[screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications)
and Google's
[preview asset guidance](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en-GB).
