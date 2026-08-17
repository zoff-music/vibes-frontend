import { createRoomPlaybackRequests } from '@vibes/api';
import type { PlaybackState } from '@vibes/models';
import type { DataResult, LoaderFunctionArgs } from '@vibes/native-router';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';

const requests = createRoomPlaybackRequests(mobileApi);

export async function loader({
  params,
  signal,
}: LoaderFunctionArgs): Promise<DataResult<PlaybackState>> {
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
