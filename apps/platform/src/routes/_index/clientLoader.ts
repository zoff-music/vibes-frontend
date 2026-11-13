import type { ClientLoaderFunctionArgs } from '@kasperrt/smolter/preact';
import { getProviders } from '@vibes/api';
import { getRetainedHomeData, loadDeviceSettings } from '../../utils/homePanel';
import { clientLoader as loadRooms } from '../resources.rooms/clientLoader';
import type { HomeLoaderData } from './loader';

export async function clientLoader(
  args: ClientLoaderFunctionArgs,
): Promise<HomeLoaderData> {
  const { request, params, reason } = args;
  const roomType = params.experience === 'watch' ? 'WATCH' : 'MUSIC';
  const openingSettings = new URL(request.url).pathname.endsWith(
    '/settings/device',
  );
  if (openingSettings) await loadDeviceSettings();
  const retained = getRetainedHomeData(roomType, openingSettings);
  if (retained && (reason === 'navigation' || reason === 'prefetch'))
    return retained;
  const [providerResult, roomDiscovery] = await Promise.all([
    getProviders({ signal: request.signal }),
    loadRooms(args),
  ]);
  const [providersError, providers] = providerResult;
  return {
    data: {
      roomDiscovery,
      providers: providersError ? null : providers,
      stats: null,
    },
  };
}
