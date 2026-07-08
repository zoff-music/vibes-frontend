import path from 'node:path';
import { safeWrapAsync } from '@vibes/shared/src/utils/wrap.ts';
import compression from 'compression';
import express, { type Request } from 'express';
import type { ServerBuild } from 'react-router';
import { metricsApp } from './metrics.ts';
import {
  createBodySizeLimitMiddleware,
  createMetricsMiddleware,
  createTracingMiddleware,
} from './middleware.ts';
import { initTracing } from './tracing.ts';

export type ServerRequest = Request;

const defaultBodySizeLimitBytes = 1024 * 1024;

type ServerMode =
  | {
      type: 'ssr';
      loadBuild: () => Promise<unknown>;
    }
  | {
      type: 'spa';
      basePath: string;
      fallbackFile: string;
    };

export interface ServerConfig {
  name: string;
  dev: boolean;
  port: number | string;
  metricsPort: number | string;
  staticDir: string;
  assets: {
    path: string;
    staticDir: string;
  };
  metricsSkipPaths?: string[];
  bodySizeLimitBytes?: number;
  operationName: (req: Request) => string;
  serviceName: string;
  mode: ServerMode;
}

function resolveBodySizeLimitBytes(config: ServerConfig) {
  if (config.bodySizeLimitBytes) {
    return config.bodySizeLimitBytes;
  }

  const parsed = Number.parseInt(process.env.BODY_SIZE_LIMIT_BYTES ?? '', 10);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }

  return defaultBodySizeLimitBytes;
}

async function setupRoutes(app: express.Express, config: ServerConfig) {
  if (config.dev) {
    const { createRequestHandler } = await import('@react-router/express');
    const vite = await import('vite');
    const devServer = await vite.createServer({
      server: { middlewareMode: true },
    });

    app.use(devServer.middlewares);
    app.use(
      createRequestHandler({
        build: () =>
          devServer.ssrLoadModule(
            'virtual:react-router/server-build',
          ) as Promise<ServerBuild>,
      }),
    );
    return;
  }

  if (config.mode.type === 'ssr') {
    app.use(
      config.assets.path,
      express.static(config.assets.staticDir, {
        immutable: true,
        maxAge: '1y',
      }),
    );
    app.use(express.static(config.staticDir, { maxAge: '1h', index: false }));

    const { createRequestHandler } = await import('@react-router/express');
    const { loadBuild } = config.mode;
    app.use(
      createRequestHandler({
        build: async () => (await loadBuild()) as ServerBuild,
      }),
    );
    return;
  }

  const { basePath, fallbackFile } = config.mode;
  app.use((req, res, next) => {
    if (req.path !== basePath) {
      return next();
    }

    return res.redirect(308, `${basePath}/`);
  });
  app.use(
    config.assets.path,
    express.static(config.assets.staticDir, {
      immutable: true,
      maxAge: '1y',
    }),
  );
  app.use(basePath, express.static(config.staticDir, { maxAge: '1h' }));
  app.get(`${basePath}/*`, (_req, res) => {
    res.sendFile(path.resolve(config.staticDir, fallbackFile));
  });
}

export async function startServer(config: ServerConfig) {
  const sdk = initTracing(config.serviceName);

  const app = express();
  app.use(
    createBodySizeLimitMiddleware({
      maxBytes: resolveBodySizeLimitBytes(config),
    }),
  );
  app.use(compression());
  app.disable('x-powered-by');
  app.use(
    createMetricsMiddleware({
      operationName: config.operationName,
      serviceName: config.serviceName,
      skipPaths: config.metricsSkipPaths,
    }),
  );
  app.use(
    createTracingMiddleware({
      operationName: config.operationName,
      serviceName: config.serviceName,
      skipPaths: config.metricsSkipPaths,
    }),
  );

  await setupRoutes(app, config);

  const server = app.listen(config.port, () => {
    console.log(`${config.name} server listening on port ${config.port}`);
  });

  const metricsServer = !config.dev
    ? metricsApp.listen(config.metricsPort, () => {
        console.log(`Metrics server listening on port ${config.metricsPort}`);
      })
    : undefined;

  function shutdown() {
    server.close((err) => {
      if (err) {
        console.error(err);
      }
    });

    metricsServer?.close((err) => {
      if (err) {
        console.error(err);
      }
    });

    void (async () => {
      const [err] = await safeWrapAsync(sdk.shutdown());
      if (err) {
        console.error(err);
      }
      process.exit(0);
    })();
  }

  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}
