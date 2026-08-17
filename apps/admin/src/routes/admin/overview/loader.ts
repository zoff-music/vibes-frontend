import { getHttpError } from '@vibes/api';
import type {
  AdminListenerUsage,
  AdminSearchUsage,
  Stats,
} from '@vibes/models';
import type { LoaderFunctionArgs } from 'react-router';
import { getServerApi } from '../../../http.server';

export interface AdminOverviewLoaderData {
  listenerUsage: AdminListenerUsage;
  searchUsage: AdminSearchUsage;
  stats: Stats;
}

export async function loader({
  request,
}: LoaderFunctionArgs): Promise<AdminOverviewLoaderData> {
  const serverApi = getServerApi(request);
  const cookieHeader = request.headers.get('cookie');
  const headers = cookieHeader ? { Cookie: cookieHeader } : undefined;
  const [searchResult, listenerResult, statsResult] = await Promise.all([
    serverApi.get('/admin/searches/usage', null, { headers }),
    serverApi.get('/admin/listeners/usage', null, { headers }),
    serverApi.get('/stats', null),
  ]);
  const [searchError, searchUsage] = searchResult;
  const [listenerError, listenerUsage] = listenerResult;
  const [statsError, stats] = statsResult;
  if (
    searchError ||
    listenerError ||
    statsError ||
    !searchUsage ||
    !listenerUsage ||
    !stats
  ) {
    if (
      isAuthorizationError(searchError) ||
      isAuthorizationError(listenerError)
    ) {
      return {
        listenerUsage: { points: [], generatedAt: '' },
        searchUsage: { points: [], generatedAt: '' },
        stats: stats ?? { totalListeners: 0, totalRooms: 0, totalSongs: 0 },
      };
    }
    throw new Response('Admin overview temporarily unavailable', {
      status: 503,
      statusText: 'Admin overview temporarily unavailable',
    });
  }

  return {
    listenerUsage,
    searchUsage,
    stats,
  };
}

function isAuthorizationError(error: Error | null) {
  const status = error ? getHttpError(error)?.response.status : null;
  return status === 401 || status === 403;
}
