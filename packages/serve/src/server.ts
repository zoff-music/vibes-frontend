import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  type RouteAssets,
  routePreloads,
} from '@kasperrt/smolter/utils/assets';
import {
  createRequestHandler,
  type ServerBuild,
} from '@kasperrt/smolter/utils/http';
import { isRouteErrorResponse } from '@kasperrt/smolter/utils/responses';
import { safeWrapAsync } from '@vibes/shared/wrap';
import compression from 'compression';
import express, { type Request, type Response } from 'express';
import type { Manifest } from 'vite';
import { metricsApp } from './metrics.ts';
import {
  createBodySizeLimitMiddleware,
  createFrameProtectionMiddleware,
  createMetricsMiddleware,
  createTracingMiddleware,
} from './middleware.ts';
import { precompressedAssets } from './precompressed.ts';
import {
  clientEntryPreloads,
  sendDocumentPreloads,
  staticDocumentPreloads,
} from './preloads.ts';
import { initTracing } from './tracing.ts';

interface ServerErrorContext {
  request: globalThis.Request;
}

interface ApplicationBuild extends ServerBuild {
  clientAssetBase: string;
  documentPreloads?: string[];
}

export type ServerRequest = Request;

const defaultBodySizeLimitBytes = 1024 * 1024;

export const handleServerError = (
  error: unknown,
  { request }: ServerErrorContext,
) => {
  if (request.signal.aborted) {
    return;
  }

  if (isRouteErrorResponse(error) && error.status === 404) {
    return;
  }

  console.error(error);
};

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
  staticContentTypes?: Record<string, string>;
  bodySizeLimitBytes?: number;
  frameAllowedPath?: string;
  fileFrameAllowedPath?: string;
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
    const vite = await import('vite');
    const devServer = await vite.createServer({
      server: { middlewareMode: true },
    });
    app.use(devServer.middlewares);

    return;
  }

  const staticBase = config.assets.path.replace(/\/assets\/?$/, '') || '/';
  const dataEndpoint = `${staticBase.replace(/\/$/, '')}/_smolter`;
  app.get(
    `${staticBase.replace(/\/$/, '')}/smolter-manifest.json`,
    (_req, res) => {
      res.set({
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
        'Cross-Origin-Resource-Policy': 'cross-origin',
      });
      res.sendFile(path.resolve(config.staticDir, 'smolter-manifest.json'));
    },
  );

  const assetRouter = express.Router();
  assetRouter.use((_req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Timing-Allow-Origin', '*');
    next();
  });
  assetRouter.get('/robots.txt', (_req, res) => {
    // Crawlers must be able to fetch CDN assets when rendering public pages.
    // This host never serves application documents or API responses.
    res
      .set('Cache-Control', 'public, max-age=3600')
      .type('text/plain')
      .send('User-agent: *\nAllow: /\n');
  });
  assetRouter.use(
    config.assets.path,
    await precompressedAssets(config.assets.staticDir),
    express.static(config.assets.staticDir, {
      immutable: true,
      maxAge: '1y',
      index: false,
      redirect: false,
    }),
  );
  const publicFiles = express.static(config.staticDir, {
    maxAge: '1h',
    index: false,
    redirect: false,
  });
  const publicImages = express.Router();
  publicImages.use((req, res, next) => {
    // Public images only: never expose documents, data or app routes here.
    if (!/\.(?:png|webp|avif|jpe?g|gif|svg|ico|woff2?)$/i.test(req.path)) {
      next();

      return;
    }

    publicFiles(req, res, next);
  });
  assetRouter.use(staticBase, publicImages);
  app.use((req, res, next) => {
    if (!process.env.ASSET_HOST || req.hostname !== process.env.ASSET_HOST) {
      next();

      return;
    }

    // This hostname has no SSR/API fallback, including for missing chunks.
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.set('Cache-Control', 'no-store').sendStatus(405);

      return;
    }

    assetRouter(req, res, () => {
      res.set('Cache-Control', 'no-store').sendStatus(404);
    });
  });

  app.use(
    config.assets.path,
    await precompressedAssets(config.assets.staticDir),
  );

  if (config.mode.type === 'ssr') {
    app.use(
      config.assets.path,
      express.static(config.assets.staticDir, {
        immutable: true,
        maxAge: '1y',
      }),
    );
    app.use(staticBase, publicImages);
    const staticOptions: Parameters<typeof express.static>[1] = {
      maxAge: '1h',
      index: false,
      setHeaders(res, filePath) {
        const routePath = `/${path.relative(config.staticDir, filePath).split(path.sep).join('/')}`;
        const contentType = config.staticContentTypes?.[routePath];

        if (contentType) {
          res.setHeader('Content-Type', contentType);
        }
      },
    };

    app.use(
      '/.well-known',
      express.static(path.join(config.staticDir, '.well-known'), staticOptions),
    );
    app.use(express.static(config.staticDir, staticOptions));

    const build = (await config.mode.loadBuild()) as ApplicationBuild;
    const manifest = JSON.parse(
      await readFile(
        path.join(config.staticDir, '.vite/manifest.json'),
        'utf8',
      ),
    ) as Manifest;
    const routeAssets: RouteAssets[] = JSON.parse(
      await readFile(
        path.join(config.staticDir, '.vite/route-assets.json'),
        'utf8',
      ),
    );
    const client = Object.values(manifest).find((item) => item.isEntry);

    if (!client)
      throw new Error('Client entry is missing from the Vite manifest');

    const clientAssetBase = build.clientAssetBase || staticBase;
    const entry = `${clientAssetBase.replace(/\/$/, '')}/${client.file}`;
    const documentPreloads = [
      ...(build.documentPreloads ?? []),
      ...clientEntryPreloads(manifest, client, clientAssetBase),
    ];

    app.use((req, res, next) => {
      if (
        req.path !== dataEndpoint &&
        (req.method === 'GET' || req.method === 'HEAD')
      ) {
        res.set('Cache-Control', 'no-cache');
        const preloads = routePreloads(routeAssets, req.path, clientAssetBase);

        if (preloads) res.set('Link', preloads);

        sendDocumentPreloads(req, res, documentPreloads);
      }

      next();
    });
    app.use(createRequestHandler({ build, entry, dataEndpoint }));

    return;
  }

  const { basePath, fallbackFile } = config.mode;
  const html = await readFile(
    path.join(config.staticDir, fallbackFile),
    'utf8',
  );
  const document = html.replace(
    '<html',
    `<html data-debug="${process.env.VITE_DEBUG === 'true'}"`,
  );
  const documentLinks = staticDocumentPreloads(html);
  const sendDocument = (req: Request, res: Response) => {
    sendDocumentPreloads(req, res, documentLinks);
    res.set('Cache-Control', 'no-store');
    res.type('html').send(document);
  };
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
  app.get([`${basePath}/`, `${basePath}/index.html`], sendDocument);
  app.use(
    basePath,
    express.static(config.staticDir, { maxAge: '1h', index: false }),
  );
  app.get(`${basePath}/*splat`, sendDocument);
}

export async function startServer(config: ServerConfig) {
  const sdk = initTracing(config.serviceName);

  const app = express();
  app.set('trust proxy', 1);
  app.use(
    createBodySizeLimitMiddleware({
      maxBytes: resolveBodySizeLimitBytes(config),
    }),
  );
  app.use(compression());
  app.disable('x-powered-by');
  app.use(
    createFrameProtectionMiddleware({
      allowedPath: config.frameAllowedPath,
      fileAllowedPath: config.fileFrameAllowedPath,
    }),
  );
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
  server.requestTimeout = 30_000;
  server.headersTimeout = 10_000;

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
