import { safeWrap, safeWrapAsync } from '@vibes/shared/wrap';

import { analyticsDisabled } from './plausible';

export function initializeBrowserAnalytics() {
  if (typeof window === 'undefined' || analyticsDisabled()) return;

  const initialize = async () => {
    if (analyticsDisabled()) return;
    const [error, tracker] = await safeWrapAsync(
      import('@plausible-analytics/tracker'),
    );
    if (error || !tracker || analyticsDisabled()) return;

    safeWrap(() =>
      tracker.init({
        domain: 'zoff.me',
        endpoint: '/api/v1/activities',
        outboundLinks: true,
        transformRequest: (payload) => {
          if (analyticsDisabled()) return null;
          return payload;
        },
      }),
    );
  };

  // Keep tracker layout reads after load and a paint opportunity, as before.
  const schedule = () => {
    requestAnimationFrame(() => requestAnimationFrame(initialize));
  };

  if (document.readyState === 'complete') {
    schedule();
    return;
  }
  window.addEventListener('load', schedule, { once: true });
}
