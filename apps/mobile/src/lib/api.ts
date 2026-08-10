import { createApiClientWithBaseUrl, getAPIErrorMessage } from '@vibes/api';
import { fetch as expoFetch } from 'expo/fetch';

const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'https://zoff.me';

export const mobileApi = createApiClientWithBaseUrl(apiUrl, {
  fetcher: expoFetch,
});

export function createRemoteApi(remoteId: string, controllerToken: string) {
  return createApiClientWithBaseUrl(apiUrl, {
    customHeaders: {
      'X-Zoff-Remote-ID': remoteId,
      'X-Zoff-Remote-Token': controllerToken,
    },
    fetcher: expoFetch,
  });
}

export async function getRequestErrorMessage(
  error: Error | null,
  fallback: string,
) {
  const apiMessage = error ? await getAPIErrorMessage(error) : null;
  return apiMessage ?? error?.message ?? fallback;
}
