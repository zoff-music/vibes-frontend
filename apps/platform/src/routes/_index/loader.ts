import type { Providers, PublicRoomV3, StatsV2 } from '@vibes/models';
import type { LoaderFunctionArgs } from 'react-router';
import { getServerApi, getServerApiV3 } from '../../http.server';

export interface HomeLoaderData {
  data: {
    providers: Providers | null;
    publicRooms: Promise<PublicRoomV3[] | null>;
    stats: Promise<StatsV2 | null>;
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
  const publicRooms = serverApiV3
    .get(
      '/rooms/public',
      { $search: { live: true, from: 0, to: 2, roomType } },
      options,
    )
    .then(([error, result]) =>
      error ? null : result.rooms.filter((room) => room.roomType === roomType),
    );
  const [providersError, providers] = await serverApi.get(
    '/providers',
    null,
    options,
  );

  const data = {
    providers: providersError ? null : providers,
    publicRooms,
    stats,
  };

  return { data };
}
