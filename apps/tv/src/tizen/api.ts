import { createApiClientWithBaseUrl } from '@vibes/api';

const apiUrl =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? window.location.origin : 'https://zoff.me');

export const tizenApi = createApiClientWithBaseUrl(apiUrl);
