import { existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const root = fileURLToPath(new URL('.', import.meta.url));
const aliases = [
  { find: /^react$/, replacement: 'preact/compat' },
  { find: /^react-dom$/, replacement: 'preact/compat' },
  { find: /^react\/jsx-runtime$/, replacement: 'preact/jsx-runtime' },
];
const owners = ['apps', 'packages'].flatMap((directory) =>
  readdirSync(new URL(directory, import.meta.url))
    .filter((name) =>
      existsSync(new URL(`${directory}/${name}/package.json`, import.meta.url)),
    )
    .map((name) => `${directory}/${name}`),
);

export default defineConfig({
  test: {
    fileParallelism: false,
    maxWorkers: 1,
    projects: [
      ...owners.map((owner) => ({
        root,
        resolve: { alias: aliases },
        oxc: { jsx: { runtime: 'automatic' as const, importSource: 'preact' } },
        test: {
          name: owner.split('/')[1],
          include: [`${owner}/**/*.test.{ts,tsx}`],
          exclude: [
            '**/node_modules/**',
            'packages/ui/src/web/**/*.browser.test.tsx',
            '**/players/integration.test.ts',
            '**/players/live.test.ts',
            '**/route-transition.integration.test.ts',
          ],
          testTimeout: 60_000,
          hookTimeout: 30_000,
          restoreMocks: true,
        },
      })),
      ...(['chromium', 'webkit'] as const).map((browser) => ({
        root,
        test: {
          name: `players-${browser}`,
          include: [
            'packages/ui/tests/players/integration.test.ts',
            'packages/ui/tests/players/live.test.ts',
            'packages/ui/tests/route-transition.integration.test.ts',
          ],
          env: { PLAYER_BROWSER: browser },
          testTimeout: 240_000,
          hookTimeout: 30_000,
          maxConcurrency: 4,
        },
      })),
      './packages/ui/vitest.config.mts',
    ],
  },
});
