import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { assetBase } from '@vibes/serve/assets';
import { precompressAssets } from '@vibes/serve/precompress';
import { applicationPlugins } from '@vibes/serve/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiProxyTarget =
    loadEnv(mode, process.cwd(), '').VITE_API_PROXY_TARGET ||
    'http://localhost:8080';
  const proxiesRemoteApi = apiProxyTarget.startsWith('https://');

  return {
    base: command === 'build' ? assetBase(env.ASSET_ORIGIN, '/remotes/') : '/',
    plugins: [
      tailwindcss(),
      ...applicationPlugins({ dataEndpoint: '/remotes/_smolter' }),

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
      port: 3007,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            if (!proxiesRemoteApi) return;

            proxy.on('proxyReq', (proxyRequest) => {
              proxyRequest.setHeader('origin', apiProxyTarget);
              proxyRequest.setHeader('referer', `${apiProxyTarget}/`);
            });
            proxy.on('proxyRes', (proxyResponse) => {
              const cookies = proxyResponse.headers['set-cookie'];

              if (!cookies) return;

              proxyResponse.headers['set-cookie'] = cookies.map((cookie) =>
                cookie.replace(/; Secure/gi, ''),
              );
            });
          },
        },
      },
    },
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
  };
});
