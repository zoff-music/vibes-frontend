import type { DataResult } from '@vibes/native-router';
import { getSecureValue } from '@/lib/secure-storage';
import { remoteStorageKey, remoteTokenStorageKey } from '@/lib/storage-keys';

export interface StoredRemoteSession {
  controllerToken: string;
  id: string;
}

export async function loader(): Promise<
  DataResult<StoredRemoteSession | null>
> {
  const [idResult, tokenResult] = await Promise.all([
    getSecureValue(remoteStorageKey),
    getSecureValue(remoteTokenStorageKey),
  ]);
  if (idResult[0] || tokenResult[0]) {
    return { data: null, error: '' };
  }
  if (!idResult[1] || !tokenResult[1]) return { data: null, error: '' };
  return {
    data: { controllerToken: tokenResult[1], id: idResult[1] },
    error: '',
  };
}
