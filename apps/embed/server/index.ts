import path from 'node:path';
import { type ServerRequest, startServer } from '@vibes/serve';

const staticDir = path.resolve('dist/client');
const dev = process.env.NODE_ENV !== 'production';
const serviceName = process.env.OTEL_SERVICE_NAME ?? 'vibes-frontend-embed';
const embedBasePath = `/${(process.env.EMBED_BASE_PATH ?? '/embed').replace(/^\/+|\/+$/g, '')}`;
const dynamicImport = new Function('specifier', 'return import(specifier)') as (
  specifier: string,
) => Promise<unknown>;

function operationName(req: ServerRequest) {
  if (req.path === embedBasePath || req.path.startsWith(`${embedBasePath}/`)) {
    return 'EmbedRoomPage';
  }
  if (req.path.startsWith(`${embedBasePath}/assets/`)) {
    return 'StaticAsset';
  }
  return 'EmbedRoute';
}

startServer({
  name: 'Vibes embed',
  dev,
  port: process.env.PORT || 3000,
  metricsPort: process.env.INTERNAL_PORT || process.env.METRICS_PORT || 3002,
  staticDir,
  assets: {
    path: `${embedBasePath}/assets`,
    staticDir: path.join(staticDir, 'assets'),
  },
  metricsSkipPaths: [`${embedBasePath}/assets/`],
  operationName,
  serviceName,
  frameAllowedPath: embedBasePath,
  mode: {
    type: 'ssr',
    loadBuild: () => dynamicImport('../dist/server/index.js'),
  },
});
