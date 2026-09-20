# Capture status and remaining gaps

These captures exercise the real apps against public electro data. No chat,
queue, room settings, generation, or creation changes were submitted to make the
screenshots. Only local playback controls and device navigation were used.

## Ready captures

- Android phone: all ten numbered screens, including a clean playing room,
  chat, provider search results, and both settings screens.
- Android tablet: landing, playing room, creation, both settings screens,
  remote, browsing, AI entry, and a landscape room alternative.
- iPhone: landing, creation, provider search results, both settings screens,
  remote, browsing, and AI entry.
- iPad: landing, creation, both settings screens, remote, browsing, and AI entry.
- Android TV: landing, playing room and QR code, browsing, AI entry, and public
  room search results.
- The tablet `04-search.jpg` files show the search entry screen, not results.

## Do not upload yet

The `reference/needs-recapture` directories are diagnostic evidence, not store
assets.

- iPhone room and chat: the simulator's YouTube player remained on a buffering
  overlay. A local release build and app restart did not produce a clean player
  capture. The local Pause control changed to Play without crashing, but this
  does not establish successful media playback.
- iPad room and chat, including landscape: the player surface stayed white.
  Queue, room metadata, settings, and chat continued to render. Playback has not
  been verified in that simulator run.
- Android tablet chat: this capture uses submitted build 82 and shows the old
  settings-action formatting. Recapture it with the next native binary.
- Android tablet and iPad provider search: automation could open the sheet but
  did not get text into its input. Both accessibility-targeted and coordinate
  taps were attempted. Search results therefore remain unverified on tablets.

The iPad's rebuilt chat does show retained admin-setting messages as muted
activity without the normal chat colon. The backend and web fixes are deployed;
the native renderer needs a replacement store build before it is available to
installed mobile clients.

The rendering and input problems above have not been diagnosed as either
simulator-specific or device bugs. Do not treat these screenshots as evidence
that those flows passed, or replace the failed player with a composited image.
