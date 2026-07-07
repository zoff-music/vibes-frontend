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
import type { RequestClientProps, RequestDefinitions } from 'wiretyped';
import { HTTPError } from 'wiretyped';
import { backendRequestDuration, backendRequestStatusCode } from './metrics.ts';

type WiretypedFetchProvider = NonNullable<
  RequestClientProps<RequestDefinitions>['fetchProvider']
>;
type WiretypedFetchClient = InstanceType<WiretypedFetchProvider>;
type WiretypedFetchClientOptions =
  ConstructorParameters<WiretypedFetchProvider>[1];
type WiretypedGetOptions = Parameters<WiretypedFetchClient['get']>[1];
type WiretypedPutOptions = Parameters<WiretypedFetchClient['put']>[1];
type WiretypedPatchOptions = Parameters<WiretypedFetchClient['patch']>[1];
type WiretypedPostOptions = Parameters<WiretypedFetchClient['post']>[1];
type WiretypedDeleteOptions = Parameters<WiretypedFetchClient['delete']>[1];
type WiretypedFetchResult = ReturnType<WiretypedFetchClient['get']>;
type WiretypedFetchResultValue = Awaited<WiretypedFetchResult>;

interface TracedWiretypedRequestOptions {
  body?: BodyInit | null;
  credentials?: RequestCredentials;
  headers?: WiretypedFetchClientOptions['headers'];
  method: string;
  mode?: RequestMode;
  signal?: AbortSignal;
}

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

function mergeHeaders(
  defaults: WiretypedFetchClientOptions['headers'] | undefined,
  overrides: WiretypedFetchClientOptions['headers'] | undefined,
) {
  const headers = new Headers();
  const appendHeaders = (
    source: WiretypedFetchClientOptions['headers'] | undefined,
  ) => {
    if (!source) {
      return;
    }

    const sourceHeaders = new Headers(source as HeadersInit);
    sourceHeaders.forEach((value, key) => {
      headers.set(key, value);
    });
  };

  appendHeaders(defaults);
  appendHeaders(overrides);

  return headers;
}

function fetchResult(value: WiretypedFetchResultValue) {
  return Promise.resolve(value);
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

function tracedFetch(
  serviceName: string,
  input: RequestInfo | URL,
  init?: RequestInit,
) {
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

    return fetch(new Request(request, { headers }))
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
}

export function createTracedWiretypedFetchProvider(
  serviceName: string,
): WiretypedFetchProvider {
  return class TracedWiretypedFetchClient implements WiretypedFetchClient {
    private baseUrl: string;
    private options: WiretypedFetchClientOptions;

    constructor(baseUrl: string, options: WiretypedFetchClientOptions = {}) {
      this.baseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
      this.options = options;
    }

    config(options: WiretypedFetchClientOptions) {
      this.options = {
        ...this.options,
        ...options,
        headers: mergeHeaders(this.options.headers, options.headers),
      };
    }

    dispose() {}

    get(endpoint: string, options: WiretypedGetOptions) {
      return this.request(endpoint, {
        credentials: options.credentials,
        headers: options.headers,
        method: 'GET',
        mode: options.mode,
        signal: options.signal,
      });
    }

    put(endpoint: string, options: WiretypedPutOptions) {
      return this.request(endpoint, {
        body: options.body,
        credentials: options.credentials,
        headers: options.headers,
        method: 'PUT',
        mode: options.mode,
        signal: options.signal,
      });
    }

    patch(endpoint: string, options: WiretypedPatchOptions) {
      return this.request(endpoint, {
        body: options.body,
        credentials: options.credentials,
        headers: options.headers,
        method: 'PATCH',
        mode: options.mode,
        signal: options.signal,
      });
    }

    post(endpoint: string, options: WiretypedPostOptions) {
      return this.request(endpoint, {
        body: options.body,
        credentials: options.credentials,
        headers: options.headers,
        method: 'POST',
        mode: options.mode,
        signal: options.signal,
      });
    }

    delete(endpoint: string, options: WiretypedDeleteOptions) {
      return this.request(endpoint, {
        credentials: options.credentials,
        headers: options.headers,
        method: 'DELETE',
        mode: options.mode,
        signal: options.signal,
      });
    }

    private request(endpoint: string, options: TracedWiretypedRequestOptions) {
      const headers = mergeHeaders(this.options.headers, options.headers);
      const url = `${this.baseUrl}${endpoint.replace(/^\//, '')}`;

      return tracedFetch(serviceName, url, {
        body: options.body,
        method: options.method,
        mode: options.mode ?? this.options.mode,
        credentials: options.credentials ?? this.options.credentials,
        headers,
        ...(options.signal && { signal: options.signal }),
      })
        .then((response) => {
          if (response.ok) {
            return fetchResult([null, response] as WiretypedFetchResultValue);
          }

          return fetchResult([
            new HTTPError(
              response,
              `error in ${options.method} request in fetchClient`,
            ),
            null,
          ] as WiretypedFetchResultValue);
        })
        .catch((err: unknown) => {
          const wrapped = Object.assign(
            Error(`error wrapping ${options.method} request in fetchClient`),
            { cause: err },
          );
          return fetchResult([wrapped, null] as WiretypedFetchResultValue);
        });
    }
  };
}
