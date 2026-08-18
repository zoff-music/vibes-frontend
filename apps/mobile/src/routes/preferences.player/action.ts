import type { ActionFunctionArgs, DataResult } from '@vibes/native-router';
import { setSecureValue } from '@/lib/secure-storage';
import { playerPreferenceStorageKey } from '@/lib/storage-keys';

export interface PlayerPreferenceActionData {
  enabled: boolean;
  warning: string;
}

export async function action({
  input,
}: ActionFunctionArgs): Promise<DataResult<PlayerPreferenceActionData>> {
  if (!input || typeof input !== 'object' || !('enabled' in input)) {
    return { data: null, error: 'The player preference was invalid.' };
  }
  const enabled = input.enabled === true;
  const [error] = await setSecureValue(
    playerPreferenceStorageKey,
    enabled ? 'true' : 'false',
  );
  return {
    data: {
      enabled,
      warning: error
        ? 'Player preference changed for this session, but could not be saved.'
        : '',
    },
    error: '',
  };
}
