import type { ActionFunctionArgs, DataResult } from '@vibes/native-router';
import { setSecureValue } from '@/lib/secure-storage';
import { themePreferenceStorageKey } from '@/lib/storage-keys';
import type { ThemePreference } from '@/providers/theme-provider';

export async function action({
  input,
}: ActionFunctionArgs): Promise<DataResult<ThemePreference>> {
  if (!isThemePreference(input)) {
    return { data: null, error: 'The theme preference was invalid.' };
  }
  const [error] = await setSecureValue(themePreferenceStorageKey, input);
  return error
    ? { data: null, error: 'Could not save the theme.' }
    : { data: input, error: '' };
}

function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'auto' || value === 'dark' || value === 'light';
}
