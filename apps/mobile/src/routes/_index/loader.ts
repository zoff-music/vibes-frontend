import { createRoomDiscoveryRequests } from '@vibes/api';
import type { Providers, PublicRoom } from '@vibes/models';
import type { DataResult, LoaderFunctionArgs } from '@vibes/native-router';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';
import { filterMobileProviders } from '@/lib/mobile-content';

export interface DiscoveryData {
  providers: Providers;
  publicRooms: PublicRoom[];
  warning: string;
}

const requests = createRoomDiscoveryRequests(mobileApi);

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
      providers: filterMobileProviders(providersResult[1] ?? []),
      publicRooms: roomsResult[1] ?? [],
      warning: error
        ? await getRequestErrorMessage(
            error,
            'Some room discovery data is temporarily unavailable.',
          )
        : '',
    },
    error: '',
  };
}
