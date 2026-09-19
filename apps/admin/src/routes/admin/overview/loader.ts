import { getHttpError } from '@vibes/api';
import type {
  AdminListenerUsage,
  AdminMessageUsage,
  AdminSearchUsage,
  Stats,
} from '@vibes/models';
import type { LoaderFunctionArgs } from 'react-router';
import { getServerApi } from '../../../http.server';

export interface AdminOverviewLoaderData {
  listenerUsage: AdminListenerUsage;
  messageUsage: AdminMessageUsage;
  searchUsage: AdminSearchUsage;
  stats: Stats;
}

export async function loader({
  request,
}: LoaderFunctionArgs): Promise<AdminOverviewLoaderData> {
  const serverApi = getServerApi(request);
  const cookieHeader = request.headers.get('cookie');
  const headers = cookieHeader ? { Cookie: cookieHeader } : undefined;
  const roomId = new URL(request.url).searchParams.get('roomId')?.trim() ?? '';
  const [searchResult, listenerResult, statsResult, messageResult] =
    await Promise.all([
      serverApi.get('/admin/searches/usage', null, { headers }),
      serverApi.get('/admin/listeners/usage', null, { headers }),
      serverApi.get('/stats', null),
      serverApi.get(
        '/admin/messages/usage',
        { $search: { roomId } },
        { headers },
      ),
    ]);
  const [messageError, messageUsage] = messageResult;
  const [searchError, searchUsage] = searchResult;
  const [listenerError, listenerUsage] = listenerResult;
  const [statsError, stats] = statsResult;
  if (
    messageError ||
    !messageUsage ||
    searchError ||
    listenerError ||
    statsError ||
    !searchUsage ||
    !listenerUsage ||
    !stats
  ) {
    if (
      isAuthorizationError(messageError) ||
      isAuthorizationError(searchError) ||
      isAuthorizationError(listenerError)
    ) {
      return {
        messageUsage: { roomId, total: 0, points: [], generatedAt: '' },
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
    messageUsage,
    listenerUsage,
    searchUsage,
    stats,
  };
}

function isAuthorizationError(error: Error | null) {
  const status = error ? getHttpError(error)?.response.status : null;
  return status === 401 || status === 403;
}
