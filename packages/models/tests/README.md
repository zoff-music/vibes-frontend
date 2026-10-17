# Schema compatibility corpus

`fixtures.json` contains one valid input for each of the 95 public schemas.
`corpus.mjs` recursively varies every field, including omitted and undefined
properties, nulls, primitive type mismatches, unknown keys, array holes, invalid
dates, non-finite numbers, unsafe integers, whitespace and oversized strings.

`golden.json` records the acceptance/output fingerprints from the original
Zod Mini 4.6.7 schemas at main commit
`c0c3c582f2e37fa9e6bf98a5668c2ca830b02927`, before the migration. The 16,789
cases were also compared individually using deep equality against Valibot.
The fingerprints retain undefined properties, dates and negative zero; they
do not compare library-specific error wording, issue codes or implementation
details. Separate tests cover custom application messages and issue paths.

Run from the workspace root:

```sh
node --test scripts/models.test.mjs scripts/model-transport.test.mjs
```

The tests bundle the actual public models and exercise Standard Schema, the
same interface used by WireTyped. Zod is not kept as a test/runtime dependency.
Transport tests use an injected local fixture fetcher, never the live API, and
dispose every client they create.

Do not regenerate fingerprints from the implementation under test just to make
a failing test pass. Review the changed contract and reproduce the failing
case against the original schemas or an explicitly approved API change.
