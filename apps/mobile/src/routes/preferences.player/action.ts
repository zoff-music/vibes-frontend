import type { ActionFunctionArgs, DataResult } from '@vibes/native-router';
import { setSecureValue } from '@/lib/secure-storage';
import { playerPreferenceStorageKey } from '@/lib/storage-keys';

export async function action({
  input,
}: ActionFunctionArgs): Promise<DataResult<boolean>> {
  if (!input || typeof input !== 'object' || !('enabled' in input)) {
    return { data: null, error: 'The player preference was invalid.' };
  }
  const enabled = input.enabled === true;
  const [error] = await setSecureValue(
    playerPreferenceStorageKey,
    enabled ? 'true' : 'false',
  );
  return error
    ? { data: null, error: 'Could not save the player preference.' }
    : { data: enabled, error: '' };
}
