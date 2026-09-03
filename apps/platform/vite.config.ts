import path from 'node:path';
import { reactRouter } from '@react-router/dev/vite';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isBuild = command === 'build';
  const env = loadEnv(mode, process.cwd(), '');
  if (env.EMBED_BASE_PATH) {
    process.env.EMBED_BASE_PATH = env.EMBED_BASE_PATH;
  }
  const nodeEnv =
    process.env.NODE_ENV || (isBuild ? 'production' : 'development');
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:8080';
  const proxiesRemoteApi = apiProxyTarget.startsWith('https://');

  return {
    plugins: [
      tailwindcss(),
      babel({ presets: [reactCompilerPreset()] }),
      reactRouter(),
    ],
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
      'import.meta.env.VITE_DEBUG': JSON.stringify(
        process.env.VITE_DEBUG || process.env.DEBUG || 'false',
      ),
    },
  };
});
