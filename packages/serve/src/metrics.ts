import express, { type Request, type Response } from 'express';
import {
  Counter,
  collectDefaultMetrics,
  Histogram,
  Registry,
} from 'prom-client';

const buckets = [
  0.005, 0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1, 2.5, 5, 7.5, 10,
];

export const registry = new Registry();

collectDefaultMetrics({ register: registry });

export const httpRequestStatusCode = new Counter({
  name: 'http_request_status_code',
  help: 'Status codes returned by the frontend server',
  labelNames: ['status_code', 'operation_name'] as const,
  registers: [registry],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration',
  help: 'Time spent processing frontend requests',
  labelNames: ['operation_name'] as const,
  buckets,
  registers: [registry],
});

export const backendRequestStatusCode = new Counter({
  name: 'frontend_backend_request_status_code',
  help: 'Status codes returned by backend API requests made from frontend SSR',
  labelNames: ['status_code', 'operation_name'] as const,
  registers: [registry],
});

export const backendRequestDuration = new Histogram({
  name: 'frontend_backend_request_duration',
  help: 'Time spent processing backend API requests made from frontend SSR',
  labelNames: ['operation_name'] as const,
  buckets,
  registers: [registry],
});

export const metricsApp: express.Express = express();

metricsApp.get('/_healthz', (_req: Request, res: Response) => {
  res.status(200).send('ok');
});

metricsApp.get('/metrics', async (_req: Request, res: Response) => {
  res.set('Content-Type', registry.contentType);
  res.end(await registry.metrics());
});
