export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastEventDetail {
  message: string;
  type: ToastType;
  duration?: number;
}

export function showToast(
  message: string,
  type: ToastType = 'info',
  duration?: number,
) {
  if (typeof window === 'undefined' || typeof CustomEvent === 'undefined') {
    return;
  }

  const detail: ToastEventDetail = {
    message,
    type,
    ...(duration && { duration }),
  };
  window.dispatchEvent(new CustomEvent(TOAST_EVENT_NAME, { detail }));
}

export const TOAST_EVENT_NAME = 'show-toast';
