import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const output = new URL('../dist/tizen/', import.meta.url);
test('packaged entry uses classic scripts and includes its local service', async () => {
  const html = await readFile(new URL('tizen.html', output), 'utf8');
  assert.doesNotMatch(html, /type="module"/);
  assert.match(html, /id="zoff-startup"/);
  assert.match(
    html,
    /data-app-script="\.\/assets\/tizen-classic-[a-f0-9]+\.js"/,
  );
  for (const match of html.matchAll(
    /(?:src|data-app-script)="\.\/([^" ]+\.js)"/g,
  )) {
    const script = await readFile(new URL(match[1], output), 'utf8');
    assert.doesNotThrow(() => new vm.Script(script));
  }
  for (const name of await readdir(new URL('assets/', output))) {
    if (!name.endsWith('.css')) continue;
    assert.doesNotMatch(
      await readFile(new URL(`assets/${name}`, output), 'utf8'),
      /@layer\b/,
    );
  }
  const config = await readFile(new URL('config.xml', output), 'utf8');
  assert.match(config, /package="[a-zA-Z0-9]{10}"/);
  assert.match(config, /id="ZoffMusic0.PlayerService"/);
  const service = await readFile(new URL('service/player.js', output), 'utf8');
  assert.match(service, /127\.0\.0\.1/);
  assert.doesNotThrow(() => new vm.Script(service));
});
