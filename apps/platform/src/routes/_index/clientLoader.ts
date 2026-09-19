import { api } from '@vibes/api';
import type { ClientLoaderFunctionArgs } from 'react-router';
import type { HomeLoaderData, loader } from './loader';

export async function clientLoader({
  request,
  serverLoader,
}: ClientLoaderFunctionArgs): Promise<HomeLoaderData> {
  const { data } = await serverLoader<typeof loader>();
  const options = { retry: 0, signal: request.signal };
  const [statsResult, providersResult, publicRoomsResult] = await Promise.all([
    data.stats === null
      ? api.get('/stats', null, options)
      : ([null, data.stats] as const),
    data.providers === null
      ? api.get('/providers', null, options)
      : ([null, data.providers] as const),
    data.publicRooms === null
      ? api.get('/rooms/public', null, options)
      : ([null, data.publicRooms] as const),
  ]);
  const [statsError, stats] = statsResult;
  const [providersError, providers] = providersResult;
  const [publicRoomsError, publicRooms] = publicRoomsResult;

  return {
    data: {
      providers: providersError ? null : providers,
      publicRooms: publicRoomsError ? null : publicRooms,
      stats: statsError ? null : stats,
    },
    pending: false,
  };
}

clientLoader.hydrate = true as const;
