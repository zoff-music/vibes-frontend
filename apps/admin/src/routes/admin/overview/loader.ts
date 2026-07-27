import type { AdminListenerUsage, AdminSearchUsage } from '@vibes/models';
import type { LoaderFunctionArgs } from 'react-router';
import { getServerApi } from '../../../http.server';

export interface AdminOverviewLoaderData {
  listenerUsage: AdminListenerUsage;
  searchUsage: AdminSearchUsage;
}

export async function loader({
  request,
}: LoaderFunctionArgs): Promise<AdminOverviewLoaderData> {
  const serverApi = getServerApi(request);
  const cookieHeader = request.headers.get('cookie');
  const headers = cookieHeader ? { Cookie: cookieHeader } : undefined;
  const [searchResult, listenerResult] = await Promise.all([
    serverApi.get('/admin/searches/usage', null, { headers }),
    serverApi.get('/admin/listeners/usage', null, { headers }),
  ]);
  const [searchError, searchUsage] = searchResult;
  const [listenerError, listenerUsage] = listenerResult;

  return {
    listenerUsage:
      listenerError || !listenerUsage
        ? { points: [], generatedAt: '' }
        : listenerUsage,
    searchUsage:
      searchError || !searchUsage
        ? { summaries: [], generatedAt: '' }
        : searchUsage,
  };
}
