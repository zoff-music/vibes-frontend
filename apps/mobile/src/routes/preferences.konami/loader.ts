import type { DataResult } from '@vibes/native-router';
import { getSecureValue } from '@/lib/secure-storage';
import { konamiModeStorageKey } from '@/lib/storage-keys';

export async function loader(): Promise<DataResult<boolean>> {
  const [error, value] = await getSecureValue(konamiModeStorageKey);
  if (error) return { data: false, error: '' };
  return { data: value === enabledStorageValue, error: '' };
}

const enabledStorageValue = 'enabled';
