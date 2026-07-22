import { showToast } from '@vibes/shared';
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
  return `Easy there — too many requests. ${retryAfter}`;
}

export function getRateLimitMessage(error: Error) {
  const response = getHttpError(error)?.response;
  if (!response) {
    return null;
  }

  return getRateLimitMessageFromResponse(response);
}

export function showRateLimitToast(response: Response) {
  const message = getRateLimitMessageFromResponse(response);
  if (!message) {
    return;
  }

  showToast(message, 'warning', RATE_LIMIT_TOAST_DURATION);
}

const RATE_LIMIT_STATUS = 429;

const RATE_LIMIT_TOAST_DURATION = 6000;
