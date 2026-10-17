import { safeWrapAsync } from '@vibes/shared';
import * as SecureStore from 'expo-secure-store';

const secureStorageTimeoutMs = 5_000;

function withStorageTimeout<T>(operation: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error('Secure storage did not respond in time.')),
      secureStorageTimeoutMs,
    );
  });

  return Promise.race([operation, timeout]).finally(() => clearTimeout(timer));
}

export async function getSecureValue(key: string) {
  return safeWrapAsync(withStorageTimeout(SecureStore.getItemAsync(key)));
}

export async function setSecureValue(key: string, value: string) {
  return safeWrapAsync(
    withStorageTimeout(SecureStore.setItemAsync(key, value)),
  );
}

export async function deleteSecureValue(key: string) {
  return safeWrapAsync(withStorageTimeout(SecureStore.deleteItemAsync(key)));
}
