import type { MutationArgs, RequestResult } from '@vibes/shared/requests';
import { setSecureValue } from '@/lib/secure-storage';
import { themePreferenceStorageKey } from '@/lib/storage-keys';
import type { ThemePreference } from '@/providers/theme-provider';

export interface ThemeActionData {
  preference: ThemePreference;
  warning: string;
}

export async function action({
  input,
}: MutationArgs): Promise<RequestResult<ThemeActionData>> {
  if (!isThemePreference(input)) {
    return { data: null, error: 'The theme preference was invalid.' };
  }

  const [error] = await setSecureValue(themePreferenceStorageKey, input);

  return {
    data: {
      preference: input,
      warning: error
        ? 'Theme changed for this session, but could not be saved.'
        : '',
    },
    error: '',
  };
}

function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'auto' || value === 'dark' || value === 'light';
}
