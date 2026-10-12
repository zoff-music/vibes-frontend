import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import { TV_PLAYER_PATH } from '@vibes/shared/tv-player';

const output = new URL('../dist/tizen/', import.meta.url);
test('packaged entry uses classic scripts and the hosted player without a local service', async () => {
  const html = await readFile(new URL('tizen.html', output), 'utf8');
  assert.doesNotMatch(html, /type="module"/);
  assert.match(html, /id="zoff-startup"/);
  assert.match(html, /defer src="\.\/assets\/tizen-classic-[a-f0-9]+\.js"/);
  for (const match of html.matchAll(
    /(?:src|data-app-script)="\.\/([^" ]+\.js)"/g,
  )) {
    const script = await readFile(new URL(match[1], output), 'utf8');
    assert.doesNotThrow(() => new vm.Script(script));
    assert.doesNotMatch(script, /127\.0\.0\.1:34771|PlayerService/);
    if (match[1].includes('tizen-classic')) {
      assert(script.includes(TV_PLAYER_PATH));
      assert.doesNotMatch(script, /https:\/\/zoff\.me\/tv-player/);
    }
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
  assert.doesNotMatch(config, /tizen:service|web\.service|application\.launch/);
  assert(!(await readdir(output)).includes('service'));
});
