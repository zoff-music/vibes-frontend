import type { AdminRoomSummary, AdminSearchUsageSummary } from '@vibes/models';
import type { LoaderFunctionArgs } from 'react-router';
import { getServerApi } from '../../http.server';

export interface AdminLoaderData {
  adminRooms: AdminRoomSummary[];
  adminAuthorized: boolean;
  searchUsage: AdminSearchUsageSummary[];
}

export async function loader({
  request,
}: LoaderFunctionArgs): Promise<AdminLoaderData> {
  const serverApi = getServerApi(request);
  const cookieHeader = request.headers.get('cookie') ?? undefined;
  const requestHeaders = cookieHeader ? { Cookie: cookieHeader } : undefined;

  const [roomsResult, usageResult] = await Promise.all([
    serverApi.get('/admin/rooms', null, {
      headers: requestHeaders,
    }),
    serverApi.get('/admin/search-usage', null, {
      headers: requestHeaders,
    }),
  ]);
  const [roomsErr, rooms] = roomsResult;
  const [usageErr, searchUsage] = usageResult;

  return {
    adminRooms: roomsErr ? [] : rooms || [],
    adminAuthorized: !roomsErr,
    searchUsage: usageErr ? [] : (searchUsage ?? []),
  };
}
