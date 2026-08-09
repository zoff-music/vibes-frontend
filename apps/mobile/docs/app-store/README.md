# Zoff App Store submission packet

This directory is the source of truth for publishing the iOS app. It contains
only public, non-secret material that can be copied from `main` into App Store
Connect.

## Upload assets

- App icon: [`images/app-icon-1024.png`](./images/app-icon-1024.png)
- 6.9-inch iPhone screenshots: [`screenshots/iphone-6.9/`](./screenshots/iphone-6.9/)
- 13-inch iPad screenshots: [`screenshots/ipad-13/`](./screenshots/ipad-13/)
- Localized metadata: [`metadata/en-US.md`](./metadata/en-US.md)
- EAS metadata: [`metadata/store.config.json`](./metadata/store.config.json)
- App Review notes: [`metadata/app-review.md`](./metadata/app-review.md)
- App Privacy answers: [`metadata/app-privacy.md`](./metadata/app-privacy.md)
- Age rating guidance: [`metadata/age-rating.md`](./metadata/age-rating.md)
- Owner-only values still required: [`metadata/owner-values.md`](./metadata/owner-values.md)
- Final release checklist: [`release-checklist.md`](./release-checklist.md)

## Verified dimensions

| Asset | Files | Dimensions | Alpha |
| --- | ---: | ---: | --- |
| App icon | 1 | 1024 × 1024 | No |
| iPhone 6.9-inch | 6 | 1320 × 2868 | No |
| iPad 13-inch | 6 | 2064 × 2752 | No |

Apple accepts one to ten screenshots per device class. Zoff supports iPad, so
both the 6.9-inch iPhone and 13-inch iPad sets are included. Do not resize,
round, frame, or add transparency to these files before upload.

## Upload order

Use the numbered filename order in each screenshot directory:

1. Join or create a room
2. Player and shared queue
3. Create-room settings
4. Provider search and song addition
5. Remote pairing and controls
6. Room settings

No credentials, room passwords, pairing tokens, or private room names appear in
the included images.
