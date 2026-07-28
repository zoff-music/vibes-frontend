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

  return {
    listenerUsage:
      listenerError || !listenerUsage
        ? { points: [], generatedAt: '' }
        : listenerUsage,
    searchUsage:
      searchError || !searchUsage
        ? { summaries: [], generatedAt: '' }
        : searchUsage,
    stats:
      statsError || !stats
        ? { totalListeners: 0, totalRooms: 0, totalSongs: 0 }
        : stats,
  };
}
