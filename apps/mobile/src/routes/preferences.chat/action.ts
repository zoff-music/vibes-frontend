import type { MutationArgs, RequestResult } from '@vibes/shared/requests';
import { setSecureValue } from '@/lib/secure-storage';
import { chatPreferenceStorageKey } from '@/lib/storage-keys';

export interface ChatPreferenceActionData {
  enabled: boolean;
  warning: string;
}

export async function action({
  input,
}: MutationArgs): Promise<RequestResult<ChatPreferenceActionData>> {
  if (!input || typeof input !== 'object' || !('enabled' in input)) {
    return { data: null, error: 'The chat preference was invalid.' };
  }

  const enabled = input.enabled === true;
  const [error] = await setSecureValue(
    chatPreferenceStorageKey,
    enabled ? 'true' : 'false',
  );

  return {
    data: {
      enabled,
      warning: error
        ? 'Chat preference changed for this session, but could not be saved.'
        : '',
    },
    error: '',
  };
}
