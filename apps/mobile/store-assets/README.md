# App Store screenshots

Keep final, unedited simulator captures in this directory. Do not include
credentials, admin passwords, pairing tokens, or private room names in any
screenshot.

Capture the 6.9-inch iPhone set at one of Apple's supported portrait sizes:
`1260 x 2736`, `1290 x 2796`, or `1320 x 2868` pixels. Include these screens in
both light and dark appearance where useful:

1. Rooms and public-room discovery
2. Room creation sheet
3. Player and virtualized queue
4. Provider search and add-song sheet
5. Remote pairing and remote playback controls
6. Room settings

With the intended simulator booted:

```sh
mkdir -p store-assets/iphone-6.9
xcrun simctl io booted screenshot store-assets/iphone-6.9/01-rooms.png
```

Screenshots must not have alpha transparency. Confirm the exact pixel
dimensions against Apple's current screenshot specification before upload.
