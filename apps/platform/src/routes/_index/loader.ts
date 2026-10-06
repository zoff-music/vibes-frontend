import type { Providers, PublicRoomV3, StatsV2 } from '@vibes/models';
import type { LoaderFunctionArgs } from 'react-router';
import { getServerApi, getServerApiV3 } from '../../http.server';

export interface HomeLoaderData {
  data: {
    providers: Providers | null;
    publicRooms: PublicRoomV3[] | null;
    stats: StatsV2 | null;
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
  const [statsResult, providersResult, publicRoomsResult] = await Promise.all([
    serverApi.v2.get('/stats', { $search: { roomType } }, options),
    serverApi.get('/providers', null, options),
    serverApiV3.get(
      '/rooms/public',
      { $search: { live: true, from: 0, to: 2, roomType } },
      options,
    ),
  ]);
  const [statsError, stats] = statsResult;
  const [providersError, providers] = providersResult;
  const [publicRoomsError, publicRooms] = publicRoomsResult;
  const data = {
    providers: providersError ? null : providers,
    publicRooms: publicRoomsError
      ? null
      : (publicRooms?.rooms.filter((room) => room.roomType === roomType) ??
        null),
    stats: statsError ? null : stats,
  };

  return { data };
}
