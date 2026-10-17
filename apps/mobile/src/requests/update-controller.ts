import { createRemoteRequests, getHttpError } from '@vibes/api';
import type { RemoteSessionV2, RemoteUpdateRequestV2 } from '@vibes/models';
import { getEstimatedServerTimeMs } from '@vibes/shared';
import type { MutationArgs, RequestResult } from '@vibes/shared/requests';
import {
  createRemoteApi,
  getRemoteRequestErrorMessage,
  mobileApi,
} from '@/lib/api';

type ControllerRemoteActionInput =
  | { intent: 'partyMode'; roomId: string; enabled: boolean }
  | { intent: 'changeRoom'; roomId: string }
  | { intent: 'resetPosition'; roomId: string }
  | {
      intent: 'pair';
      pairingCode?: string;
      pairingToken?: string;
    }
  | { intent: 'remoteState'; request: RemoteUpdateRequestV2 };

export type ControllerRemoteActionData =
  | { intent: 'paired'; session: RemoteSessionV2 }
  | { intent: 'success' };

export async function updateController({
  input,
  params,
  signal,
}: MutationArgs): Promise<RequestResult<ControllerRemoteActionData>> {
  const remoteId = params.id;

  if (!remoteId || !isControllerRemoteActionInput(input)) {
    return { data: null, error: 'The remote request was invalid.' };
  }

  if (input.intent === 'pair') {
    const [error, session] = await createRemoteRequests(mobileApi).pairRemote(
      remoteId,
      input.pairingToken
        ? { pairingToken: input.pairingToken }
        : { pairingCode: input.pairingCode ?? '' },
      { signal },
    );

    if (error || !session) {
      const status = error ? getHttpError(error)?.response.status : null;

      if (status === 401 || status === 403 || status === 410) {
        return {
          data: null,
          error:
            'This pairing code has expired or was already used. Open remote control on the player and generate a new code.',
        };
      }

      return failure(
        error,
        'Could not pair this remote. Check the pairing details.',
      );
    }

    return { data: { intent: 'paired', session }, error: '' };
  }

  const controllerToken = params.controllerToken;

  if (!controllerToken) {
    return { data: null, error: 'Remote credentials are required.' };
  }

  const client = createRemoteApi(remoteId, controllerToken);
  const remoteRequests = createRemoteRequests(client);

  if (input.intent === 'partyMode') {
    if (!input.roomId) return { data: null, error: 'Choose a room first.' };

    const [error] = await remoteRequests.updateRemote(
      remoteId,
      { roomId: input.roomId, partyMode: input.enabled },
      { signal },
    );

    if (error) return failure(error, 'Could not change party mode.');

    return { data: { intent: 'success' }, error: '' };
  }

  if (input.intent === 'resetPosition') {
    const [error, playback] = await client.v2.get('/rooms/{id}/states', {
      id: input.roomId,
    });

    if (error || !playback)
      return failure(error, 'Could not get the room playback position.');

    const elapsed = playback.isPlaying
      ? Math.max(0, getEstimatedServerTimeMs() - playback.serverTimeMs)
      : 0;
    const duration = (playback.currentPlaylistItem?.duration ?? 0) * 1_000;
    const [updateError] = await remoteRequests.updateRemote(
      remoteId,
      {
        currentPlaylistItemId: playback.currentPlaylistItem?.id ?? '',
        playbackIsPlaying: playback.isPlaying,
        playbackPositionMs: Math.min(
          playback.positionMs + elapsed,
          duration || Number.MAX_VALUE,
        ),
      },
      { signal },
    );

    if (updateError)
      return failure(updateError, 'Could not reset playback position.');

    return { data: { intent: 'success' }, error: '' };
  }

  if (input.intent === 'changeRoom') {
    const [error] = await remoteRequests.updateRemote(
      remoteId,
      {
        roomId: input.roomId,
      },
      { signal },
    );

    if (error) return failure(error, 'Could not change the controlled room.');

    return { data: { intent: 'success' }, error: '' };
  }

  if (input.intent === 'remoteState') {
    const [error] = await remoteRequests.updateRemote(remoteId, input.request, {
      signal,
    });

    if (error) return failure(error, 'Could not update remote playback.');

    return { data: { intent: 'success' }, error: '' };
  }

  return { data: null, error: 'That remote request is not supported.' };
}

async function failure(
  error: Error | null,
  fallback: string,
): Promise<RequestResult<ControllerRemoteActionData>> {
  return {
    data: null,
    error: await getRemoteRequestErrorMessage(error, fallback),
  };
}

function isControllerRemoteActionInput(
  input: unknown,
): input is ControllerRemoteActionInput {
  if (!input || typeof input !== 'object' || !('intent' in input)) return false;

  return [
    'changeRoom',
    'pair',
    'remoteState',
    'resetPosition',
    'partyMode',
  ].includes(String(input.intent));
}
