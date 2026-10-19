import type { LoaderFunctionArgs } from '@kasperrt/smolter/preact';

import { getThemeClass } from '@vibes/serve/theme';
import { getServerApi } from '../http.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const profileResult = new URL(request.url).pathname.endsWith(
    '/settings/device',
  )
    ? await getServerApi().get('/sessions', null, {
        headers: { Cookie: request.headers.get('cookie') ?? '' },
        signal: request.signal,
        retry: 0,
      })
    : null;
  return {
    profile: profileResult?.[1] ?? null,
    debug: process.env.VITE_DEBUG === 'true',
    themeClass: getThemeClass(request.headers.get('cookie')),
  };
}
