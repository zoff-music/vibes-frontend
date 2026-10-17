import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { assetBase } from '@vibes/serve/assets';
import { precompressAssets } from '@vibes/serve/precompress';
import { applicationPlugins } from '@vibes/serve/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ command, mode }) => {
  const isBuild = command === 'build';
  const env = loadEnv(mode, process.cwd(), '');
  const embedBasePath = `/${(env.EMBED_BASE_PATH || '/embed').replace(/^\/+|\/+$/g, '')}/`;

  if (env.EMBED_BASE_PATH) {
    process.env.EMBED_BASE_PATH = env.EMBED_BASE_PATH;
  }

  const nodeEnv =
    process.env.NODE_ENV || (isBuild ? 'production' : 'development');

  return {
    base: isBuild ? assetBase(env.ASSET_ORIGIN, embedBasePath) : '/',
    plugins: [
      tailwindcss(),
      ...applicationPlugins(),

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
    server: {
      port: 3006,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'https://zoff.me',
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
    },
  };
});
