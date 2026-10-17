import type { ClientActionFunctionArgs } from '@kasperrt/smolter/preact';
import { api, getAPIErrorMessage, getRateLimitMessage } from '@vibes/api';
import type { RemotePairingV2 } from '@vibes/models';
import { usePlaybackStore } from '@vibes/shared';

export interface RemoteControlActionData {
  error?: string;
  intent: 'delete' | 'enable' | 'update' | 'unknown';
  pairing?: RemotePairingV2;
}

export async function clientAction({
  request,
}: ClientActionFunctionArgs): Promise<RemoteControlActionData> {
  const formData = await request.formData();
  const intent = formData.get('intent');
  const remoteId = String(formData.get('remoteId') ?? '');
  const roomId = String(formData.get('roomId') ?? '');

  const playback = usePlaybackStore.getState();
  const playbackUpdate = {
    roomId,
    partyMode: Boolean(roomId) && formData.get('partyMode') === 'true',
    currentPlaylistItemId: roomId
      ? (playback.currentPlaylistItem?.id ?? '')
      : '',
    playbackIsPlaying: Boolean(roomId && playback.isPlaying),
    playbackPositionMs: roomId ? playback.actualPositionMs : 0,
  };

  if (intent === 'enable') {
    const [error, pairing] = await api.v2.post(
      '/remotes',
      null,
      playbackUpdate,
      { signal: request.signal },
    );

    if (error || !pairing) {
      return createErrorData('enable', error);
    }

    return { intent: 'enable', pairing };
  }

  if (intent === 'update') {
    if (!remoteId) {
      return { error: 'Remote ID is required', intent: 'update' };
    }

    const [error] = await api.v2.patch(
      '/remotes/{id}',
      { id: remoteId },
      playbackUpdate,
      { signal: request.signal },
    );

    if (error) return createErrorData('update', error);

    return { intent: 'update' };
  }

  if (intent === 'delete') {
    if (!remoteId) {
      return { error: 'Remote ID is required', intent: 'delete' };
    }

    const [error] = await api.delete(
      '/remotes/{id}',
      { id: remoteId },
      { signal: request.signal },
    );

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
      'The remote control request failed',
    intent,
  } satisfies RemoteControlActionData;
}
