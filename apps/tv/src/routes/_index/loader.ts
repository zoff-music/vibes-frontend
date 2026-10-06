import { createRoomDiscoveryRequests } from '@vibes/api';
import type { Providers, PublicRoomV3 } from '@vibes/models';
import type { DataResult, LoaderFunctionArgs } from '@vibes/native-router';
import { tvApi } from '@/lib/api';

export interface DiscoveryData {
  providers: Providers;
  publicRooms: PublicRoomV3[];
  warning: string;
}

const requests = createRoomDiscoveryRequests(tvApi);

export async function loader({
  params,
  signal,
}: LoaderFunctionArgs): Promise<DataResult<DiscoveryData>> {
  const [providersResult, roomsResult] = await Promise.all([
    requests.fetchProviders({ signal }),
    requests.fetchPublicRooms(
      { signal },
      params.roomType === 'WATCH' ? 'WATCH' : 'MUSIC',
    ),
  ]);
  const error = providersResult[0] ?? roomsResult[0];
  return {
    data: {
      providers: providersResult[1] ?? [],
      publicRooms: roomsResult[1] ?? [],
      warning: error
        ? 'Some live-room data is unavailable. You can still join by name.'
        : '',
    },
    error: '',
  };
}
