import { createApiClientWithBaseUrl } from '@vibes/api';
import { createTracedApiFetchLifecycle } from '@vibes/serve';
import { embedApiHeaders } from './embed-api';

const fallbackApiBaseUrl = 'http://localhost:8080';
const serviceName = process.env.OTEL_SERVICE_NAME ?? 'vibes-frontend-embed';

export function getServerApi() {
  const baseUrl = process.env.VITE_API_URL_INTERNAL ?? fallbackApiBaseUrl;
  return createApiClientWithBaseUrl(baseUrl, {
    customHeaders: embedApiHeaders,
    fetchLifecycle: createTracedApiFetchLifecycle(serviceName),
  });
}
