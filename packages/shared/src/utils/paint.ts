import { safeWrap } from '../wrap';

const FIRST_CONTENTFUL_PAINT = 'first-contentful-paint';
// Hidden tabs report no paint; never hold provider players or room streams back longer than this.
const FIRST_PAINT_FALLBACK_MS = 3000;

let firstPaint: Promise<void> | null = null;

/**
 * Resolves once the document has loaded and painted its first content. Heavy third-party frames
 * (provider players, the Cast SDK) and long-lived streams wait for it, so they never compete with
 * the server-rendered page's first paint on slow devices. Client navigations and non-DOM runtimes
 * resolve immediately.
 */
export function afterFirstPaint(): Promise<void> {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return Promise.resolve();
  }

  firstPaint ??= new Promise<void>((resolve) => {
    let settled = false;
    let observer: PerformanceObserver | null = null;
    const afterLoad = () => {
      if (document.readyState === 'complete') {
        resolve();

        return;
      }

      window.addEventListener('load', () => resolve(), { once: true });
    };
    const settle = () => {
      if (settled) return;

      settled = true;
      observer?.disconnect();
      window.clearTimeout(fallback);
      afterLoad();
    };
    const fallback = window.setTimeout(settle, FIRST_PAINT_FALLBACK_MS);

    if (
      performance.getEntriesByName?.(FIRST_CONTENTFUL_PAINT).length > 0 ||
      typeof PerformanceObserver === 'undefined' ||
      !PerformanceObserver.supportedEntryTypes?.includes('paint')
    ) {
      settle();

      return;
    }

    const [error, created] = safeWrap(() => {
      const paintObserver = new PerformanceObserver((list) => {
        if (list.getEntriesByName(FIRST_CONTENTFUL_PAINT).length > 0) settle();
      });
      paintObserver.observe({ type: 'paint', buffered: true });

      return paintObserver;
    });

    if (error || !created) {
      settle();

      return;
    }

    observer = created;
  });

  return firstPaint;
}
