import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { build } from 'esbuild';

test('native press feedback runs once without delaying the action, and never for disabled controls', async () => {
  const result = await build({
    entryPoints: ['packages/ui/src/native/components/NativePressable.tsx'],
    bundle: true,
    format: 'esm',
    platform: 'node',
    jsx: 'automatic',
    write: false,
    plugins: [
      {
        name: 'native-controls-fixture',
        setup(builder) {
          builder.onResolve(
            { filter: /^(react|react\/jsx-runtime|react-native)$/ },
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
                'react-native': 'export const Pressable = "Pressable";',
              }[path],
            }),
          );
        },
      },
    ],
  });
  const { NativePressable, NativePressFeedbackContext } = await import(
    `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].contents).toString('base64')}`
  );
  const calls = [];
  NativePressFeedbackContext.value = () => {
    calls.push('feedback');
    return new Promise(() => {});
  };
  const onPress = (event) => calls.push(event);
  const enabled = NativePressable({
    onPress,
    accessibilityLabel: 'Generate with AI',
  });
  enabled.props.onPress('action');
  assert.deepEqual(calls, ['feedback', 'action']);
  assert.equal(enabled.props.accessibilityLabel, 'Generate with AI');
  NativePressable({ disabled: true, onPress }).props.onPress('disabled');
  NativePressable({}).props.onPress('no action');
  assert.deepEqual(calls, ['feedback', 'action']);
  NativePressFeedbackContext.value = null;
  NativePressable({ onPress }).props.onPress('TV action');
  assert.deepEqual(calls, ['feedback', 'action', 'TV action']);
});

test('landing refresh and browser alignment do not reset the whole page', () => {
  const screen = readFileSync(
    'apps/mobile/src/components/rooms/rooms-screen.tsx',
    'utf8',
  );
  assert.match(screen, /useScrollOffset\(landingScroll\)/);
  assert.match(screen, /translateY: Math.min\(landingOffset.value, 0\)/);
  assert.match(screen, /measureLayout\(landingContent.current/);
  assert.match(screen, /minHeight: height - insets.top/);
  assert.doesNotMatch(screen, /scrollTo\(\{\s*y: 0/);
  const grid = readFileSync(
    'apps/mobile/src/components/native-retro-grid.tsx',
    'utf8',
  );
  assert.doesNotMatch(grid, /rotateX|perspective:|useNativeDriver/);
  assert.match(grid, /Easing.linear/);
  assert.match(grid, /cancelAnimation\(phase\)/);
  assert.match(grid, /overflow-hidden/);
});

test('landing artwork is opaque and grid rays cover both edges', () => {
  const artwork = readFileSync(
    'packages/ui/src/native/components/NativeLandingSun.tsx',
    'utf8',
  );
  assert.match(
    artwork,
    /rounded-full bg-native-background dark:bg-native-dark-background/,
  );
  assert.doesNotMatch(artwork, /opacity-80/);
  const grid = readFileSync(
    'apps/mobile/src/components/native-retro-grid.tsx',
    'utf8',
  );
  assert.match(grid, /length: 41/);
  assert.match(grid, /x1=\{500 \+ \(index - 20\) \* 40\}/);
  assert.match(grid, /y1=\{0\}/);
  const root = readFileSync('apps/mobile/src/app/_layout.tsx', 'utf8');
  assert.match(
    root,
    /<SafeAreaProvider initialMetrics=\{initialWindowMetrics\}>/,
  );
  assert.match(root, /<ScreenInsetsProvider>/);
  assert.doesNotMatch(root, /if \(!fontsLoaded\)/);
});
