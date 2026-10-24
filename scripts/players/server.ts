import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { createServer } from 'vite';

export async function startPlayerFixture(live = false) {
  const server = await createServer({
    configFile: false,
    root: resolve('scripts/players'),
    cacheDir: resolve(`node_modules/.vite/player-fixture-${live}`),
    plugins: [tailwindcss()],
    define: {
      'process.env.NODE_ENV': '"production"',
      __LIVE_PLAYERS__: JSON.stringify(live),
    },
    oxc: { jsx: { runtime: 'automatic', importSource: 'preact' } },
    resolve: {
      alias: {
        react: 'preact/compat',
        'react-dom': 'preact/compat',
        ...(!live && { 'react-youtube': resolve('scripts/players/sdk.tsx') }),
      },
    },
    server: { host: '127.0.0.1', port: 0 },
  });
  await server.listen();
  return server;
}
