// Hydration-only UI is outside the inlined subset, so it must not render before the full sheet.
export function waitForCriticalStylesheet() {
  const stylesheet = document.querySelector<HTMLLinkElement>(
    'link[data-critical-stylesheet]',
  );
  if (!stylesheet || stylesheet.sheet) return Promise.resolve();

  return new Promise<void>((resolve) => {
    stylesheet.addEventListener('load', () => resolve(), { once: true });
    stylesheet.addEventListener('error', () => resolve(), { once: true });
  });
}
