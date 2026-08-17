import {
  createRemoteRequests,
  createRoomPlaybackRequests,
  createRoomReadRequests,
  getHttpError,
} from '@vibes/api';
import type { RemoteStatus } from '@vibes/models';
import type { DataResult, LoaderFunctionArgs } from '@vibes/native-router';
import type { RoomSnapshot } from '@/data-router/room-snapshot';
import { createRemoteApi, getRequestErrorMessage } from '@/lib/api';

export interface ControllerRemoteData {
  remote: RemoteStatus;
  snapshot: RoomSnapshot | null;
}

export async function loader({
  params,
  signal,
}: LoaderFunctionArgs): Promise<DataResult<ControllerRemoteData>> {
  const remoteId = params.id;
  const controllerToken = params.controllerToken;
  if (!remoteId || !controllerToken) {
    return { data: null, error: 'Remote credentials are required.' };
  }
  const client = createRemoteApi(remoteId, controllerToken);
  const [remoteError, remote] = await createRemoteRequests(client).fetchRemote(
    remoteId,
    { signal },
  );
  if (remoteError || !remote) {
    const status = remoteError
      ? getHttpError(remoteError)?.response.status
      : null;
    return {
      data: null,
      error: invalidRemoteStatuses.includes(status ?? 0)
        ? 'REMOTE_CREDENTIALS_INVALID'
        : await getRequestErrorMessage(remoteError, 'Remote is unavailable.'),
    };
  }
  if (!remote.currentRoomId) {
    return {
      data: { remote, snapshot: null },
      error: '',
    };
  }
  const readRequests = createRoomReadRequests(client);
  const playbackRequests = createRoomPlaybackRequests(client);
  const [roomResult, songsResult, playbackResult] = await Promise.all([
    readRequests.fetchRoom(remote.currentRoomId, { signal }),
    readRequests.fetchSongs(remote.currentRoomId, { signal }),
    playbackRequests.fetchPlayback(remote.currentRoomId, { signal }),
  ]);
  const roomError = roomResult[0] ?? songsResult[0] ?? playbackResult[0];
  if (roomError || !roomResult[1] || !songsResult[1] || !playbackResult[1]) {
    return {
      data: null,
      error: await getRequestErrorMessage(
        roomError,
        'Controlled room is unavailable.',
      ),
    };
  }
  const snapshot: RoomSnapshot = {
    playback: playbackResult[1],
    room: roomResult[1],
    songs: songsResult[1],
  };
  return {
    data: { remote, snapshot },
    error: '',
  };
}

const invalidRemoteStatuses = [401, 403, 404, 410];
