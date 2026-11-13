import type { LoaderFunctionArgs } from '@kasperrt/smolter/preact';
import { createProvidersRequest } from '@vibes/api';
import type { Providers, StatsV2 } from '@vibes/models';
import { getServerApi } from '../../http.server';
import type { RoomDiscoveryData } from '../../utils/roomDiscovery';
import { loader as loadRooms } from '../resources.rooms/loader';

export interface HomeLoaderData {
  data: {
    roomDiscovery: RoomDiscoveryData;
    providers: Providers | null;
    stats: Promise<StatsV2 | null> | null;
  };
}

export async function loader(
  args: LoaderFunctionArgs,
): Promise<HomeLoaderData> {
  const { request, params } = args;
  const serverApi = getServerApi(request);
  const options = { retry: 0, signal: request.signal };
  const roomType = params.experience === 'watch' ? 'WATCH' : 'MUSIC';
  const stats = serverApi.v2
    .get('/stats', { $search: { roomType } }, options)
    .then(([error, result]) => (error ? null : result));
  const getProviders = createProvidersRequest(serverApi);
  const [providerResult, roomDiscovery] = await Promise.all([
    getProviders(options),
    loadRooms(args),
  ]);
  const [providersError, providers] = providerResult;
  return {
    data: {
      roomDiscovery,
      providers: providersError ? null : providers,
      stats,
    },
  };
}
