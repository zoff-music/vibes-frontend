import { safeWrap } from '@vibes/shared';

export function getThemeClass(cookieHeader: string | null) {
  if (!cookieHeader) return '';

  const preferencesCookie = cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${preferencesCookieName}=`));
  if (!preferencesCookie) return '';

  const separatorIndex = preferencesCookie.indexOf('=');
  const encoded = decodeURIComponent(
    preferencesCookie.slice(separatorIndex + 1).replace(/^"|"$/g, ''),
  );
  const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4;
  const padded =
    padding === 0 ? normalized : normalized + '='.repeat(4 - padding);
  const [error, preferences] = safeWrap<ThemePreferences>(() =>
    JSON.parse(Buffer.from(padded, 'base64').toString('utf-8')),
  );
  if (error) return '';
  if (preferences?.theme === 'dark') return 'dark';
  if (preferences?.theme === 'light') return 'theme-light';
  return '';
}

interface ThemePreferences {
  theme?: string;
}

const preferencesCookieName = 'preferences';
