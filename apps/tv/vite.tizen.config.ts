import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { applicationPlugins } from '@vibes/serve/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  publicDir: 'tizen',
  build: {
    target: 'chrome76',
    emptyOutDir: true,
    outDir: 'dist/tizen',
    rollupOptions: {
      input: 'tizen.html',
    },
  },
  plugins: [
    ...applicationPlugins({
      ssr: false,
      directory: 'src/tizen/routes',
      // Packaged Tizen pages require one classic script, not module imports.
      splitRoutes: false,
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        changeOrigin: true,
        target: 'https://zoff.me',
      },
    },
  },
});
