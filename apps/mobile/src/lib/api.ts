import {
  createApiClientWithBaseUrl,
  getRequestErrorMessage as getApiRequestErrorMessage,
  getHttpError,
} from '@vibes/api';
import { fetch as expoFetch } from 'expo/fetch';
import { Platform } from 'react-native';

const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'https://zoff.me';
const nativeFetch = Platform.OS === 'ios' ? globalThis.fetch : expoFetch;

export const mobileApi = createApiClientWithBaseUrl(apiUrl, {
  fetcher: nativeFetch,
});

export function createRemoteApi(remoteId: string, controllerToken: string) {
  return createApiClientWithBaseUrl(apiUrl, {
    customHeaders: {
      'X-Zoff-Remote-ID': remoteId,
      'X-Zoff-Remote-Token': controllerToken,
    },
    fetcher: nativeFetch,
  });
}

export async function getRequestErrorMessage(
  error: Error | null,
  fallback: string,
) {
  if (!error) return fallback;

  const response = getHttpError(error)?.response;
  const apiMessage = await getApiRequestErrorMessage(error, fallback);
  if (apiMessage !== fallback && !isTechnicalRequestMessage(apiMessage)) {
    return apiMessage;
  }

  if (!response) {
    if (isTimeoutError(error)) {
      return 'Zoff took too long to respond. Check your connection and try again.';
    }
    return 'Could not reach Zoff. Check your connection and try again.';
  }
  if (response.status === unauthorizedStatus) {
    return 'Your credentials were rejected. Check the password and try again.';
  }
  if (response.status === forbiddenStatus) {
    return 'You do not have permission to do that in this room.';
  }
  if (response.status === conflictStatus) {
    return 'That change conflicts with the latest room state. Refresh and try again.';
  }
  if (response.status >= serverErrorStatus) {
    return 'Zoff is having trouble completing that request. Try again in a moment.';
  }
  return fallback;
}

function isTechnicalRequestMessage(message: string) {
  return technicalRequestMessagePatterns.some((pattern) =>
    pattern.test(message),
  );
}

function isTimeoutError(error: Error) {
  return (
    error.name === 'AbortError' || timeoutMessagePattern.test(error.message)
  );
}

const technicalRequestMessagePatterns = [
  /\b(error|failed)\s+doing\s+(get|post|put|patch|delete|head)\b/i,
  /\b(error|failed)\s+in\s+(the\s+)?request\b/i,
  /\binternal server error\b/i,
  /\b(network request|fetch) failed\b/i,
];
const timeoutMessagePattern = /\b(timeout|timed out)\b/i;
const unauthorizedStatus = 401;
const forbiddenStatus = 403;
const conflictStatus = 409;
const serverErrorStatus = 500;
