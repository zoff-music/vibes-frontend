import path from 'node:path';
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { precompressAssets } from '@vibes/serve/precompress';
import { reactCompiler } from '@vibes/serve/react-compiler';
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
      reactRouter(),
      reactCompiler(),
      precompressAssets(),
    ],
    root: '.',
    publicDir: 'public',
    environments: {
      client: {
        build: {
          rolldownOptions: {
            output: {
              chunkFileNames(chunk) {
                const name = chunk.name.startsWith('router-react')
                  ? 'router-react'
                  : chunk.name;

                return `assets/${name}-[hash].js`;
              },
              codeSplitting: {
                groups: [
                  {
                    name: 'react-runtime',
                    test: /node_modules[\\/]react[\\/]/,
                    priority: 40,
                  },
                  {
                    name: 'react-dom',
                    test: /node_modules[\\/](?:react-dom|scheduler)[\\/]/,
                    priority: 30,
                  },
                  {
                    name: 'validation-core',
                    test: /zod[\\/]v4[\\/]core[\\/](?!compile\.js$|index\.js$)[^\\/]+\.js$/,
                    priority: 27,
                  },
                  {
                    name: 'validation-compiler',
                    test: /zod[\\/]v4[\\/]core[\\/]compile\.js$/,
                    priority: 26,
                  },
                  {
                    name: 'router-core',
                    test: /react-router[\\/]dist[\\/]production[\\/]lib[\\/]router[\\/]/,
                    priority: 20,
                    maxSize: 90_000,
                  },
                  {
                    name: 'router-react',
                    test: /react-router[\\/]dist[\\/]production[\\/]/,
                    priority: 10,
                    entriesAware: true,
                  },
                ],
              },
            },
          },
        },
      },
    },
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
