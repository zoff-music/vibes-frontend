import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [tailwindcss()],
  optimizeDeps: { include: ['preact/test-utils'] },
  resolve: {
    alias: [
      { find: /^react$/, replacement: 'preact/compat' },
      { find: /^react-dom$/, replacement: 'preact/compat' },
      { find: /^react\/jsx-runtime$/, replacement: 'preact/jsx-runtime' },
    ],
  },
  oxc: { jsx: { runtime: 'automatic', importSource: 'preact' } },
  test: {
    name: 'ui-browser',
    sequence: { groupOrder: 1 },
    setupFiles: ['../shared/tests/setup.browser.ts'],
    include: ['src/web/**/*.browser.test.tsx'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
    testTimeout: 30_000,
  },
});
