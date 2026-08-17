import { createRoomPlaybackRequests } from '@vibes/api';
import type { PlaybackState } from '@vibes/models';
import type { ActionFunctionArgs, DataResult } from '@vibes/native-router';
import { createRemoteApi, getRequestErrorMessage } from '@/lib/api';

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
  | { intent: 'updated'; playback: PlaybackState };

export async function action({
  input,
  params,
  signal,
}: ActionFunctionArgs): Promise<DataResult<ControllerPlaybackActionData>> {
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
    if (error) return failure(error, 'Could not skip playback.');
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
): Promise<DataResult<ControllerPlaybackActionData>> {
  return { data: null, error: await getRequestErrorMessage(error, fallback) };
}

function isControllerPlaybackActionInput(
  input: unknown,
): input is ControllerPlaybackActionInput {
  if (!input || typeof input !== 'object' || !('intent' in input)) return false;
  return input.intent === 'skip' || input.intent === 'update';
}
