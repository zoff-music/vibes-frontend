import { safeWrapAsync } from '@vibes/shared';
import type { RequestClientProps, RequestDefinitions } from 'wiretyped';
import { HTTPError } from 'wiretyped';
import { showRateLimitToast } from './rateLimit';

type ApiFetchProvider = NonNullable<
  RequestClientProps<RequestDefinitions>['fetchProvider']
>;
type ApiFetchClient = InstanceType<ApiFetchProvider>;
type ApiFetchClientOptions = ConstructorParameters<ApiFetchProvider>[1];
type ApiGetOptions = Parameters<ApiFetchClient['get']>[1];
type ApiPutOptions = Parameters<ApiFetchClient['put']>[1];
type ApiPatchOptions = Parameters<ApiFetchClient['patch']>[1];
type ApiPostOptions = Parameters<ApiFetchClient['post']>[1];
type ApiDeleteOptions = Parameters<ApiFetchClient['delete']>[1];
type ApiFetchResult = ReturnType<ApiFetchClient['get']>;
type ApiFetchResponse = NonNullable<Awaited<ApiFetchResult>[1]>;

interface ApiRequestOptions {
  body?: BodyInit | null;
  credentials?: RequestCredentials;
  headers?: ApiFetchClientOptions['headers'];
  method: string;
  mode?: RequestMode;
  signal?: AbortSignal;
}

export interface ApiFetchLifecycle {
  beforeRequest?: (request: Request) => Request;
  afterResponse?: (request: Request, response: Response) => void;
  afterError?: (request: Request, error: Error) => void;
  afterRequest?: (request: Request) => void;
}

function mergeHeaders(
  defaults: ApiFetchClientOptions['headers'] | undefined,
  overrides: ApiFetchClientOptions['headers'] | undefined,
) {
  const headers = new Headers();
  const appendHeaders = (
    source: ApiFetchClientOptions['headers'] | undefined,
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

function createFetchError(method: string, err: Error) {
  return Object.assign(
    Error(`error wrapping ${method} request in fetchClient`),
    {
      cause: err,
    },
  );
}

export function createApiFetchProvider(
  lifecycle: ApiFetchLifecycle = {},
): ApiFetchProvider {
  return class ApiFetchProviderClient implements ApiFetchClient {
    private baseUrl: string;
    private options: ApiFetchClientOptions;

    constructor(baseUrl: string, options: ApiFetchClientOptions = {}) {
      this.baseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
      this.options = options;
    }

    config(options: ApiFetchClientOptions) {
      this.options = {
        ...this.options,
        ...options,
        headers: mergeHeaders(this.options.headers, options.headers),
      };
    }

    dispose() {}

    get(endpoint: string, options: ApiGetOptions) {
      return this.request(endpoint, {
        credentials: options.credentials,
        headers: options.headers,
        method: 'GET',
        mode: options.mode,
        signal: options.signal,
      });
    }

    put(endpoint: string, options: ApiPutOptions) {
      return this.request(endpoint, {
        body: options.body,
        credentials: options.credentials,
        headers: options.headers,
        method: 'PUT',
        mode: options.mode,
        signal: options.signal,
      });
    }

    patch(endpoint: string, options: ApiPatchOptions) {
      return this.request(endpoint, {
        body: options.body,
        credentials: options.credentials,
        headers: options.headers,
        method: 'PATCH',
        mode: options.mode,
        signal: options.signal,
      });
    }

    post(endpoint: string, options: ApiPostOptions) {
      return this.request(endpoint, {
        body: options.body,
        credentials: options.credentials,
        headers: options.headers,
        method: 'POST',
        mode: options.mode,
        signal: options.signal,
      });
    }

    delete(endpoint: string, options: ApiDeleteOptions) {
      return this.request(endpoint, {
        credentials: options.credentials,
        headers: options.headers,
        method: 'DELETE',
        mode: options.mode,
        signal: options.signal,
      });
    }

    private async request(
      endpoint: string,
      options: ApiRequestOptions,
    ): ApiFetchResult {
      const headers = mergeHeaders(this.options.headers, options.headers);
      const url = `${this.baseUrl}${endpoint.replace(/^\//, '')}`;
      const request = new Request(url, {
        body: options.body,
        method: options.method,
        mode: options.mode ?? this.options.mode,
        credentials: options.credentials ?? this.options.credentials,
        headers,
        ...(options.signal && { signal: options.signal }),
      });
      const lifecycleRequest = lifecycle.beforeRequest?.(request) ?? request;

      const [err, response] = await safeWrapAsync(fetch(lifecycleRequest));
      if (err || !response) {
        const normalizedErr = err ?? new Error('error fetching response');
        lifecycle.afterError?.(lifecycleRequest, normalizedErr);
        lifecycle.afterRequest?.(lifecycleRequest);
        return [createFetchError(options.method, normalizedErr), null];
      }

      lifecycle.afterResponse?.(lifecycleRequest, response);
      showRateLimitToast(response);
      lifecycle.afterRequest?.(lifecycleRequest);

      if (response.ok) {
        return [null, response as ApiFetchResponse];
      }

      return [
        new HTTPError(
          response as ApiFetchResponse,
          `error in ${options.method} request in fetchClient`,
        ),
        null,
      ];
    }
  };
}
