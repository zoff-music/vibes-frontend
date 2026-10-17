import type { ClientLoaderFunctionArgs } from '@kasperrt/smolter/preact';
import { getRequestErrorMessage } from '@vibes/api';
import type {
  Providers,
  PublicRoomV3,
  RoomSnapshot,
  RoomType,
} from '@vibes/models';
import { tizenApi } from '@/tizen/api';

export interface TizenSessionLoaderData {
  roomType: RoomType;
  error: string;
  providers: Providers;
  publicRooms: PublicRoomV3[];
  roomId: string;
  snapshot: RoomSnapshot | null;
}

export async function clientLoader({
  request,
}: ClientLoaderFunctionArgs): Promise<TizenSessionLoaderData> {
  const roomId = new URL(request.url).searchParams.get('room')?.trim() ?? '';
  const options = { signal: request.signal };
  const roomType =
    new URL(request.url).searchParams.get('type') === 'watch'
      ? 'WATCH'
      : 'MUSIC';
  const discoveryResults = await Promise.all([
    tizenApi.get('/providers', null, options),
    tizenApi.v3.get(
      '/rooms/public',
      {
        $search: { live: true, from: 0, to: 5, roomType },
      },
      options,
    ),
  ]);
  const providers = discoveryResults[0][1] ?? [];
  const publicRooms = discoveryResults[1][1]?.rooms ?? [];

  if (!roomId) {
    return {
      roomType,
      error: '',
      providers,
      publicRooms,
      roomId: '',
      snapshot: null,
    };
  }

  const snapshotResults = await Promise.all([
    tizenApi.v2.get('/rooms/{id}', { id: roomId }, options),
    tizenApi.v3.get('/rooms/{id}/items', { id: roomId, $search: {} }, options),
    tizenApi.v2.get('/rooms/{id}/states', { id: roomId }, options),
  ]);
  const requestError =
    snapshotResults[0][0] ?? snapshotResults[1][0] ?? snapshotResults[2][0];
  const room = snapshotResults[0][1];
  const playlistItems = snapshotResults[1][1]?.data;
  const playback = snapshotResults[2][1];

  if (requestError || !room || !playlistItems || !playback) {
    return {
      roomType,
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
    roomType: room.roomType,
    error: '',
    providers,
    publicRooms,
    roomId,
    snapshot: { playback, room, playlistItems },
  };
}
