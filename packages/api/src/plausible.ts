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
  domain: string;
  name: string;
  props: PlausibleEventProperties;
  url: string;
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
      const body: PlausibleEventBody = {
        domain: plausibleDomain,
        name: pageviewEventName,
        props: { surface },
        url: new URL(path, canonicalOrigin).toString(),
      };
      const headers = new Headers({
        'Content-Type': 'application/json',
      });
      if (options.userAgent) headers.set('User-Agent', options.userAgent);
      const [requestError, request] = safeWrap(
        () =>
          new Request(plausibleEventUrl, {
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

export const plausibleClient = createPlausibleClient();

const canonicalOrigin = 'https://zoff.me';
const pageviewEventName = 'pageview';
const plausibleDomain = 'zoff.me';
const plausibleEventUrl = 'https://analytics.zoff.me/api/event';
