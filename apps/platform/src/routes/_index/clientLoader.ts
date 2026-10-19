import type { ClientLoaderFunctionArgs } from '@kasperrt/smolter/preact';
import { api, createPublicRequestCache, getProviders } from '@vibes/api';
import type { PublicRoomV3 } from '@vibes/models';
import { getRetainedHomeData, loadDeviceSettings } from '../../utils/homePanel';
import type { HomeLoaderData } from './loader';

const readRooms = createPublicRequestCache<PublicRoomV3[]>(10_000);

export async function clientLoader({
  request,
  params,
  reason,
}: ClientLoaderFunctionArgs): Promise<HomeLoaderData> {
  const roomType = params.experience === 'watch' ? 'WATCH' : 'MUSIC';
  const openingSettings = new URL(request.url).pathname.endsWith(
    '/settings/device',
  );

  if (openingSettings) await loadDeviceSettings();

  const retained = getRetainedHomeData(roomType, openingSettings);

  if (retained && (reason === 'navigation' || reason === 'prefetch'))
    return retained;

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
  const publicRooms = rooms.then(([error, result]) => (error ? null : result));
  const [providersError, providers] = await getProviders(options);

  return {
    data: {
      providers: providersError ? null : providers,
      publicRooms,
      stats: null,
    },
  };
}
