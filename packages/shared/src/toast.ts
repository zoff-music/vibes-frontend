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

export const TOAST_EVENT_NAME = 'show-toast';
