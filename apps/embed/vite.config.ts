import path from 'node:path';
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ command, mode }) => {
  const isBuild = command === 'build';
  const env = loadEnv(mode, process.cwd(), '');
  if (env.EMBED_BASE_PATH) {
    process.env.EMBED_BASE_PATH = env.EMBED_BASE_PATH;
  }
  const nodeEnv =
    process.env.NODE_ENV || (isBuild ? 'production' : 'development');

  return {
    base: isBuild ? './' : '/',
    plugins: [tailwindcss(), reactRouter()],
    root: '.',
    server: {
      port: 3006,
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
      'import.meta.env.VITE_DEBUG': JSON.stringify(
        process.env.VITE_DEBUG || process.env.DEBUG || 'false',
      ),
    },
  };
});
