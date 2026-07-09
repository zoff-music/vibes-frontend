import { type ApiFetchLifecycle, createApiClientWithBaseUrl } from '@vibes/api';
import { createTracedApiFetchLifecycle } from '@vibes/serve';
import { safeWrap } from '@vibes/shared';

const FALLBACK_API_BASE_URL = 'http://localhost:8080';
const serviceName = process?.env?.OTEL_SERVICE_NAME ?? 'vibes-frontend-admin';

export interface ServerApiOptions {
  fetchLifecycle?: ApiFetchLifecycle;
}

function composeFetchLifecycle(
  primary: ApiFetchLifecycle,
  secondary?: ApiFetchLifecycle,
): ApiFetchLifecycle {
  return {
    beforeRequest(request) {
      const nextRequest = primary.beforeRequest?.(request) ?? request;
      return secondary?.beforeRequest?.(nextRequest) ?? nextRequest;
    },
    afterResponse(request, response) {
      primary.afterResponse?.(request, response);
      secondary?.afterResponse?.(request, response);
    },
    afterError(request, error) {
      primary.afterError?.(request, error);
      secondary?.afterError?.(request, error);
    },
    afterRequest(request) {
      primary.afterRequest?.(request);
      secondary?.afterRequest?.(request);
    },
  };
}

function resolveServerApiBaseUrl(request?: Request) {
  const internalApiUrl =
    typeof process !== 'undefined'
      ? process.env?.VITE_API_URL_INTERNAL
      : undefined;
  if (internalApiUrl) {
    return internalApiUrl;
  }

  if (request) {
    const [urlErr, originUrl] = safeWrap(() => new URL(request.url));
    if (!urlErr && originUrl) {
      if (
        (originUrl.hostname === 'localhost' ||
          originUrl.hostname === '127.0.0.1') &&
        (originUrl.port === '' || originUrl.port === '80')
      ) {
        return 'http://localhost:8080';
      }
      return originUrl.origin;
    }
  }

  const runtimeApiUrl =
    typeof process !== 'undefined' ? process.env?.VITE_API_URL : undefined;
  if (runtimeApiUrl) {
    return runtimeApiUrl;
  }

  return FALLBACK_API_BASE_URL;
}

export function getServerApi(
  request?: Request,
  options: ServerApiOptions = {},
) {
  const baseUrl = resolveServerApiBaseUrl(request);
  console.log('[serverApi] resolved baseUrl', {
    baseUrl,
    requestUrl: request?.url,
    apiUrl: process?.env?.VITE_API_URL,
    apiUrlInternal: process?.env?.VITE_API_URL_INTERNAL,
  });
  const fetchLifecycle = composeFetchLifecycle(
    createTracedApiFetchLifecycle(serviceName),
    options.fetchLifecycle,
  );
  return createApiClientWithBaseUrl(baseUrl, {
    fetchLifecycle,
  });
}
