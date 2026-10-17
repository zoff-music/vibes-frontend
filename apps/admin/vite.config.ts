import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { assetBase } from '@vibes/serve/assets';
import { precompressAssets } from '@vibes/serve/precompress';
import { applicationPlugins } from '@vibes/serve/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isBuild = command === 'build';
  const nodeEnv =
    process.env.NODE_ENV || (isBuild ? 'production' : 'development');

  return {
    base: isBuild ? assetBase(env.ASSET_ORIGIN, '/admin/') : '/',
    plugins: [
      tailwindcss(),
      ...applicationPlugins({ dataEndpoint: '/admin/_smolter' }),
      precompressAssets(),
    ],
    appType: 'custom',
    build: {
      manifest: true,
      rollupOptions: {
        output: {
          entryFileNames: (chunk) =>
            chunk.name === 'entry.server'
              ? 'index.js'
              : 'assets/[name]-[hash].js',
        },
      },
    },
    root: '.',
    publicDir: 'public',
    server: {
      port: 3005,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(nodeEnv),
      'import.meta.env.VITE_FRONTEND_URL': JSON.stringify(
        process.env.FRONTEND_URL || 'http://localhost:3005',
      ),
      'import.meta.env.VITE_DEVELOPMENT_MODE': JSON.stringify(
        process.env.DEVELOPMENT_MODE ||
          (nodeEnv !== 'production' ? 'true' : 'false'),
      ),
    },
  };
});
