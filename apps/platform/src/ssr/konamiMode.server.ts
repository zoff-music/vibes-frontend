import { safeWrap } from '@vibes/shared';
import { konamiModeCookieName } from '../components/konami/constants';

export function getKonamiModeFromCookies(cookieHeader: string | null): boolean {
  if (!cookieHeader) return false;

  const cookie = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${konamiModeCookieName}=`));
  if (!cookie) return false;

  const [, encodedValue = ''] = cookie.split('=', 2);
  const [decodeError, value] = safeWrap(() => decodeURIComponent(encodedValue));
  return !decodeError && value === 'enabled';
}
