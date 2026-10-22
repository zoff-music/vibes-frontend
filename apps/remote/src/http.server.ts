import { createApiClientWithBaseUrl } from '@vibes/api';
import {
  createTracedApiFetchLifecycle,
  getServerRequestHeaders,
} from '@vibes/serve';

export function getServerApi(request?: Request) {
  const baseUrl =
    process.env.VITE_API_URL_INTERNAL ??
    process.env.VITE_API_URL ??
    'http://localhost:8080';

  return createApiClientWithBaseUrl(baseUrl, {
    customHeaders: getServerRequestHeaders(request),
    fetchLifecycle: createTracedApiFetchLifecycle('vibes-frontend-remote'),
  });
}
