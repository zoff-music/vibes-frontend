import type { ClientLoaderFunctionArgs } from '@kasperrt/smolter/preact';
import { api, createPublicRequestCache, getProviders } from '@vibes/api';
import type { PublicRoomV3 } from '@vibes/models';
import type { HomeLoaderData } from './loader';

const readRooms = createPublicRequestCache<PublicRoomV3[]>(10_000);

export async function clientLoader({
  request,
  params,
}: ClientLoaderFunctionArgs): Promise<HomeLoaderData> {
  const roomType = params.experience === 'watch' ? 'WATCH' : 'MUSIC';
  const options = { retry: 0, signal: request.signal };
  const rooms = readRooms(
    roomType,
    async (signal) => {
      const [error, result] = await api.v3.get(
        '/rooms/public',
        { $search: { live: true, from: 0, to: 2, roomType } },
        { retry: 0, signal },
      );

      if (error) return [error, null];

      return [null, result.rooms.filter((room) => room.roomType === roomType)];
    },
    request.signal,
  );
  const [[providersError, providers], [roomsError, publicRooms]] =
    await Promise.all([getProviders(options), rooms]);

  return {
    data: {
      providers: providersError ? null : providers,
      publicRooms: roomsError ? null : publicRooms,
      stats: null,
    },
  };
}
