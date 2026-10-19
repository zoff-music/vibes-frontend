import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { build } from 'esbuild';

async function loadComponent(file, mocks) {
  const result = await build({
    entryPoints: [`apps/mobile/src/components/${file}.tsx`],
    bundle: true,
    format: 'esm',
    platform: 'node',
    jsx: 'automatic',
    define: { 'process.env.NODE_ENV': '"production"' },
    write: false,
    plugins: [
      {
        name: 'mobile-sheet-fixture',
        setup(builder) {
          builder.onResolve({ filter: /.*/ }, ({ path }) => {
            if (Object.hasOwn(mocks, path)) {
              return { path, namespace: 'fixture' };
            }
          });
          builder.onLoad(
            { filter: /.*/, namespace: 'fixture' },
            ({ path }) => ({
              contents: mocks[path],
            }),
          );
        },
      },
    ],
  });
  const source = Buffer.from(result.outputFiles[0].contents).toString('base64');

  return import(`data:text/javascript;base64,${source}`);
}

test('native sheet dismissal keeps content and the theme backdrop until native dismissal', async () => {
  for (const background of ['#120b1e', '#f6ebff']) {
    const { AddPlaylistItemSheet } = await loadComponent('add-sheet', {
      react:
        'export const useEffect = () => {}; export const useState = value => [value, () => {}];',
      'react-native': 'export const Modal = "Modal";',
      '@vibes/shared/use-request':
        'export const useRequest = () => [null, () => {}];',
      '@/components/search-sheet': 'export const SearchSheet = "SearchSheet";',
      '@/hooks/use-app-theme': `export const useAppTheme = () => ({ background: '${background}' });`,
      '@/providers/app-provider':
        'export const useRoomSession = () => ({ room: { id: "fixture", settings: {} }, playlistItems: [] }); export const useRoomActions = () => ({ refresh: async () => {} });',
      '@/requests/load-controller': 'export const loadController = () => {};',
    });
    const onClose = () => {};

    for (const visible of [true, false, true]) {
      const modal = AddPlaylistItemSheet({ visible, onClose });

      assert.equal(modal.type, 'Modal');
      assert.equal(modal.props.visible, visible);
      assert.equal(modal.props.backdropColor, background);
      assert.equal(modal.props.animationType, 'slide');
      assert.equal(modal.props.presentationStyle, 'pageSheet');
      assert.equal(modal.props.onRequestClose, onClose);
      assert.equal(modal.props.children.type, 'SearchSheet');
      assert.equal(modal.props.children.props.onClose, onClose);
      assert.equal(Object.hasOwn(modal.props.children.props, 'visible'), false);
    }
  }

  const search = readFileSync(
    'apps/mobile/src/components/search-sheet.tsx',
    'utf8',
  );

  assert.doesNotMatch(search, /\bvisible\b/);
  assert.match(search, /<Screen showGrid=\{false\}>/);
});

test('solid sheets do not remove the grid from normal screens or change their layout', async () => {
  const { Screen } = await loadComponent('native', {
    '@vibes/shared':
      'export const classNames = (...values) => values.filter(Boolean).join(" ");',
    '@vibes/ui/native':
      'export const NativeButton = "Button", NativeCard = "Card", NativeCopy = "Copy", NativeField = "Field", NativeHeading = "Heading", NativeIconButton = "IconButton";',
    'react-native':
      'export const View = "View", ActivityIndicator = "ActivityIndicator", Platform = { OS: "android" }; export const useWindowDimensions = () => ({ width: 1024 });',
    '@/components/native-retro-grid': 'export const NativeRetroGrid = "Grid";',
    '@/hooks/use-app-theme': 'export const useAppTheme = () => ({});',
    '@/hooks/use-tablet-landscape-layout':
      'export const tabletNavigationHeight = 80; export const useTabletLandscapeLayout = () => ({ isTablet: true });',
    '@/lib/interaction-feedback':
      'export const triggerSelectionFeedback = () => {};',
  });
  const normal = Screen({ children: 'content' });
  const sheet = Screen({ children: 'content', showGrid: false });

  assert.equal(normal.props.children[0].type, 'Grid');
  assert.equal(sheet.props.children[0], false);
  assert.equal(sheet.props.className, normal.props.className);
  assert.match(
    sheet.props.className,
    /bg-mobile-background dark:bg-mobile-dark-background/,
  );
  assert.equal(sheet.props.children[1].props.children, 'content');
  assert.deepEqual(sheet.props.children[1].props.style, { paddingTop: 80 });
});

test('every mobile page sheet uses a solid surface and theme-matched native backdrop', () => {
  for (const file of [
    'profile-settings-sheet',
    'room-settings-sheet',
    'rooms/create-room-sheet',
  ]) {
    const source = readFileSync(
      `apps/mobile/src/components/${file}.tsx`,
      'utf8',
    );

    assert.match(source, /backdropColor=\{theme.background\}/);
    assert.match(source, /<Screen showGrid=\{false\}>/);
    assert.match(source, /animationType="slide"/);
    assert.match(source, /visible=\{visible\}/);
    assert.doesNotMatch(source, /if\s*\(!visible\)\s*return null/);
  }
});
