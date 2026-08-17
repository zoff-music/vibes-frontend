import { createRoomDiscoveryRequests } from '@vibes/api';
import type { Providers, PublicRoom } from '@vibes/models';
import type { DataResult, LoaderFunctionArgs } from '@vibes/native-router';
import { tvApi } from '@/lib/api';

export interface DiscoveryData {
  providers: Providers;
  publicRooms: PublicRoom[];
  warning: string;
}

const requests = createRoomDiscoveryRequests(tvApi);

export async function loader({
  signal,
}: LoaderFunctionArgs): Promise<DataResult<DiscoveryData>> {
  const [providersResult, roomsResult] = await Promise.all([
    requests.fetchProviders({ signal }),
    requests.fetchPublicRooms({ signal }),
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
