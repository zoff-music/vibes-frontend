import type { ActionFunctionArgs, DataResult } from '@vibes/native-router';
import { deleteSecureValue, setSecureValue } from '@/lib/secure-storage';
import { konamiModeStorageKey } from '@/lib/storage-keys';

export interface KonamiModeActionData {
  enabled: boolean;
  warning: string;
}

export async function action({
  input,
}: ActionFunctionArgs): Promise<DataResult<KonamiModeActionData>> {
  if (typeof input !== 'boolean') {
    return { data: null, error: 'The hidden mode preference was invalid.' };
  }

  const [error] = input
    ? await setSecureValue(konamiModeStorageKey, enabledStorageValue)
    : await deleteSecureValue(konamiModeStorageKey);

  return {
    data: {
      enabled: input,
      warning: error
        ? 'The hidden mode changed for this session, but could not be saved.'
        : '',
    },
    error: '',
  };
}

const enabledStorageValue = 'enabled';
