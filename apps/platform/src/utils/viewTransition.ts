export function canUseViewTransition(): boolean {
  if (typeof document === 'undefined') return false;
  if (document.visibilityState !== 'visible') return false;

  return typeof document.startViewTransition === 'function';
}
