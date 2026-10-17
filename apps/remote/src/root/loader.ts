import type { LoaderFunctionArgs } from '@kasperrt/smolter/preact';

import { getThemeClass } from '@vibes/serve/theme';

export function loader({ request }: LoaderFunctionArgs) {
  return {
    debug: process.env.VITE_DEBUG === 'true',
    themeClass: getThemeClass(request.headers.get('cookie')),
  };
}
