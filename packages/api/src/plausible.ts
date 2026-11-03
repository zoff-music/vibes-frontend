import { safeWrap, safeWrapAsync } from '@vibes/shared/wrap';

import type { ApiFetch } from './fetchProvider';

export type PlausibleSurface =
  | 'admin'
  | 'cast'
  | 'embed'
  | 'mobile'
  | 'remote'
  | 'tv';

export interface PlausiblePageview {
  path: string;
  surface: PlausibleSurface;
}

export interface PlausibleClient {
  trackPageview: (pageview: PlausiblePageview) => Promise<void>;
}

interface PlausibleClientOptions {
  fetcher?: ApiFetch;
  userAgent?: string;
}

interface PlausibleEventBody {
  d: string;
  n: string;
  p: PlausibleEventProperties;
  u: string;
}

interface PlausibleEventProperties {
  surface: PlausibleSurface;
}

export function createPlausibleClient(
  options: PlausibleClientOptions = {},
): PlausibleClient {
  const fetcher = options.fetcher ?? fetch;

  return {
    trackPageview: async ({ path, surface }) => {
      if (analyticsDisabled()) return;
      const body: PlausibleEventBody = {
        d: plausibleDomain,
        n: pageviewEventName,
        p: { surface },
        u: new URL(path, canonicalOrigin).toString(),
      };
      const headers = new Headers({
        'Content-Type': 'application/json',
      });

      if (options.userAgent) headers.set('User-Agent', options.userAgent);

      const endpoint =
        typeof document !== 'undefined' &&
        window.location.origin === canonicalOrigin
          ? new URL('/api/v1/activities', canonicalOrigin).toString()
          : plausibleEventUrl;
      const [requestError, request] = safeWrap(
        () =>
          new Request(endpoint, {
            body: JSON.stringify(body),
            headers,
            method: 'POST',
          }),
      );

      if (requestError || !request) return;

      await safeWrapAsync(fetcher(request));
    },
  };
}

export function getRoomAnalyticsPath(roomId: string) {
  return `/${encodeURIComponent(roomId.trim().toLowerCase())}`;
}

export function analyticsDisabled() {
  if (typeof document === 'undefined') return false;
  if (navigator.doNotTrack === '1') return true;
  if (
    'globalPrivacyControl' in navigator &&
    navigator.globalPrivacyControl === true
  )
    return true;
  const [, ignored] = safeWrap(() => localStorage.getItem('plausible_ignore'));
  return ignored === 'true';
}

export const plausibleClient = createPlausibleClient();

const canonicalOrigin = 'https://zoff.me';
const pageviewEventName = 'pageview';
const plausibleDomain = 'zoff.me';
const plausibleEventUrl = 'https://analytics.zoff.me/api/event';
