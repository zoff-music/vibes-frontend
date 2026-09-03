import path from 'node:path';
import postcssCascadeLayers from '@csstools/postcss-cascade-layers';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import legacy from '@vitejs/plugin-legacy';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import type { PluginOption } from 'vite';
import { defineConfig, loadEnv } from 'vite';

const plugins: PluginOption[] = [
  tailwindcss(),
  babel({ presets: [reactCompilerPreset()] }),
  react(),
  legacy({
    targets: ['chrome >= 80'],
    additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
  }),
];

const hmrHost = process.env.CAST_HMR_HOST;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:8080';
  const proxiesRemoteApi = apiProxyTarget.startsWith('https://');

  return {
    plugins,
    css: {
      postcss: {
        plugins: [postcssCascadeLayers()],
      },
    },
    root: '.',
    publicDir: 'public',
    base: '/casting/receiver/',
    server: {
      host: true,
      port: 3003,
      strictPort: true,
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
      hmr: hmrHost
        ? {
            host: hmrHost,
            protocol: 'wss',
            clientPort: 443,
            path: '/casting/receiver/__hmr',
          }
        : undefined,
    },
    build: {
      cssTarget: 'chrome80',
      outDir: 'dist',
      emptyOutDir: true,
    },
    define: {
      'import.meta.env.VITE_CAST_APP_ID': JSON.stringify(
        process.env.CAST_APP_ID || '1FAF5D9F',
      ),
      'import.meta.env.VITE_CAST_RECEIVER_URL': JSON.stringify(
        process.env.CAST_RECEIVER_URL || '/casting/receiver/',
      ),
      'import.meta.env.VITE_FRONTEND_URL': JSON.stringify(
        process.env.FRONTEND_URL || '',
      ),
      'import.meta.env.VITE_DEBUG': JSON.stringify(
        process.env.VITE_DEBUG || process.env.DEBUG || 'false',
      ),
      'import.meta.env.VITE_CAST_DEBUG_MODE': JSON.stringify(
        process.env.CAST_DEBUG_MODE || 'false',
      ),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@vibes/ui': path.resolve(__dirname, '../../packages/ui/src'),
        '@vibes/shared': path.resolve(__dirname, '../../packages/shared/src'),
        '@vibes/models': path.resolve(__dirname, '../../packages/models/src'),
        '@vibes/api': path.resolve(__dirname, '../../packages/api/src'),
      },
    },
  };
});
