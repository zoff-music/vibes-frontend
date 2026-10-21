# Dependency patches

The release audit runs without advisory exceptions. Dependency replacements and
patches are pinned in `pnpm-workspace.yaml` and the lockfile.

## Expo signing

The `@expo/cli@58.1.13` patch removes its use of `node-forge` and
`@expo/code-signing-certificates`. Matching version-scoped overrides remove those
dependencies only from the patched CLI version.

Manifest signing, signature verification, certificate signature verification, key
matching, and certificate validity checks use Node's native `node:crypto`.
`@peculiar/x509@2.1.0` handles certificate names, key-usage extensions, and CSR
encoding with Node WebCrypto. RSA/SHA-256 signatures, PKCS#1 private-key PEM,
PKCS#10 requests, Expo certificate caching, and iOS signing identity fields retain
their existing formats. Missing signing extensions and mismatched keys are rejected.

This removes the vulnerable Forge verifier described in
[GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv), rather than
suppressing the advisory. Reassess this patch and its dependency overrides together
when upgrading Expo CLI.

## Glob parsing

`braces` is replaced by the exact `@dieub/braces-depth-guard@3.0.3-pn.3` release.
Its runtime source was compared with upstream `braces@3.0.3`: it adds bounded
parser/AST depth, validates configurable limits, and detects parent cycles.
It retains the existing API and `fill-range` dependency. Deep braces, parentheses,
and mixed patterns are rejected before recursion can exhaust the stack, addressing
[GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).
Remove the override when upstream publishes an equivalent fix.

## YAML tooling

`js-yaml@4.3.2` replaces the old forced 3.x version. Expo's Podfile parser uses its
supported `load` API. This uses `argparse@2` and removes `sprintf-js` completely,
including the code affected by
[GHSA-hp3w-g68c-fv3c](https://github.com/advisories/GHSA-hp3w-g68c-fv3c).

The React Native patches remain separate platform compatibility fixes.
