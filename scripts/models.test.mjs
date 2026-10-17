import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { build } from 'esbuild';
import {
  cases,
  fingerprint,
  revive,
} from '../packages/models/tests/corpus.mjs';
import fixtures from '../packages/models/tests/fixtures.json' with {
  type: 'json',
};
import golden from '../packages/models/tests/golden.json' with { type: 'json' };

const result = await build({
  entryPoints: ['packages/models/src/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
});
const models = await import(
  `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].contents).toString('base64')}`
);

test('every public schema has a parity fixture', () => {
  const schemas = Object.entries(models)
    .filter(([, value]) => value?.['~standard'])
    .map(([name]) => name)
    .sort();

  assert.deepEqual(schemas, Object.keys(fixtures).sort());
});

for (const [name, fixture] of Object.entries(fixtures)) {
  test(`${name}: preserves Zod acceptance and output`, () => {
    const hash = createHash('sha256');
    let count = 0;

    for (const [, input] of cases(revive(fixture))) {
      const parsed = models[name]['~standard'].validate(input);
      assert(!(parsed instanceof Promise));
      hash.update(
        fingerprint(
          parsed.issues ? { invalid: true } : { value: parsed.value },
        ),
      );
      count++;
    }

    assert.equal(count, golden[name].cases);
    assert.equal(hash.digest('hex'), golden[name].sha256);
  });
}

test('default arrays are independent between parses', () => {
  const fixture = revive(fixtures.castDeviceSchema);
  delete fixture.capabilities;
  const first = models.castDeviceSchema['~standard'].validate(fixture);
  first.value.capabilities.push('modified');
  const second = models.castDeviceSchema['~standard'].validate(fixture);

  assert.deepEqual(second.value.capabilities, []);
});

test('preserves custom validation messages and nested issue paths', () => {
  const profile = models.updateSessionProfileRequestSchema[
    '~standard'
  ].validate({ name: ' ' });
  assert.equal(profile.issues[0].message, 'Enter a name.');
  assert.equal(profile.issues[0].path[0].key, 'name');
  const room = models.createRoomRequestV2Schema['~standard'].validate({
    name: 'x'.repeat(101),
  });
  assert.equal(
    room.issues[0].message,
    'Room names can be at most 100 characters.',
  );
});

test('URL validation and TV coercion do not depend on new browser URL APIs', () => {
  for (const url of [
    'https://example.com/a',
    'mailto:hello@example.com',
    'ftp://example.com',
    'not a URL',
  ]) {
    const parsed = models.providerURLQuerySchema['~standard'].validate({ url });
    assert.equal(Boolean(parsed.issues), url === 'not a URL');
  }

  const parsed = models.tvPlayerQuerySchema['~standard'].validate({
    video: 'dQw4w9WgXcQ',
    start: Symbol('invalid'),
  });
  assert(parsed.issues);
});
