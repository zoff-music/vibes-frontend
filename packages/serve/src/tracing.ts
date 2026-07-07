import {
  context,
  propagation,
  SpanStatusCode,
  type TextMapSetter,
  trace,
} from '@opentelemetry/api';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { backendRequestDuration, backendRequestStatusCode } from './metrics.ts';

const notRecord = 0;
const recordAndSample = 2;
const headersSetter: TextMapSetter<Headers> = {
  set(carrier, key, value) {
    carrier.set(key, value);
  },
};

function normalizeOtelEndpoint(endpoint: string | undefined) {
  if (!endpoint) {
    return 'http://alloy.monitoring.svc.cluster.local:4317';
  }

  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }

  return `http://${endpoint}`;
}

function parseRatio(raw: string | undefined) {
  const parsed = Number.parseFloat(raw ?? '');
  if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 1) {
    return parsed;
  }

  return 1;
}

export function initTracing(serviceName: string) {
  propagation.setGlobalPropagator(new W3CTraceContextPropagator());

  const traceExporter = new OTLPTraceExporter({
    url: normalizeOtelEndpoint(process.env.OTEL_ENDPOINT),
  });

  const sdk = new NodeSDK({
    serviceName,
    traceExporter,
    sampler: {
      shouldSample() {
        return {
          decision:
            Math.random() < parseRatio(process.env.OTEL_SAMPLER_PARAM)
              ? recordAndSample
              : notRecord,
          attributes: {},
        };
      },
      toString() {
        return 'RatioSampler';
      },
    },
    metricReaders: [],
  });

  sdk.start();
  return sdk;
}

export function instrumentFetch(serviceName: string) {
  const originalFetch = globalThis.fetch;
  if (typeof originalFetch !== 'function') {
    return;
  }

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input, init);
    const requestUrl = new URL(request.url);
    const operationName = `${request.method} ${requestUrl.pathname}`;
    const tracer = trace.getTracer(serviceName);
    const endTimer = backendRequestDuration.startTimer({
      operation_name: operationName,
    });

    return tracer.startActiveSpan(operationName, async (span) => {
      const headers = new Headers(request.headers);
      propagation.inject(context.active(), headers, headersSetter);

      return originalFetch(new Request(request, { headers }))
        .then((response) => {
          backendRequestStatusCode.inc({
            status_code: String(response.status),
            operation_name: operationName,
          });
          span.setAttribute('http.method', request.method);
          span.setAttribute('http.url', request.url);
          span.setAttribute('http.status_code', response.status);
          if (response.status >= 500) {
            span.setStatus({ code: SpanStatusCode.ERROR });
          }
          return response;
        })
        .catch((err: unknown) => {
          if (err instanceof Error) {
            span.recordException(err);
          }
          span.setStatus({ code: SpanStatusCode.ERROR });
          backendRequestStatusCode.inc({
            status_code: '0',
            operation_name: operationName,
          });
          throw err;
        })
        .finally(() => {
          endTimer();
          span.end();
        });
    });
  };
}
