import { createRoomDiscoveryRequests } from '@vibes/api';
import type { Providers, PublicRoomV3 } from '@vibes/models';
import type { RequestArgs, RequestResult } from '@vibes/shared/requests';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';
import { filterMobileProviders } from '@/lib/mobile-content';

export interface DiscoveryData {
  providers: Providers;
  publicRooms: PublicRoomV3[];
  warning: string;
}

const requests = createRoomDiscoveryRequests(mobileApi);

export async function loadDiscovery({
  params,
  signal,
}: RequestArgs): Promise<RequestResult<DiscoveryData>> {
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
