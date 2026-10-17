import type { ColorScheme } from '@vibes/shared';
import { safeWrap } from '@vibes/shared/wrap';

export function getThemeFromCookies(cookieHeader: string | null): ColorScheme {
  const cookie = cookieHeader
    ?.split(';')
    .map((value) => value.trim())
    .find((value) => value.startsWith('preferences='));

  if (!cookie) return 'auto';

  const [error, preferences] = safeWrap((): unknown => {
    const encoded = decodeURIComponent(cookie.slice('preferences='.length));
    const value = encoded.replace(/^"|"$/g, '');

    return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
  });

  if (error || typeof preferences !== 'object' || preferences === null) {
    return 'auto';
  }

  if ('theme' in preferences) {
    if (preferences.theme === 'dark') return 'dark';

    if (preferences.theme === 'light') return 'light';
  }

  return 'auto';
}

export function getThemeClass(cookieHeader: string | null): string {
  const theme = getThemeFromCookies(cookieHeader);

  if (theme === 'dark') return 'dark';

  if (theme === 'light') return 'theme-light';

  return '';
}
