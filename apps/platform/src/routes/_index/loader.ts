import type { LoaderFunctionArgs } from 'react-router';
import { getServerApi } from '../../http.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const serverApi = getServerApi(request);
  const [statsResult, providersResult] = await Promise.all([
    serverApi.get('/stats', null),
    serverApi.get('/providers', null),
  ]);
  const [statsError, stats] = statsResult;
  const [providersError, providers] = providersResult;

  return {
    providers: providersError ? [] : (providers ?? []),
    totalListeners: statsError ? 0 : (stats?.totalListeners ?? 0),
    totalRooms: statsError ? 0 : (stats?.totalRooms ?? 0),
    totalSongs: statsError ? 0 : (stats?.totalSongs ?? 0),
  };
}
