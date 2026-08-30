import { errorCodeResponseSchema } from '@vibes/models';
import { safeWrap, safeWrapAsync } from '@vibes/shared/wrap';
import { getHttpError } from 'wiretyped';

function getRetryAfterSeconds(response: Response) {
  const rawRetryAfter = response.headers.get('Retry-After');
  if (!rawRetryAfter) {
    return null;
  }

  const retryAfterSeconds = Number.parseInt(rawRetryAfter, 10);
  if (!Number.isFinite(retryAfterSeconds) || retryAfterSeconds <= 0) {
    return null;
  }

  return retryAfterSeconds;
}

function formatRetryAfter(retryAfterSeconds: number | null) {
  if (!retryAfterSeconds) {
    return 'Please wait a moment and try again.';
  }

  if (retryAfterSeconds < 60) {
    const seconds = Math.max(1, Math.ceil(retryAfterSeconds));
    return `Try again in ${seconds} second${seconds === 1 ? '' : 's'}.`;
  }

  const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
  return `Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`;
}

export function getRateLimitMessageFromResponse(response: Response) {
  if (response.status !== RATE_LIMIT_STATUS) {
    return null;
  }

  const retryAfter = formatRetryAfter(getRetryAfterSeconds(response));
  return `Easy there. Too many requests. ${retryAfter}`;
}

export function getRateLimitMessage(error: Error) {
  const response = getHttpError(error)?.response;
  if (!response) {
    return null;
  }

  return getRateLimitMessageFromResponse(response);
}

export async function getAPIErrorMessage(error: Error) {
  const response = getHttpError(error)?.response;
  if (!response) {
    return null;
  }

  const [cloneError, clonedResponse] = safeWrap(() => response.clone());
  if (cloneError || !clonedResponse) {
    return null;
  }

  const [bodyError, body] = await safeWrapAsync(clonedResponse.json());
  if (bodyError || !body) {
    return null;
  }

  const [validationError, parsedBody] = safeWrap(() =>
    errorCodeResponseSchema.parse(body),
  );
  if (validationError || !parsedBody?.propagate) {
    return null;
  }

  return parsedBody.message;
}

export async function getRequestErrorMessage(
  error: Error | null,
  fallback: string,
) {
  if (!error) return fallback;
  return (
    getRateLimitMessage(error) ?? (await getAPIErrorMessage(error)) ?? fallback
  );
}

const RATE_LIMIT_STATUS = 429;
