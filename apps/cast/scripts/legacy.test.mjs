import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';
import { Script } from 'node:vm';

test('production receiver retains the legacy loader, polyfills and lazy chunks', async () => {
  const html = await readFile(
    new URL('../dist/index.html', import.meta.url),
    'utf8',
  );
  const assets = await readdir(new URL('../dist/assets/', import.meta.url));

  for (const id of ['vite-legacy-polyfill', 'vite-legacy-entry']) {
    const tag = html.match(new RegExp(`<script[^>]+id="${id}"[^>]*>`))?.[0];
    assert(tag, `Missing ${id}`);
    assert.match(tag, /nomodule/);
    const url = tag.match(/(?:data-src|src)="([^"]+)"/)?.[1];
    assert(url, `Missing URL for ${id}`);
    assert(assets.includes(url.split('/').at(-1)), `Missing file for ${url}`);
  }

  const chunks = assets.filter(
    (name) =>
      name.includes('-legacy-') &&
      name.endsWith('.js') &&
      !name.startsWith('polyfills-'),
  );
  assert(chunks.length >= 3, 'Expected legacy entry and provider chunks');

  for (const name of chunks) {
    const source = await readFile(
      new URL(`../dist/assets/${name}`, import.meta.url),
      'utf8',
    );
    const registrations = [];
    new Script(source, { filename: name }).runInNewContext({
      System: { register: (...args) => registrations.push(args) },
    });
    assert.equal(
      registrations.length,
      1,
      `${name} must register as a classic SystemJS script`,
    );
  }
});
