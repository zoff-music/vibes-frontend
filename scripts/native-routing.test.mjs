import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { build } from 'esbuild';

test('iPhone add action uses the native search role, with floating action only on tablets', () => {
  const tabs = readFileSync(
    'apps/mobile/src/components/layout/app-tabs.tsx',
    'utf8',
  );
  assert.match(tabs, /role="search"/);
  assert.match(
    tabs,
    /hidden=\{!canAddPlaylistItems \|\| tabletLayout.isTablet\}/,
  );
  const action = readFileSync(
    'apps/mobile/src/components/layout/floating-add-button.tsx',
    'utf8',
  );
  assert.match(action, /!tabletLayout.isTablet \|\| !canAddPlaylistItems/);
  assert.match(action, /!canAddPlaylistItems/);
  assert.match(action, /keyboardVisible/);
  assert.match(action, /<AddPlaylistItemSheet/);
});

test('native generative motion is bounded and lifecycle-aware', () => {
  const hook = readFileSync(
    'apps/mobile/src/hooks/use-generative-motion.ts',
    'utf8',
  );
  assert.match(hook, /useFocusEffect/);
  assert.match(hook, /AppState.addEventListener/);
  assert.match(hook, /reduceMotionChanged/);
  assert.match(hook, /focused && active && !reducedMotion/);
  const particles = readFileSync(
    'packages/ui/src/native/components/NativeGenerativeParticles.tsx',
    'utf8',
  );
  assert.match(particles, /current.slice\(-2\)/);
  assert.match(particles, /clearTimeout\(timer\)/);
  assert.match(particles, /Easing.linear/);
  assert.match(particles, /bottom-full/);
  const frame = readFileSync(
    'packages/ui/src/native/components/NativeGenerativeFrame.tsx',
    'utf8',
  );
  assert.match(frame, /useAnimatedProps/);
  assert.match(frame, /strokeDashoffset/);
  assert.match(frame, /cancelAnimation\(orbit\)/);
});

test('AI toggle keeps landing copy and label slots mounted', () => {
  const screen = readFileSync(
    'apps/mobile/src/components/rooms/rooms-screen.tsx',
    'utf8',
  );
  const hero = screen.slice(
    screen.indexOf('<NativeLandingSun'),
    screen.indexOf('accessibilityLabel={submitLabel}'),
  );
  assert.doesNotMatch(hero, /isAIMode && \(\s*<Text/);
  assert.match(hero, /isAIMode \? 'What’s the vibe\?' : 'Room name'/);
  assert.doesNotMatch(hero, /Follow your|Set the |Describe a mood/);
  assert.doesNotMatch(screen, /!isAIMode && \(\s*<Text/);
  const frame = readFileSync(
    'packages/ui/src/native/components/NativeGenerativeFrame.tsx',
    'utf8',
  );
  assert.match(frame, /cancelAnimation\(ignition\)/);
  assert.match(frame, /translateX: -ignition.value \* size.width/);
});

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

test('all mobile screens use context insets before their first native layout', async () => {
  for (const file of [
    'rooms/rooms-screen',
    'rooms/room-screen',
    'rooms/create-room-sheet',
    'settings/settings-screen',
    'remote/remote-pairing',
    'remote/remote-control',
    'remote/remote-scanner',
    'profile-settings-sheet',
    'room-settings-sheet',
    'search-sheet',
  ]) {
    const source = readFileSync(
      `apps/mobile/src/components/${file}.tsx`,
      'utf8',
    );

    assert.match(source, /ScreenSafeArea as SafeAreaView/);
    assert.doesNotMatch(
      source,
      /import\s*\{[^}]*\bSafeAreaView\b[^}]*\}\s*from 'react-native-safe-area-context'/,
    );
  }

  const result = await build({
    entryPoints: ['apps/mobile/src/components/screen-safe-area.tsx'],
    bundle: true,
    format: 'esm',
    platform: 'node',
    jsx: 'automatic',
    write: false,
    plugins: [
      {
        name: 'native-insets-fixture',
        setup(builder) {
          builder.onResolve(
            { filter: /^(react-native|react-native-safe-area-context)$/ },
            ({ path }) => ({ path, namespace: 'fixture' }),
          );
          builder.onLoad(
            { filter: /.*/, namespace: 'fixture' },
            ({ path }) => ({
              contents:
                path === 'react-native'
                  ? 'export const View = "View"; export const Platform = { OS: "ios" };'
                  : 'export const useSafeAreaInsets = () => ({ top: 62, bottom: 34, left: 0, right: 0 });',
            }),
          );
        },
      },
    ],
  });
  const source = Buffer.from(result.outputFiles[0].contents).toString('base64');
  const { ScreenSafeArea } = await import(
    `data:text/javascript;base64,${source}`
  );
  const screen = ScreenSafeArea({
    edges: ['top'],
    style: { flex: 1 },
    children: 'Settings',
  });

  assert.equal(screen.props.children, 'Settings');
  assert.deepEqual(screen.props.style, [
    { flex: 1 },
    {
      paddingTop: 62,
      paddingBottom: 0,
      paddingLeft: 0,
      paddingRight: 0,
    },
  ]);
  assert.equal(ScreenSafeArea({}).props.style[1].paddingBottom, 34);
  assert.equal(
    ScreenSafeArea({ pageSheet: true }).props.style[1].paddingTop,
    0,
  );
  assert.equal(
    ScreenSafeArea({ pageSheet: true }).props.style[1].paddingBottom,
    34,
  );

  for (const file of ['rooms/rooms-screen', 'queue', 'search-results']) {
    assert.doesNotMatch(
      readFileSync(`apps/mobile/src/components/${file}.tsx`, 'utf8'),
      /FadeInDown|SlideIn/,
    );
  }
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
