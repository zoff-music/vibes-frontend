import { createRoomDiscoveryRequests } from '@vibes/api';
import type { Providers, PublicRoom, PublicRoomResult } from '@vibes/models';
import type { DataResult, LoaderFunctionArgs } from '@vibes/native-router';
import { PUBLIC_ROOM_PAGE_SIZE } from '@vibes/shared';
import { getRequestErrorMessage, mobileApi, mobileApiV2 } from '@/lib/api';
import { filterMobileProviders } from '@/lib/mobile-content';

export interface DiscoveryData {
  providers: Providers;
  publicRooms: PublicRoom[];
  publicRoomPage: PublicRoomResult | null;
  warning: string;
}

const requests = createRoomDiscoveryRequests(mobileApi);

export async function loader({
  signal,
}: LoaderFunctionArgs): Promise<DataResult<DiscoveryData>> {
  const [providersResult, roomsResult] = await Promise.all([
    requests.fetchProviders({ signal }),
    mobileApiV2.get(
      '/rooms/public',
      { $search: { live: true, from: 0, to: PUBLIC_ROOM_PAGE_SIZE - 1 } },
      { signal },
    ),
  ]);
  const error = providersResult[0] ?? roomsResult[0];
  return {
    data: {
      providers: filterMobileProviders(providersResult[1] ?? []),
      publicRoomPage: roomsResult[1],
      publicRooms: roomsResult[1]?.rooms ?? [],
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
