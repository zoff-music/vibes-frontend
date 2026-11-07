/**
 * Resolves once the document has finished loading. Long-lived streams opened during load sit on the
 * page's critical request chain without changing what renders: the server already sent the state.
 * Client navigations and non-DOM runtimes resolve immediately.
 */
export function afterDocumentLoad(): Promise<void> {
  if (typeof document === 'undefined' || document.readyState === 'complete') {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    window.addEventListener('load', () => resolve(), { once: true });
  });
}
