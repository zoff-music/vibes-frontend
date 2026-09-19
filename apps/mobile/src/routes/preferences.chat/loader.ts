import type { DataResult } from '@vibes/native-router';
import { getSecureValue } from '@/lib/secure-storage';
import { chatPreferenceStorageKey } from '@/lib/storage-keys';

export interface ChatPreferenceData {
  enabled: boolean;
}

export async function loader(): Promise<DataResult<ChatPreferenceData>> {
  const [error, value] = await getSecureValue(chatPreferenceStorageKey);
  if (error) {
    return { data: { enabled: true }, error: '' };
  }
  return { data: { enabled: value !== 'false' }, error: '' };
}
