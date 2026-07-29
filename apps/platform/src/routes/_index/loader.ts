import type { LoaderFunctionArgs } from 'react-router';
import { getServerApi } from '../../http.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const serverApi = getServerApi(request);
  const [statsResult, providersResult, publicRoomsResult] = await Promise.all([
    serverApi.get('/stats', null),
    serverApi.get('/providers', null),
    serverApi.get('/rooms/public', null),
  ]);
  const [statsError, stats] = statsResult;
  const [providersError, providers] = providersResult;
  const [publicRoomsError, publicRooms] = publicRoomsResult;

  return {
    providers: providersError ? [] : (providers ?? []),
    publicRooms: publicRoomsError ? [] : (publicRooms ?? []),
    totalListeners: statsError ? 0 : (stats?.totalListeners ?? 0),
    totalRooms: statsError ? 0 : (stats?.totalRooms ?? 0),
    totalSongs: statsError ? 0 : (stats?.totalSongs ?? 0),
  };
}
