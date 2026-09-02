import {
  createApiClientWithBaseUrl,
  createApiV2ClientWithBaseUrl,
} from '@vibes/api';
import { fetch as expoFetch } from 'expo/fetch';

const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'https://zoff.me';

export const tvApi = createApiClientWithBaseUrl(apiUrl, {
  fetcher: expoFetch,
});

export const tvApiV2 = createApiV2ClientWithBaseUrl(apiUrl, {
  fetcher: expoFetch,
});
