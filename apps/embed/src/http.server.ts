import { createApiClientWithBaseUrl } from '@vibes/api';
import {
  createTracedApiFetchLifecycle,
  getServerRequestHeaders,
} from '@vibes/serve';

const fallbackApiBaseUrl = 'http://localhost:8080';
const serviceName = process.env.OTEL_SERVICE_NAME ?? 'vibes-frontend-embed';

export function getServerApi(request?: Request) {
  const baseUrl = process.env.VITE_API_URL_INTERNAL ?? fallbackApiBaseUrl;

  return createApiClientWithBaseUrl(baseUrl, {
    customHeaders: {
      ...getServerRequestHeaders(request),
      'X-Zoff-Embed': 'true',
    },
    fetchLifecycle: createTracedApiFetchLifecycle(serviceName),
  });
}
