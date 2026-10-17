import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { build } from 'esbuild';

test('native tabs leave content insets to the screens safe-area layout', () => {
  const tabs = readFileSync(
    'apps/mobile/src/components/layout/app-tabs.tsx',
    'utf8',
  );
  const triggers = tabs.match(/<NativeTabs\.Trigger\s[^>]*>/g);

  assert.equal(triggers.length, 4);

  for (const trigger of triggers) {
    assert.match(trigger, /disableAutomaticContentInsets/);
  }

  assert.match(
    readFileSync('apps/mobile/src/components/layout/root-content.tsx', 'utf8'),
    /<SafeAreaProvider initialMetrics=\{initialWindowMetrics\}>/,
  );

  for (const file of [
    'rooms/rooms-screen',
    'remote/remote-pairing',
    'settings/settings-screen',
  ]) {
    const screen = readFileSync(
      `apps/mobile/src/components/${file}.tsx`,
      'utf8',
    );

    assert.match(screen, /contentInsetAdjustmentBehavior="never"/);
  }
});

test('native apps use their Expo entrypoints without a second route tree', () => {
  assert.equal(existsSync('apps/mobile/src/routes'), false);
  assert.equal(existsSync('apps/tv/src/routes'), false);
  assert.equal(
    JSON.parse(readFileSync('apps/mobile/package.json', 'utf8')).main,
    'expo-router/entry',
  );
  assert.match(
    readFileSync('apps/tv/src/index.ts', 'utf8'),
    /registerRootComponent/,
  );
  assert.ok(existsSync('apps/tv/src/tizen/routes/_index/route.tsx'));
});

test('Expo native intent keeps room and remote deep links after relocation', async () => {
  const result = await build({
    entryPoints: ['apps/mobile/src/utils/redirect-system-path.ts'],
    alias: { '@vibes/shared': resolve('packages/shared/src/wrap.ts') },
    bundle: true,
    format: 'esm',
    platform: 'node',
    write: false,
  });
  const source = Buffer.from(result.outputFiles[0].contents).toString('base64');
  const { redirectSystemPath } = await import(
    `data:text/javascript;base64,${source}`
  );

  for (const initial of [true, false]) {
    for (const [path, expected] of [
      ['https://zoff.me/electro', '/?roomId=electro'],
      ['zoff://electro', '/?roomId=electro'],
      [
        'https://zoff.me/remotes/join?remoteId=abc&pair=token',
        '/remote?remoteId=abc&pair=token',
      ],
      ['zoff://remote/abc?pair=token', '/remote?remoteId=abc&pair=token'],
      ['https://zoff.me/security', 'https://zoff.me/security'],
      ['zoff://app/%invalid', '/'],
    ]) {
      assert.equal(redirectSystemPath({ initial, path }), expected);
    }
  }
});
