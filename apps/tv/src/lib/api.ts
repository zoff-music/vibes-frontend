import {
  createApiClientWithBaseUrl,
  getAPIErrorMessage,
  getRateLimitMessage,
} from '@vibes/api';
import { fetch as expoFetch } from 'expo/fetch';

const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'https://zoff.me';

export const tvApi = createApiClientWithBaseUrl(apiUrl, {
  fetcher: expoFetch,
});

export async function getTvRequestErrorMessage(
  error: Error | null,
  fallback: string,
) {
  if (!error) return fallback;
  return (
    getRateLimitMessage(error) ?? (await getAPIErrorMessage(error)) ?? fallback
  );
}
