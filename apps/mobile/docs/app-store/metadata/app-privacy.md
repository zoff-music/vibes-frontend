# App Privacy answers

These answers map Zoff's current mobile behavior and published privacy policy to
App Store Connect's App Privacy questionnaire. Reconfirm them whenever the app,
backend, analytics, or provider integrations change.

## Tracking

```text
Do you or your third-party partners use data from this app for tracking purposes? No
```

Zoff does not sell user data, serve targeted advertising, or combine app data
with third-party data for advertising or data-broker tracking.

## Data linked to the user

Zoff does not require an account or collect a real name. A pseudonymous session
identifier is nevertheless persistent enough that Apple can consider the
following data linked to a user. Declare conservatively:

| App Store data type | Collected | Linked | Tracking | Purpose |
| --- | --- | --- | --- | --- |
| User ID | Yes | Yes | No | App Functionality; Fraud Prevention |
| Other User Content | Yes | Yes | No | App Functionality |
| Product Interaction | Yes | Yes | No | App Functionality; Analytics |
| Search History | Yes | Yes | No | App Functionality; Analytics |
| Other Diagnostic Data | Yes | Yes | No | App Functionality |

**Other User Content** includes room names, room settings, queue entries,
votes, optional nicknames, and AI playlist prompts. **Product Interaction**
includes room and playback actions. **Other Diagnostic Data** includes request
timing and application logs.

## Data not linked to the user

| App Store data type | Collected | Linked | Tracking | Purpose |
| --- | --- | --- | --- | --- |
| Coarse Location | Yes | No | No | Fraud Prevention; App Functionality |

Coarse location may be inferred from an IP address for provider availability,
security, rate limiting, and abuse prevention. Zoff does not request precise
device location permission.

## Device data and permissions

- **Camera:** Optional. Used only to scan a Zoff remote-pairing QR code. Zoff
  does not upload or retain photos or video from the camera.
- **Local storage:** The selected room and remote pairing identifier are stored
  securely on the device so the app can restore them.
- **Network/device information:** IP address and user agent are processed for
  security, rate limiting, reliability, and debugging.
- **Provider data:** Searches and playback are sent to the enabled music
  provider. Provider processing is covered by its own privacy policy.

## Public privacy disclosures

```text
Privacy Policy URL: https://zoff.me/privacy-policy
Privacy contact: privacy@zoff.me
```

The live policy describes retention, deletion requests, provider processing,
AI playlist prompts, infrastructure, analytics, and international processing.
