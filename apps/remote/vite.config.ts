import path from 'node:path';
import { reactRouter } from '@react-router/dev/vite';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ command, mode }) => {
  const apiProxyTarget =
    loadEnv(mode, process.cwd(), '').VITE_API_PROXY_TARGET ||
    'http://localhost:8080';
  const proxiesRemoteApi = apiProxyTarget.startsWith('https://');

  return {
    base: command === 'build' ? '/remotes/' : '/',
    plugins: [
      tailwindcss(),
      babel({ presets: [reactCompilerPreset()] }),
      reactRouter(),
    ],
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
