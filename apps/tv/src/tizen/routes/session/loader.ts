import { getRequestErrorMessage } from '@vibes/api';
import type {
  PlaybackState,
  Providers,
  PublicRoom,
  Room,
  Song,
} from '@vibes/models';
import type { LoaderFunctionArgs } from 'react-router';
import { tizenApi } from '@/tizen/api';

export interface TizenRoomSnapshot {
  playback: PlaybackState;
  room: Room;
  songs: Song[];
}

export interface TizenSessionLoaderData {
  error: string;
  loadedAt: number;
  providers: Providers;
  publicRooms: PublicRoom[];
  roomId: string;
  snapshot: TizenRoomSnapshot | null;
}

export async function loader({
  request,
}: LoaderFunctionArgs): Promise<TizenSessionLoaderData> {
  const roomId = new URL(request.url).searchParams.get('room')?.trim() ?? '';
  const discoveryResults = await Promise.all([
    tizenApi.get('/providers', null),
    tizenApi.get('/rooms/public', null),
  ]);
  const providers = discoveryResults[0][1] ?? [];
  const publicRooms = discoveryResults[1][1] ?? [];
  if (!roomId) {
    return {
      error: '',
      loadedAt: Date.now(),
      providers,
      publicRooms,
      roomId: '',
      snapshot: null,
    };
  }

  const snapshotResults = await Promise.all([
    tizenApi.get('/rooms/{id}', { id: roomId }),
    tizenApi.get('/rooms/{id}/songs', { id: roomId }),
    tizenApi.get('/rooms/{id}/states', { id: roomId }),
  ]);
  const requestError =
    snapshotResults[0][0] ?? snapshotResults[1][0] ?? snapshotResults[2][0];
  const room = snapshotResults[0][1];
  const songs = snapshotResults[1][1];
  const playback = snapshotResults[2][1];
  if (requestError || !room || !songs || !playback) {
    return {
      error: await getRequestErrorMessage(
        requestError,
        'Could not load that room.',
      ),
      loadedAt: Date.now(),
      providers,
      publicRooms,
      roomId: '',
      snapshot: null,
    };
  }

  return {
    error: '',
    loadedAt: Date.now(),
    providers,
    publicRooms,
    roomId,
    snapshot: { playback, room, songs },
  };
}
