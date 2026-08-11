# Samsung TV Seller Office listing

## Application identity

- Name: `Zoff TV - Shared Music Queue`
- Category: Music
- Website: `https://zoff.me`
- Privacy policy: `https://zoff.me/privacy-policy`
- Support: `https://github.com/zoff-music/vibes-frontend/issues`

## Description

Join, create, browse, or generate a shared Zoff music room on a Samsung TV.
The TV displays the official provider player, upcoming queue, listeners, and a
QR code so guests can add songs and vote from their phones. No Zoff account is
required.

## Packaging checklist

1. Run `pnpm --filter @vibes/tv tizen:build`.
2. Import `apps/tv/dist/tizen` into Tizen Studio as an existing web project.
3. Use a private Samsung TV certificate profile registered for each test TV.
4. Validate the package with the current Samsung TV emulator and a physical TV.
5. Capture the Samsung screenshots listed in this directory at 1920×1080.
6. Build the signed WGT in Tizen Studio and upload it through Seller Office.

Tizen certificates and Seller Office credentials must never be committed. EAS
does not build or submit the Samsung package.
