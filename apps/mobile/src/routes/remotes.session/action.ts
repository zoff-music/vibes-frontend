import type { ActionFunctionArgs, DataResult } from '@vibes/native-router';
import { deleteSecureValue, setSecureValue } from '@/lib/secure-storage';
import { remoteStorageKey, remoteTokenStorageKey } from '@/lib/storage-keys';

type RemoteSessionActionInput =
  | { intent: 'clear' }
  | { controllerToken: string; intent: 'save'; remoteId: string };

export async function action({
  input,
}: ActionFunctionArgs): Promise<DataResult<boolean>> {
  if (!isRemoteSessionActionInput(input)) {
    return { data: null, error: 'The remote session was invalid.' };
  }
  const results =
    input.intent === 'clear'
      ? await Promise.all([
          deleteSecureValue(remoteStorageKey),
          deleteSecureValue(remoteTokenStorageKey),
        ])
      : await Promise.all([
          setSecureValue(remoteStorageKey, input.remoteId),
          setSecureValue(remoteTokenStorageKey, input.controllerToken),
        ]);
  return results.some(([error]) => Boolean(error))
    ? { data: null, error: 'Could not save the remote session.' }
    : { data: true, error: '' };
}

function isRemoteSessionActionInput(
  input: unknown,
): input is RemoteSessionActionInput {
  if (!input || typeof input !== 'object' || !('intent' in input)) return false;
  return input.intent === 'clear' || input.intent === 'save';
}
