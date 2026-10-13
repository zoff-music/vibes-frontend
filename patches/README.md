# Dependency patches

Security patches below are applied through `patchedDependencies` and checked by
the frozen install before the release audit. Their package versions still match
the advisory ranges, so the audit has three advisory-specific exceptions. No
package, severity, or scanner rule is globally excluded. Remove each patch and
its exception together when an upstream release includes the fix.

| Package | Advisory | Local fix and verification |
| --- | --- | --- |
| `node-forge@1.4.0` | [GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv) | Backports the nested DigestAlgorithm element-count validation from [upstream PR 1152](https://github.com/digitalbazaar/forge/pull/1152), revision `ceba34402e329f0365134f23fe19898756527d65`. The upstream malformed signature is accepted before and rejected after the patch. A valid RSA/SHA-256 signature still verifies. |
| `braces@3.0.3` | [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) | Implements the parser nesting bound recommended in [upstream issue 70](https://github.com/micromatch/braces/issues/70). Both braces and parentheses share a 100-level AST limit, so mixed nesting cannot bypass it. Overdeep patterns produce a bounded SyntaxError instead of exhausting the stack. Checked compile, expand, stringify, parse, the depth boundary, and normal/escaped/quoted patterns against the original package. Callers must still handle invalid-pattern errors, as with the existing length limit. |
| `sprintf-js@1.0.3` | [GHSA-hp3w-g68c-fv3c](https://github.com/advisories/GHSA-hp3w-g68c-fv3c) | Bounds numeric precision to the runtime's supported range: 0-100 for `e`/`f`, 1-100 for `g`. This prevents the precision RangeErrors described in [upstream issue 237](https://github.com/alexei/sprintf.js/issues/237), including `%.0g` and overflowing numeric strings. Checked each reported failure against the original package, valid precision boundaries, and normal string/integer formatting. |

These fixes affect dependency internals, not application API contracts. The
existing React Native patches remain separate platform compatibility fixes.
