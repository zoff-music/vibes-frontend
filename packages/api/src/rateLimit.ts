import { errorCodeResponseSchema } from '@vibes/models';
import { safeWrap, safeWrapAsync, showToast } from '@vibes/shared';
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

  const [bodyError, body] = await safeWrapAsync(response.clone().json());
  if (bodyError || !body) {
    return null;
  }

  const [validationError, parsedBody] = safeWrap(() =>
    errorCodeResponseSchema.validateSync(body),
  );
  if (validationError || !parsedBody?.propagate) {
    return null;
  }

  return parsedBody.message;
}

export function showRateLimitToast(response: Response) {
  const message = getRateLimitMessageFromResponse(response);
  if (!message) {
    return;
  }

  showRateLimitMessageToast(message, getRetryAfterSeconds(response));
}

export function showRateLimitMessageToast(
  message: string,
  retryAfterSeconds?: number | null,
) {
  const priority =
    retryAfterSeconds ?? getRetryAfterSecondsFromMessage(message);
  showToast(message, 'warning', RATE_LIMIT_TOAST_DURATION, {
    dedupeKey: RATE_LIMIT_TOAST_DEDUPE_KEY,
    priority,
  });
}

function getRetryAfterSecondsFromMessage(message: string) {
  const match = message.match(RETRY_AFTER_MESSAGE_PATTERN);
  if (!match) {
    return 0;
  }

  const value = Number.parseInt(match[1], 10);
  if (!Number.isFinite(value)) {
    return 0;
  }

  return match[2] === 'minute' || match[2] === 'minutes' ? value * 60 : value;
}

const RATE_LIMIT_STATUS = 429;

const RATE_LIMIT_TOAST_DURATION = 6000;

const RATE_LIMIT_TOAST_DEDUPE_KEY = 'rate-limit';

const RETRY_AFTER_MESSAGE_PATTERN =
  /Try again in (\d+) (second|seconds|minute|minutes)\./;
