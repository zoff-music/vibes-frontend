import path from 'node:path';
import { type ServerRequest, startServer } from '@vibez/serve';

const staticDir = path.resolve('dist');
const dev = process.env.NODE_ENV !== 'production';
const serviceName = process.env.OTEL_SERVICE_NAME ?? 'vibes-frontend-cast';
const basePath = '/casting/receiver';

function operationName(req: ServerRequest) {
  if (req.path === basePath || req.path === `${basePath}/`) {
    return 'CastReceiver';
  }
  if (req.path.startsWith(`${basePath}/assets/`)) {
    return 'StaticAsset';
  }
  if (req.path.startsWith(basePath)) {
    return 'CastReceiverAsset';
  }
  return 'CastRoute';
}

startServer({
  name: 'Vibes cast',
  dev,
  port: process.env.PORT || 3001,
  metricsPort: process.env.INTERNAL_PORT || process.env.METRICS_PORT || 3004,
  staticDir,
  assets: {
    path: `${basePath}/assets`,
    staticDir: path.join(staticDir, 'assets'),
  },
  metricsSkipPaths: [`${basePath}/assets/`],
  operationName,
  serviceName,
  mode: {
    type: 'spa',
    basePath,
    fallbackFile: 'index.html',
  },
});
