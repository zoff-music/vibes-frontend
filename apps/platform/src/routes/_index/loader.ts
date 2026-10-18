import type { LoaderFunctionArgs } from '@kasperrt/smolter/preact';
import { createProvidersRequest, createPublicRequestCache } from '@vibes/api';
import type { Providers, PublicRoomV3, StatsV2 } from '@vibes/models';
import { getServerApi, getServerApiV3 } from '../../http.server';

const readPublicRooms = createPublicRequestCache<PublicRoomV3[]>(10_000);

export interface HomeLoaderData {
  data: {
    providers: Providers | null;
    publicRooms: PublicRoomV3[] | null;
    stats: Promise<StatsV2 | null> | null;
  };
}

export async function loader({
  request,
  params,
}: LoaderFunctionArgs): Promise<HomeLoaderData> {
  const serverApi = getServerApi(request);
  const serverApiV3 = getServerApiV3(request);
  const options = { retry: 0, signal: request.signal };
  const roomType = params.experience === 'watch' ? 'WATCH' : 'MUSIC';
  const stats = serverApi.v2
    .get('/stats', { $search: { roomType } }, options)
    .then(([error, result]) => (error ? null : result));
  const apiOrigin =
    process.env.VITE_API_URL_INTERNAL || new URL(request.url).origin;
  const publicRoomsRequest = readPublicRooms(
    `${apiOrigin}:${roomType}`,
    async (signal) => {
      const [error, result] = await serverApiV3.get(
        '/rooms/public',
        { $search: { live: true, from: 0, to: 2, roomType } },
        { retry: 0, signal },
      );

      if (error) return [error, null];

      return [null, result.rooms.filter((room) => room.roomType === roomType)];
    },
    request.signal,
  );
  const getProviders = createProvidersRequest(serverApi);
  const [providersError, providers] = await getProviders(options);
  const [roomsError, publicRooms] = await publicRoomsRequest;

  const data = {
    providers: providersError ? null : providers,
    publicRooms: roomsError ? null : publicRooms,
    stats,
  };

  return { data };
}
