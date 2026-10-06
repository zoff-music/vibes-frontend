import { getHttpError } from '@vibes/api';
import type {
  AdminListenerUsage,
  AdminMessageUsage,
  AdminSearchUsage,
  StatsV2,
} from '@vibes/models';
import type { LoaderFunctionArgs } from 'react-router';
import { getServerApi } from '../../../http.server';

export interface AdminOverviewLoaderData {
  listenerUsage: AdminListenerUsage;
  messageUsage: AdminMessageUsage;
  searchUsage: AdminSearchUsage;
  musicStats: StatsV2;
  watchStats: StatsV2;
}

export async function loader({
  request,
}: LoaderFunctionArgs): Promise<AdminOverviewLoaderData> {
  const serverApi = getServerApi(request);
  const cookieHeader = request.headers.get('cookie');
  const headers = cookieHeader ? { Cookie: cookieHeader } : undefined;
  const [
    searchResult,
    listenerResult,
    musicResult,
    watchResult,
    messageResult,
  ] = await Promise.all([
    serverApi.get('/admin/searches/usage', null, { headers }),
    serverApi.get('/admin/listeners/usage', null, { headers }),
    serverApi.v2.get('/stats', { $search: { roomType: 'MUSIC' } }),
    serverApi.v2.get('/stats', { $search: { roomType: 'WATCH' } }),
    serverApi.get('/admin/messages/usage', { $search: {} }, { headers }),
  ]);
  const [messageError, messageUsage] = messageResult;
  const [searchError, searchUsage] = searchResult;
  const [listenerError, listenerUsage] = listenerResult;
  const [musicError, musicStats] = musicResult;
  const [watchError, watchStats] = watchResult;
  if (
    messageError ||
    !messageUsage ||
    searchError ||
    listenerError ||
    musicError ||
    watchError ||
    !searchUsage ||
    !listenerUsage ||
    !musicStats ||
    !watchStats
  ) {
    if (
      isAuthorizationError(messageError) ||
      isAuthorizationError(searchError) ||
      isAuthorizationError(listenerError)
    ) {
      return {
        messageUsage: { roomId: '', total: 0, points: [], generatedAt: '' },
        listenerUsage: { points: [], generatedAt: '' },
        searchUsage: { points: [], generatedAt: '' },
        musicStats: musicStats ?? {
          totalListeners: 0,
          totalRooms: 0,
          totalPlaylistItems: 0,
        },
        watchStats: watchStats ?? {
          totalListeners: 0,
          totalRooms: 0,
          totalPlaylistItems: 0,
        },
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
    musicStats,
    watchStats,
  };
}

function isAuthorizationError(error: Error | null) {
  const status = error ? getHttpError(error)?.response.status : null;
  return status === 401 || status === 403;
}
