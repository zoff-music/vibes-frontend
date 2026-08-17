import type { DataResult } from '@vibes/native-router';
import { getSecureValue } from '@/lib/secure-storage';
import { playerPreferenceStorageKey } from '@/lib/storage-keys';

export interface PlayerPreferenceData {
  enabled: boolean;
}

export async function loader(): Promise<DataResult<PlayerPreferenceData>> {
  const [error, value] = await getSecureValue(playerPreferenceStorageKey);
  if (error) {
    return { data: { enabled: true }, error: '' };
  }
  return { data: { enabled: value !== 'false' }, error: '' };
}
