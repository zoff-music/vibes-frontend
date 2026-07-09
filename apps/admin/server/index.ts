import path from 'node:path';
import { type ServerRequest, startServer } from '@vibes/serve';

const staticDir = path.resolve('dist/client');
const dev = process.env.NODE_ENV !== 'production';
const serviceName = process.env.OTEL_SERVICE_NAME ?? 'vibes-frontend-admin';
const dynamicImport = new Function('specifier', 'return import(specifier)') as (
  specifier: string,
) => Promise<unknown>;

function operationName(req: ServerRequest) {
  if (req.path.startsWith('/admin')) {
    return 'AdminPage';
  }
  if (req.path === '/favicon.ico' || req.path.includes('.')) {
    return 'StaticAsset';
  }
  return 'AdminRoute';
}

startServer({
  name: 'Vibes admin',
  dev,
  port: process.env.PORT || 3000,
  metricsPort: process.env.INTERNAL_PORT || process.env.METRICS_PORT || 3006,
  staticDir,
  assets: {
    path: '/assets',
    staticDir: path.join(staticDir, 'assets'),
  },
  metricsSkipPaths: ['/assets/'],
  operationName,
  serviceName,
  mode: {
    type: 'ssr',
    loadBuild: () => dynamicImport('../dist/server/index.js'),
  },
});
