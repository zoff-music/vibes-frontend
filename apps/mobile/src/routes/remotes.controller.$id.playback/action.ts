import { createRoomPlaybackRequests } from '@vibes/api';
import type { PlaybackStateV2 } from '@vibes/models';
import type { MutationArgs, RequestResult } from '@vibes/shared/requests';
import { createRemoteApi, getRemoteRequestErrorMessage } from '@/lib/api';

type ControllerPlaybackActionInput =
  | {
      action: 'pause' | 'play' | 'seek';
      intent: 'update';
      positionMs?: number;
      roomId: string;
    }
  | { intent: 'skip'; roomId: string };

export type ControllerPlaybackActionData =
  | { intent: 'success' }
  | { intent: 'updated'; playback: PlaybackStateV2 };

export async function action({
  input,
  params,
  signal,
}: MutationArgs): Promise<RequestResult<ControllerPlaybackActionData>> {
  const remoteId = params.id;
  const controllerToken = params.controllerToken;

  if (
    !remoteId ||
    !controllerToken ||
    !isControllerPlaybackActionInput(input)
  ) {
    return { data: null, error: 'The remote playback request was invalid.' };
  }

  const requests = createRoomPlaybackRequests(
    createRemoteApi(remoteId, controllerToken),
  );

  if (input.intent === 'skip') {
    const [error] = await requests.skip(input.roomId, { signal });

    if (error) return failure(error, 'Failed to skip. Please try again.');

    return { data: { intent: 'success' }, error: '' };
  }

  const [error, playback] = await requests.updatePlayback(
    input.roomId,
    input.action,
    input.positionMs,
    { signal },
  );

  if (error || !playback) return failure(error, 'Could not update playback.');

  return { data: { intent: 'updated', playback }, error: '' };
}

async function failure(
  error: Error | null,
  fallback: string,
): Promise<RequestResult<ControllerPlaybackActionData>> {
  return {
    data: null,
    error: await getRemoteRequestErrorMessage(error, fallback),
  };
}

function isControllerPlaybackActionInput(
  input: unknown,
): input is ControllerPlaybackActionInput {
  if (!input || typeof input !== 'object' || !('intent' in input)) return false;

  return input.intent === 'skip' || input.intent === 'update';
}
