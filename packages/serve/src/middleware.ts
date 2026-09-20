import {
  context,
  propagation,
  SpanKind,
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

export interface BodySizeLimitOptions {
  maxBytes: number;
}

export interface FrameProtectionOptions {
  allowedPath?: string;
}

export function createFrameProtectionMiddleware(
  options: FrameProtectionOptions,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const allowedPath = options.allowedPath?.replace(/\/$/, '');
    const framingAllowed =
      allowedPath &&
      (req.path === allowedPath || req.path.startsWith(`${allowedPath}/`));
    if (framingAllowed) {
      res.setHeader('Content-Security-Policy', 'frame-ancestors *');
      return next();
    }

    res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
    res.setHeader('X-Frame-Options', 'DENY');
    return next();
  };
}

export function createBodySizeLimitMiddleware(options: BodySizeLimitOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    const rawContentLength = req.headers['content-length'];
    if (Array.isArray(rawContentLength)) {
      res.status(400).send('Invalid Content-Length');
      return undefined;
    }

    const contentLength = Number(rawContentLength ?? 0);
    if (!Number.isSafeInteger(contentLength) || contentLength < 0) {
      res.status(400).send('Invalid Content-Length');
      return undefined;
    }

    if (contentLength > options.maxBytes) {
      res.status(413).send('Request body too large');
      return undefined;
    }

    // Count the stream too: chunked bodies have no Content-Length header.
    // Pause until the downstream consumer attaches so no body bytes are lost.
    let receivedBytes = 0;
    req.on('data', (chunk: Buffer | string) => {
      receivedBytes += Buffer.byteLength(chunk);
      if (receivedBytes <= options.maxBytes || res.writableEnded) return;

      req.pause();
      res.setHeader('Connection', 'close');
      res.status(413).end('Request body too large', () => req.destroy());
    });
    req.pause();

    return next();
  };
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
      if (res.statusCode === 404) {
        console.info(`404 Not Found: ${req.method} ${req.path}`);
      }

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
    const span = tracer.startSpan(name, { kind: SpanKind.SERVER }, extracted);

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
