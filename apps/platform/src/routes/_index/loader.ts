import type { LoaderFunctionArgs } from 'react-router';
import { getServerApi } from '../../http.server';

export type HomeLoaderData = Awaited<ReturnType<typeof loader>>;

export async function loader({ request }: LoaderFunctionArgs) {
  const serverApi = getServerApi(request);
  // Render the public page immediately when optional community data fails.
  const options = { retry: 0, signal: request.signal };
  const [statsResult, providersResult, publicRoomsResult] = await Promise.all([
    serverApi.get('/stats', null, options),
    serverApi.get('/providers', null, options),
    serverApi.get('/rooms/public', null, options),
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
    statsAvailable: !statsError && Boolean(stats),
  };
}
