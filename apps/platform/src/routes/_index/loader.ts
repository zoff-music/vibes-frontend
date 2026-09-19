import type { Providers, PublicRoom, Stats } from '@vibes/models';
import type { LoaderFunctionArgs } from 'react-router';
import { getServerApi } from '../../http.server';

export interface HomeLoaderData {
  data: {
    providers: Providers | null;
    publicRooms: PublicRoom[] | null;
    stats: Stats | null;
  };
  pending: boolean;
}

export async function loader({
  request,
}: LoaderFunctionArgs): Promise<HomeLoaderData> {
  const serverApi = getServerApi(request);
  // Fast responses enrich the HTML; slow optional data continues in the client.
  const signal = AbortSignal.any([request.signal, AbortSignal.timeout(250)]);
  const options = { retry: 0, signal };
  const [statsResult, providersResult, publicRoomsResult] = await Promise.all([
    serverApi.get('/stats', null, options),
    serverApi.get('/providers', null, options),
    serverApi.get('/rooms/public', null, options),
  ]);
  const [statsError, stats] = statsResult;
  const [providersError, providers] = providersResult;
  const [publicRoomsError, publicRooms] = publicRoomsResult;
  const data = {
    providers: providersError ? null : providers,
    publicRooms: publicRoomsError ? null : publicRooms,
    stats: statsError ? null : stats,
  };

  return {
    data,
    pending: Object.values(data).some((value) => value === null),
  };
}
