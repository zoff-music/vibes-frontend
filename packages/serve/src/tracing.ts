import {
  context,
  propagation,
  type Span,
  SpanStatusCode,
  type TextMapSetter,
  trace,
} from '@opentelemetry/api';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { backendRequestDuration, backendRequestStatusCode } from './metrics.ts';

interface TracedApiFetchState {
  endTimer: () => void;
  operationName: string;
  span: Span;
}

const notRecord = 0;
const recordAndSample = 2;
const requestState = new WeakMap<Request, TracedApiFetchState>();
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

export function createTracedApiFetchLifecycle(serviceName: string) {
  const tracer = trace.getTracer(serviceName);

  return {
    beforeRequest(request: Request) {
      const headers = new Headers(request.headers);
      propagation.inject(context.active(), headers, headersSetter);
      const tracedRequest = new Request(request, { headers });
      const state = startRequestTrace(tracer, tracedRequest);
      requestState.set(tracedRequest, state);
      return tracedRequest;
    },
    afterResponse(request: Request, response: Response) {
      const state = requestState.get(request);
      if (!state) {
        return;
      }

      backendRequestStatusCode.inc({
        status_code: String(response.status),
        operation_name: state.operationName,
      });
      state.span.setAttribute('http.method', request.method);
      state.span.setAttribute('http.url', request.url);
      state.span.setAttribute('http.status_code', response.status);
      if (response.status >= 500) {
        state.span.setStatus({ code: SpanStatusCode.ERROR });
      }
    },
    afterError(request: Request, err: Error) {
      const state = requestState.get(request);
      if (!state) {
        return;
      }

      state.span.recordException(err);
      state.span.setStatus({ code: SpanStatusCode.ERROR });
      backendRequestStatusCode.inc({
        status_code: '0',
        operation_name: state.operationName,
      });
    },
    afterRequest(request: Request) {
      const state = requestState.get(request);
      if (!state) {
        return;
      }

      state.endTimer();
      state.span.end();
      requestState.delete(request);
    },
  };
}

function startRequestTrace(
  tracer: ReturnType<typeof trace.getTracer>,
  request: Request,
) {
  const requestUrl = new URL(request.url);
  const operationName = `${request.method} ${requestUrl.pathname}`;
  const endTimer = backendRequestDuration.startTimer({
    operation_name: operationName,
  });

  return {
    endTimer,
    operationName,
    span: tracer.startSpan(operationName),
  };
}
