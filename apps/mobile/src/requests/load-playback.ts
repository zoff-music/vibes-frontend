import { createRoomPlaybackRequests } from '@vibes/api';
import type { PlaybackStateV2 } from '@vibes/models';
import type { RequestArgs, RequestResult } from '@vibes/shared/requests';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';

const requests = createRoomPlaybackRequests(mobileApi);

export async function loadPlayback({
  params,
  signal,
}: RequestArgs): Promise<RequestResult<PlaybackStateV2>> {
  const roomId = params.id;

  if (!roomId) return { data: null, error: 'A room is required.' };

  const [error, playback] = await requests.fetchPlayback(roomId, { signal });

  if (error || !playback) {
    return {
      data: null,
      error: await getRequestErrorMessage(
        error,
        'Could not reset playback position.',
      ),
    };
  }

  return { data: playback, error: '' };
}
