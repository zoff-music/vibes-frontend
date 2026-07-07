import {
  context,
  propagation,
  SpanStatusCode,
  trace,
} from '@opentelemetry/api';
import type { NextFunction, Request, Response } from 'express';
import { httpRequestDuration, httpRequestStatusCode } from './metrics.ts';

interface MiddlewareOptions {
  operationName: (req: Request) => string;
  serviceName: string;
  skipPaths?: string[];
}

export function createMetricsMiddleware(options: MiddlewareOptions) {
  const { operationName, skipPaths = [] } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    if (skipPaths.some((path) => req.path.startsWith(path))) {
      return next();
    }

    const name = operationName(req);
    const endTimer = httpRequestDuration.startTimer({
      operation_name: name,
    });

    res.on('finish', () => {
      endTimer();
      httpRequestStatusCode.inc({
        status_code: String(res.statusCode),
        operation_name: name,
      });
    });

    return next();
  };
}

export function createTracingMiddleware(options: MiddlewareOptions) {
  const { operationName, serviceName, skipPaths = [] } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    if (skipPaths.some((path) => req.path.startsWith(path))) {
      return next();
    }

    const name = operationName(req);
    const extracted = propagation.extract(context.active(), req.headers);
    const tracer = trace.getTracer(serviceName);
    const span = tracer.startSpan(name, undefined, extracted);

    return context.with(trace.setSpan(extracted, span), () => {
      res.on('finish', () => {
        span.setAttribute('http.method', req.method);
        span.setAttribute('http.route', name);
        span.setAttribute('http.target', req.originalUrl);
        span.setAttribute('http.status_code', res.statusCode);
        if (res.statusCode >= 500) {
          span.setStatus({ code: SpanStatusCode.ERROR });
        }
        span.end();
      });

      return next();
    });
  };
}
