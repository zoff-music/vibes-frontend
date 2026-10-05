import { getRequestErrorMessage } from '@vibes/api';
import type {
  PlaybackStateV2,
  PlaylistItem,
  Providers,
  PublicRoomV3,
  RoomV2,
} from '@vibes/models';
import type { LoaderFunctionArgs } from 'react-router';
import { tizenApi } from '@/tizen/api';

export interface TizenRoomSnapshot {
  playback: PlaybackStateV2;
  room: RoomV2;
  playlistItems: PlaylistItem[];
}

export interface TizenSessionLoaderData {
  error: string;
  providers: Providers;
  publicRooms: PublicRoomV3[];
  roomId: string;
  snapshot: TizenRoomSnapshot | null;
}

export async function loader({
  request,
}: LoaderFunctionArgs): Promise<TizenSessionLoaderData> {
  const roomId = new URL(request.url).searchParams.get('room')?.trim() ?? '';
  const discoveryResults = await Promise.all([
    tizenApi.get('/providers', null),
    tizenApi.v3.get('/rooms/public', {
      $search: { live: true, from: 0, to: 5 },
    }),
  ]);
  const providers = discoveryResults[0][1] ?? [];
  const publicRooms = discoveryResults[1][1]?.rooms ?? [];
  if (!roomId) {
    return {
      error: '',
      providers,
      publicRooms,
      roomId: '',
      snapshot: null,
    };
  }

  const snapshotResults = await Promise.all([
    tizenApi.v2.get('/rooms/{id}', { id: roomId }),
    tizenApi.v2.get('/rooms/{id}/playlist-items', { id: roomId }),
    tizenApi.v2.get('/rooms/{id}/states', { id: roomId }),
  ]);
  const requestError =
    snapshotResults[0][0] ?? snapshotResults[1][0] ?? snapshotResults[2][0];
  const room = snapshotResults[0][1];
  const playlistItems = snapshotResults[1][1];
  const playback = snapshotResults[2][1];
  if (requestError || !room || !playlistItems || !playback) {
    return {
      error: await getRequestErrorMessage(
        requestError,
        'Could not load that room.',
      ),
      providers,
      publicRooms,
      roomId: '',
      snapshot: null,
    };
  }

  return {
    error: '',
    providers,
    publicRooms,
    roomId,
    snapshot: { playback, room, playlistItems },
  };
}
