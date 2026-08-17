import { api, getAPIErrorMessage, getRateLimitMessage } from '@vibes/api';
import type { RemotePairing } from '@vibes/models';
import type { ClientActionFunctionArgs } from 'react-router';

export interface RemoteControlActionData {
  error?: string;
  intent: 'delete' | 'enable' | 'unknown';
  pairing?: RemotePairing;
}

export async function clientAction({
  request,
}: ClientActionFunctionArgs): Promise<RemoteControlActionData> {
  const formData = await request.formData();
  const intent = formData.get('intent');
  const remoteId = String(formData.get('remoteId') ?? '');
  const roomId = String(formData.get('roomId') ?? '');

  if (intent === 'enable') {
    const [error, pairing] = await api.post('/remotes', null, { roomId });
    if (error || !pairing) {
      return createErrorData('enable', error);
    }
    return { intent: 'enable', pairing };
  }

  if (intent === 'delete') {
    if (!remoteId) {
      return { error: 'Remote ID is required', intent: 'delete' };
    }
    const [error] = await api.delete('/remotes/{id}', { id: remoteId });
    if (error) {
      return createErrorData('delete', error);
    }
    return { intent: 'delete' };
  }

  return { error: 'Unknown remote control action', intent: 'unknown' };
}

async function createErrorData(
  intent: Exclude<RemoteControlActionData['intent'], 'unknown'>,
  error: Error | null,
) {
  return {
    error:
      (error && getRateLimitMessage(error)) ??
      (error ? await getAPIErrorMessage(error) : null) ??
      error?.message ??
      'The remote control request failed',
    intent,
  } satisfies RemoteControlActionData;
}
