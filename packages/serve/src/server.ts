import path from 'node:path';
import compression from 'compression';
import express, { type Request } from 'express';
import type { ServerBuild } from 'react-router';
import { metricsApp } from './metrics.ts';
import {
  createMetricsMiddleware,
  createTracingMiddleware,
} from './middleware.ts';
import { initTracing, instrumentFetch } from './tracing.ts';

export type ServerRequest = Request;

type ServerMode =
  | {
      type: 'ssr';
      loadBuild: () => Promise<unknown>;
    }
  | {
      type: 'spa';
      fallbackPath: string;
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
  operationName: (req: Request) => string;
  serviceName: string;
  mode: ServerMode;
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

  app.use(
    config.assets.path,
    express.static(config.assets.staticDir, {
      immutable: true,
      maxAge: '1y',
    }),
  );
  app.use(express.static(config.staticDir, { maxAge: '1h', index: false }));

  if (config.mode.type === 'ssr') {
    const { createRequestHandler } = await import('@react-router/express');
    const { loadBuild } = config.mode;
    app.use(
      createRequestHandler({
        build: async () => (await loadBuild()) as ServerBuild,
      }),
    );
    return;
  }

  const { fallbackPath, fallbackFile } = config.mode;
  app.get(fallbackPath, (_req, res) => {
    res.sendFile(path.resolve(config.staticDir, fallbackFile));
  });
}

export async function startServer(config: ServerConfig) {
  const sdk = initTracing(config.serviceName);
  instrumentFetch(config.serviceName);

  const app = express();
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

    sdk
      .shutdown()
      .catch((err: unknown) => {
        console.error(err);
      })
      .finally(() => {
        process.exit(0);
      });
  }

  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}
