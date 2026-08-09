import { createApiClientWithBaseUrl, getAPIErrorMessage } from '@vibes/api';

const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'https://zoff.me';

export const mobileApi = createApiClientWithBaseUrl(apiUrl);

export function createRemoteApi(remoteId: string, controllerToken: string) {
  return createApiClientWithBaseUrl(apiUrl, {
    customHeaders: {
      'X-Zoff-Remote-ID': remoteId,
      'X-Zoff-Remote-Token': controllerToken,
    },
  });
}

export async function getRequestErrorMessage(
  error: Error | null,
  fallback: string,
) {
  const apiMessage = error ? await getAPIErrorMessage(error) : null;
  return apiMessage ?? error?.message ?? fallback;
}
