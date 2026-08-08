import { api, getAPIErrorMessage, getRateLimitMessage } from '@vibes/api';
import type { RemotePairing, RemoteStatus } from '@vibes/models';
import type { ClientActionFunctionArgs } from 'react-router';

export interface RemoteControlActionData {
  error?: string;
  intent: 'delete' | 'enable' | 'heartbeat';
  pairing?: RemotePairing;
  remote?: RemoteStatus;
}

export async function clientAction({
  request,
}: ClientActionFunctionArgs): Promise<RemoteControlActionData> {
  const formData = await request.formData();
  const intent = formData.get('intent');
  const remoteId = String(formData.get('remoteId') ?? '');
  const roomId = String(formData.get('roomId') ?? '');
  const currentSongId = String(formData.get('currentSongId') ?? '');
  const playbackPositionMs = Number(formData.get('playbackPositionMs') ?? 0);
  const playbackIsPlaying =
    String(formData.get('playbackIsPlaying') ?? 'false') === 'true';

  if (intent === 'enable') {
    const [error, pairing] = await api.post('/remotes', null, { roomId });
    if (error || !pairing) {
      return createErrorData('enable', error);
    }
    return { intent: 'enable', pairing };
  }

  if (intent === 'heartbeat') {
    if (!remoteId) {
      return { error: 'Remote ID is required', intent: 'heartbeat' };
    }
    const [error] = await api.patch(
      '/remotes/{id}',
      { id: remoteId },
      {
        currentSongId,
        playbackIsPlaying,
        playbackPositionMs,
        roomId,
      },
    );
    if (error) {
      return createErrorData('heartbeat', error);
    }
    return { intent: 'heartbeat' };
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

  return { error: 'Unknown remote control action', intent: 'heartbeat' };
}

async function createErrorData(
  intent: RemoteControlActionData['intent'],
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
