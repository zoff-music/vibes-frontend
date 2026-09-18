const TRUTHY_VALUES = new Set(['true', '1', 'yes', 'on']);

export const isTruthyFlag = (value?: string | null): boolean => {
  if (!value) return false;
  return TRUTHY_VALUES.has(value.trim().toLowerCase());
};

export const isBrowserDebugEnabled = (): boolean =>
  typeof document !== 'undefined' &&
  document.documentElement.dataset.debug === 'true';

export const browserDebugLog = (...args: unknown[]): void => {
  if (typeof document !== 'undefined' && !isBrowserDebugEnabled()) return;
  console.log(...args);
};
