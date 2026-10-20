import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { build } from 'esbuild';

test('phone add action sits beside navigation, with floating action only on tablets', () => {
  const tabs = readFileSync(
    'apps/mobile/src/components/layout/app-tabs.tsx',
    'utf8',
  );
  assert.match(tabs, /Platform.OS === 'android' \|\| !tabletLayout.isTablet/);
  const phone = readFileSync(
    'apps/mobile/src/components/layout/phone-navigation.tsx',
    'utf8',
  );
  assert.match(phone, /isLiquidGlassAvailable/);
  assert.match(phone, /flex-row items-center gap-3/);
  assert.match(phone, /router.push\('\/add'\)/);
  assert.match(phone, /accessibilityRole="button"/);
  assert.match(phone, /pathname === '\/add'/);
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
  assert.match(frame, /duration: 1400/);
  assert.match(frame, /translateX: \(\(1 - spread\) \* size.width\) \/ 2/);
  assert.match(frame, /style=\{ready\}/);
  assert.match(frame, /id="charge-rail"/);
  assert.match(frame, /id="charge-sweep"/);
});

test('mobile landing artwork peeks behind a compact opaque form card', () => {
  const screen = readFileSync(
    'apps/mobile/src/components/rooms/rooms-screen.tsx',
    'utf8',
  );
  assert.match(screen, /relative w-full pt-8/);
  assert.match(screen, /absolute inset-x-0 top-0/);
  assert.match(screen, /<NativeLandingSun watch=\{watch\} compact/);
  assert.match(screen, /bg-mobile-card px-5 py-6/);
  assert.doesNotMatch(screen, /<NativeLandingSun watch=\{watch\} \/>/);
});

test('mobile actions use capsules and circles without changing TV defaults', () => {
  const mobile = readFileSync('apps/mobile/src/components/native.tsx', 'utf8');
  assert.match(mobile, /shape="pill"/);
  assert.match(mobile, /shape="circle"/);
  const controls = readFileSync(
    'packages/ui/src/native/components/NativePrimitives.tsx',
    'utf8',
  );
  assert.equal(controls.match(/shape = 'rounded'/g).length, 3);
  assert.match(controls, /shape === 'pill' && 'rounded-full px-6'/);
  assert.match(controls, /shape === 'circle' && 'rounded-full'/);
  assert.match(controls, /min-h-13/);
  assert.match(controls, /size-13/);
  assert.match(controls, /text-native-dark-background/);
});

test('mobile fields and their generative outline share the capsule geometry', () => {
  const mobile = readFileSync('apps/mobile/src/components/native.tsx', 'utf8');
  assert.match(mobile, /<NativeField \{\.\.\.props\} shape="pill" ref=\{ref\}/);
  const frame = readFileSync(
    'packages/ui/src/native/components/NativeGenerativeFrame.tsx',
    'utf8',
  );
  assert.match(frame, /\(size.height - 4\) \/ 2/);
  assert.equal(frame.match(/rx=\{radius\}/g).length, 3);
  const field = readFileSync(
    'packages/ui/src/native/components/NativePrimitives.tsx',
    'utf8',
  );
  assert.match(
    field,
    /!props.multiline &&\s*'rounded-full border px-5 focus:border-accent'/,
  );
  assert.match(
    field,
    /props.multiline &&\s*'rounded-3xl border px-5 focus:border-accent'/,
  );
});

test('glass controls preserve accessibility fallback and native interaction', () => {
  const provider = readFileSync(
    'apps/mobile/src/providers/control-material-provider.tsx',
    'utf8',
  );
  assert.match(provider, /useState\(true\)/);
  assert.match(provider, /reduceTransparencyChanged/);
  assert.match(provider, /subscription.remove\(\)/);
  assert.match(provider, /revision === 0/);
  assert.match(provider, /!reducedTransparency && isLiquidGlassAvailable\(\)/);
  const surface = readFileSync(
    'apps/mobile/src/components/mobile-control-surface.tsx',
    'utf8',
  );
  assert.match(surface, /glassEffectStyle="regular" isInteractive/);
  assert.doesNotMatch(surface, /pointerEvents="none"|opacity-/);
  const mobile = readFileSync('apps/mobile/src/components/native.tsx', 'utf8');
  assert.equal(mobile.match(/useControlMaterial\(\) && !disabled/g).length, 2);
  assert.equal(mobile.match(/pressFeedback=\{feedback && !glass\}/g).length, 2);
});

test('mobile panels consistently use the large radius and thumbnails stay compact', () => {
  const mobile = readFileSync('apps/mobile/src/components/native.tsx', 'utf8');
  assert.match(mobile, /<NativeCard \{\.\.\.props\} radius="large"/);
  for (const file of [
    'queue',
    'search-results',
    'rooms/room-screen',
    'rooms/room-chat-panel',
    'rooms/rooms-screen',
    'provider-player',
    'room-configuration',
    'settings/device-remote-settings',
    'toast',
  ]) {
    const source = readFileSync(
      `apps/mobile/src/components/${file}.tsx`,
      'utf8',
    );
    assert.match(source, /rounded-3xl/);
    assert.doesNotMatch(source, /rounded-2xl/);
  }
  for (const file of ['queue', 'search-results', 'remote/remote-control']) {
    assert.match(
      readFileSync(`apps/mobile/src/components/${file}.tsx`, 'utf8'),
      /overflow-hidden rounded-xl bg-black/,
    );
  }
  assert.match(
    readFileSync(
      'apps/mobile/src/components/rooms/room-chat-panel.tsx',
      'utf8',
    ),
    /controlShape="pill"/,
  );
});

test('floating phone menu leaves extra clearance below the final content', () => {
  for (const file of [
    'settings/settings-screen',
    'remote/remote-pairing',
    'rooms/room-chat-panel',
  ]) {
    assert.match(
      readFileSync(`apps/mobile/src/components/${file}.tsx`, 'utf8'),
      /pb-30/,
    );
  }
  assert.match(
    readFileSync('apps/mobile/src/components/queue.tsx', 'utf8'),
    /paddingBottom: 120/,
  );
});

test('TV landing keeps decorative artwork behind the card and preserves focus', () => {
  const source = readFileSync('apps/tv/src/screens/landing-screen.tsx', 'utf8');
  assert.match(source, /absolute inset-x-0 top-0/);
  assert.match(source, /<NativeLandingSun watch=\{watch\} compact/);
  assert.match(source, /border-2 bg-tv-card/);
  assert.match(source, /shape="pill"/);
  assert.match(source, /preferred/);
  assert.doesNotMatch(source, /mt-24/);
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
    readFileSync('apps/mobile/src/app/_layout.tsx', 'utf8'),
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
            {
              filter:
                /^(react|react\/jsx-runtime|react-native|react-native-safe-area-context)$/,
            },
            ({ path }) => ({ path, namespace: 'fixture' }),
          );
          builder.onLoad(
            { filter: /.*/, namespace: 'fixture' },
            ({ path }) => ({
              contents: {
                react:
                  'export const createContext = value => ({ value }); export const useContext = context => context.value;',
                'react/jsx-runtime':
                  'export const jsx = (type, props) => ({ type, props });',
                'react-native':
                  'export const View = "View"; export const Platform = { OS: "ios" };',
                'react-native-safe-area-context':
                  'export const useSafeAreaInsets = () => ({ top: 62, bottom: 34, left: 0, right: 0 });',
              }[path],
            }),
          );
        },
      },
    ],
  });
  const source = Buffer.from(result.outputFiles[0].contents).toString('base64');
  const { ScreenSafeArea, ScreenInsetsProvider } = await import(
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
  const provider = ScreenInsetsProvider({ children: null });
  provider.type.value = { top: 70, bottom: 36, left: 0, right: 0 };
  assert.equal(ScreenSafeArea({}).props.style[1].paddingTop, 70);
  assert.equal(ScreenSafeArea({}).props.style[1].paddingBottom, 36);
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
