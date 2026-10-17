import type { RequestResult } from '@vibes/shared/requests';
import { getSecureValue } from '@/lib/secure-storage';
import { themePreferenceStorageKey } from '@/lib/storage-keys';
import type { ThemePreference } from '@/providers/theme-provider';

export async function loader(): Promise<RequestResult<ThemePreference>> {
  const [error, value] = await getSecureValue(themePreferenceStorageKey);

  if (error) return { data: 'auto', error: '' };

  return { data: isThemePreference(value) ? value : 'auto', error: '' };
}

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'auto' || value === 'dark' || value === 'light';
}
