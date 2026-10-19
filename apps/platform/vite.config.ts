import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { assetBase } from '@vibes/serve/assets';
import { precompressAssets } from '@vibes/serve/precompress';
import { applicationPlugins } from '@vibes/serve/vite';
import { defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isBuild = command === 'build';
  const env = loadEnv(mode, process.cwd(), '');
  const publicDevelopmentSettings = {
    CONTACT_EMAIL: 'contact@zoff.me',
    PRIVACY_EMAIL: 'privacy@zoff.me',
    SECURITY_EMAIL: 'security@zoff.me',
    SECURITY_POLICY_EXPIRES: '2027-07-25T00:00:00Z',
  };

  for (const [key, fallback] of Object.entries(publicDevelopmentSettings)) {
    if (env[key]) process.env[key] = env[key];

    if (!isBuild) process.env[key] ||= fallback;
  }

  if (env.EMBED_BASE_PATH) {
    process.env.EMBED_BASE_PATH = env.EMBED_BASE_PATH;
  }

  const nodeEnv =
    process.env.NODE_ENV || (isBuild ? 'production' : 'development');
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || 'https://zoff.me';
  const proxiesRemoteApi = apiProxyTarget.startsWith('https://');

  return {
    base: isBuild ? assetBase(env.ASSET_ORIGIN, '/') : '/',
    plugins: [
      tailwindcss(),
      ...applicationPlugins({ dataEndpoint: '/_smolter' }),

      precompressAssets(),
    ],
    appType: 'custom',
    build: {
      manifest: true,
      rollupOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'navigation',
                test: /\/apps\/platform\/src\/(?:hooks|utils|components)\//,
                tags: ['$initial'],
              },
            ],
          },
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
      port: 3001,
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
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(nodeEnv),
      'import.meta.env.VITE_CAST_APP_ID': JSON.stringify(
        process.env.CAST_APP_ID || '1FAF5D9F',
      ),
      'import.meta.env.VITE_CAST_RECEIVER_URL': JSON.stringify(
        process.env.CAST_RECEIVER_URL || '/casting/receiver/',
      ),
      'import.meta.env.VITE_FRONTEND_URL': JSON.stringify(
        process.env.FRONTEND_URL || 'http://localhost:3001',
      ),
      'import.meta.env.VITE_DEVELOPMENT_MODE': JSON.stringify(
        process.env.DEVELOPMENT_MODE ||
          (nodeEnv !== 'production' ? 'true' : 'false'),
      ),
    },
  };
});
