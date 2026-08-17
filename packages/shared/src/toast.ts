export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastEventDetail {
  dedupeKey?: string;
  message: string;
  priority?: number;
  type: ToastType;
  duration?: number;
}

export interface ToastOptions {
  dedupeKey?: string;
  priority?: number;
}

export function showToast(
  message: string,
  type: ToastType = 'info',
  duration?: number,
  options?: ToastOptions,
) {
  if (typeof window === 'undefined' || typeof CustomEvent === 'undefined') {
    return;
  }

  const detail: ToastEventDetail = {
    message,
    type,
    ...(duration && { duration }),
    ...options,
  };
  window.dispatchEvent(new CustomEvent(TOAST_EVENT_NAME, { detail }));
}

export function showRateLimitMessageToast(message: string) {
  const match = message.match(RETRY_AFTER_MESSAGE_PATTERN);
  const retryValue = match ? Number.parseInt(match[1] ?? '', 10) : 0;
  const retryAfterSeconds =
    match && (match[2] === 'minute' || match[2] === 'minutes')
      ? retryValue * SECONDS_PER_MINUTE
      : retryValue;
  showToast(message, 'warning', RATE_LIMIT_TOAST_DURATION, {
    dedupeKey: RATE_LIMIT_TOAST_DEDUPE_KEY,
    priority: Number.isFinite(retryAfterSeconds) ? retryAfterSeconds : 0,
  });
}

export const TOAST_EVENT_NAME = 'show-toast';

const RATE_LIMIT_TOAST_DURATION = 6000;
const RATE_LIMIT_TOAST_DEDUPE_KEY = 'rate-limit';
const RETRY_AFTER_MESSAGE_PATTERN =
  /Try again in (\d+) (second|seconds|minute|minutes)\./;
const SECONDS_PER_MINUTE = 60;
