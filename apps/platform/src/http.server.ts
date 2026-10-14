import {
  createApiClientWithBaseUrl,
  createApiV3ClientWithBaseUrl,
} from '@vibes/api';
import { createTracedApiFetchLifecycle } from '@vibes/serve';
import { safeWrap } from '@vibes/shared';
import type { HandleDataRequestFunction } from 'react-router';

export const handleDataRequest: HandleDataRequestFunction = (
  response,
  { request },
) => {
  const url = new URL(request.url);
  const policy = url.pathname.match(
    /^\/(security|privacy-policy|terms-of-service)\.data$/,
  )?.[1];
  const routes = url.searchParams.getAll('_routes');
  const policyOnly =
    policy && routes.length === 1 && routes[0] === `routes/${policy}/route`;

  response.headers.set('Cache-Control', 'private, no-store');

  if (
    request.method === 'GET' &&
    response.status === 200 &&
    policyOnly &&
    !response.headers.has('Set-Cookie')
  ) {
    response.headers.set('Cache-Control', 'private, max-age=300');
  }

  return response;
};

const FALLBACK_API_BASE_URL = 'http://localhost:8080';
const serviceName =
  process?.env?.OTEL_SERVICE_NAME ?? 'vibes-frontend-platform';

// Reuse only the deployment-configured origin, never arbitrary request hosts.
// Cookies and signals remain request options, not shared client configuration.
const internalApiUrl = process.env.VITE_API_URL_INTERNAL;
const internalApi = internalApiUrl
  ? createApiClientWithBaseUrl(internalApiUrl, {
      fetchLifecycle: createTracedApiFetchLifecycle(serviceName),
    })
  : null;

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

export function getServerApi(request?: Request) {
  if (internalApi) return internalApi;

  const baseUrl = resolveServerApiBaseUrl(request);
  return createApiClientWithBaseUrl(baseUrl, {
    fetchLifecycle: createTracedApiFetchLifecycle(serviceName),
  });
}

export function getServerApiV3(request?: Request) {
  return createApiV3ClientWithBaseUrl(resolveServerApiBaseUrl(request), {
    fetchLifecycle: createTracedApiFetchLifecycle(serviceName),
  });
}
