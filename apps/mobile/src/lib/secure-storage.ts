import { safeWrapAsync } from '@vibes/shared';
import * as SecureStore from 'expo-secure-store';

const secureStorageTimeoutMs = 750;

function rejectAfterTimeout(): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(
      () => reject(new Error('Secure storage did not respond in time.')),
      secureStorageTimeoutMs,
    );
  });
}

export async function getSecureValue(key: string) {
  return safeWrapAsync(
    Promise.race([SecureStore.getItemAsync(key), rejectAfterTimeout()]),
  );
}

export async function setSecureValue(key: string, value: string) {
  return safeWrapAsync(
    Promise.race([SecureStore.setItemAsync(key, value), rejectAfterTimeout()]),
  );
}

export async function deleteSecureValue(key: string) {
  return safeWrapAsync(
    Promise.race([SecureStore.deleteItemAsync(key), rejectAfterTimeout()]),
  );
}
