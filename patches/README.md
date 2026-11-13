# Dependency patches

The release audit runs without advisory exceptions. Overrides and compatibility
patches are pinned in `pnpm-workspace.yaml` and the lockfile.

## Remaining security overrides

- `@react-native-tvos/config-tv` still requests `glob` 11. The override selects
  14.0.6 because cancellation is fixed in 14.0.2 and later:
  [GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4).
- Expo's fingerprint tooling still requests `minimatch` 10. The override selects
  11.0.8 because globparts amplification is fixed in 11.0.1 and later:
  [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249).

Remove these overrides when the corresponding upstream dependency ranges accept
fixed versions. The React Native screens and WebView patches are separate
platform compatibility fixes.

## Retired security workarounds

The November 2026 dependency refresh resolves `node-forge` 1.4.3 through Expo CLI
58.1.20's normal dependency range. Forge's upstream fixes replace the local Expo
signing implementation, so its patch, dependency removals and injected
`@peculiar/x509`/`reflect-metadata` dependencies are removed together. See the
[Forge changelog](https://github.com/digitalbazaar/forge/blob/v1.4.3/CHANGELOG.md)
and [original advisory](https://github.com/advisories/GHSA-86w9-cpqp-85rv).

The `braces` fork is also removed: its
[advisory was withdrawn](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
on October 23, 2026 as not practically exploitable. This is an advisory withdrawal,
not a claim that upstream added the fork's depth guard.

The other former version overrides resolve without advisories through upstream
ranges. Regenerating the lockfile without security overrides exposed only the
`glob` and `minimatch` issues above; restoring those two yields a clean audit.
