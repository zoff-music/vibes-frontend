import { createApiClientWithBaseUrl } from '@vibes/api';
import { createTracedApiFetchLifecycle } from '@vibes/serve';

export function getServerApi() {
  const baseUrl =
    process.env.VITE_API_URL_INTERNAL ??
    process.env.VITE_API_URL ??
    'http://localhost:8080';
  return createApiClientWithBaseUrl(baseUrl, {
    fetchLifecycle: createTracedApiFetchLifecycle('vibes-frontend-remote'),
  });
}
