import type {
  AdminListenerUsage,
  AdminRoomResult,
  AdminSearchUsage,
} from '@vibes/models';
import type { LoaderFunctionArgs } from 'react-router';
import { getServerApi } from '../../http.server';

export interface AdminRoomSearch {
  q: string;
  sortBy: 'listeners' | 'songs';
  order: 'asc' | 'desc';
  from: number;
  to: number;
  pageSize: number;
}

export interface AdminLoaderData {
  adminRooms: AdminRoomResult;
  adminAuthorized: boolean;
  listenerUsage: AdminListenerUsage;
  roomSearch: AdminRoomSearch;
  searchUsage: AdminSearchUsage;
}

export async function loader({
  request,
}: LoaderFunctionArgs): Promise<AdminLoaderData> {
  const serverApi = getServerApi(request);
  const cookieHeader = request.headers.get('cookie') ?? undefined;
  const requestHeaders = cookieHeader ? { Cookie: cookieHeader } : undefined;
  const url = new URL(request.url);
  const q = url.searchParams.get('q')?.trim() ?? '';
  const sortBy =
    url.searchParams.get('sortBy') === 'songs' ? 'songs' : 'listeners';
  const order = url.searchParams.get('order') === 'asc' ? 'asc' : 'desc';
  const parsedFrom = Number.parseInt(url.searchParams.get('from') ?? '', 10);
  const from = Number.isNaN(parsedFrom) ? 0 : Math.max(0, parsedFrom);
  const parsedTo = Number.parseInt(url.searchParams.get('to') ?? '', 10);
  const requestedTo = Number.isNaN(parsedTo)
    ? from + adminRoomPageSize - 1
    : Math.max(from, parsedTo);
  const to = Math.min(requestedTo, from + adminRoomPageSize - 1);

  const [roomsResult, usageResult, listenerUsageResult] = await Promise.all([
    serverApi.get(
      '/admin/rooms',
      {
        $search: {
          ...(q && { q }),
          sortBy,
          order,
          from,
          to,
        },
      },
      {
        headers: requestHeaders,
      },
    ),
    serverApi.get('/admin/searches/usage', null, {
      headers: requestHeaders,
    }),
    serverApi.get('/admin/listeners/usage', null, {
      headers: requestHeaders,
    }),
  ]);
  const [roomsErr, rooms] = roomsResult;
  const [usageErr, searchUsage] = usageResult;
  const [listenerUsageErr, listenerUsage] = listenerUsageResult;

  return {
    adminRooms: roomsErr
      ? { rooms: [], from, to: from, total: 0, count: 0 }
      : (rooms ?? { rooms: [], from, to: from, total: 0, count: 0 }),
    adminAuthorized: !roomsErr,
    listenerUsage: listenerUsageErr
      ? { points: [], generatedAt: '' }
      : (listenerUsage ?? { points: [], generatedAt: '' }),
    roomSearch: {
      q,
      sortBy,
      order,
      from,
      to,
      pageSize: to - from + 1,
    },
    searchUsage: usageErr
      ? { summaries: [], generatedAt: '' }
      : (searchUsage ?? { summaries: [], generatedAt: '' }),
  };
}

const adminRoomPageSize = 10;
