import { createApiClientWithBaseUrl } from '@vibes/api';

const apiUrl = import.meta.env.VITE_API_URL ?? 'https://zoff.me';

export const tizenApi = createApiClientWithBaseUrl(apiUrl);
