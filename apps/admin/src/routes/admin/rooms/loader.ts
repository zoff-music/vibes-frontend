import { getHttpError } from '@vibes/api';
import type { AdminRoomResult } from '@vibes/models';
import type { LoaderFunctionArgs } from 'react-router';
import { getServerApi } from '../../../http.server';

export interface AdminRoomSearch {
  q: string;
  sortBy: 'listeners' | 'songs';
  order: 'asc' | 'desc';
  from: number;
  to: number;
  pageSize: number;
}

export interface AdminRoomsLoaderData {
  roomResult: AdminRoomResult;
  roomSearch: AdminRoomSearch;
}

export async function loader({
  request,
}: LoaderFunctionArgs): Promise<AdminRoomsLoaderData> {
  const serverApi = getServerApi(request);
  const cookieHeader = request.headers.get('cookie');
  const headers = cookieHeader ? { Cookie: cookieHeader } : undefined;
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
  const [error, roomResult] = await serverApi.get(
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
    { headers },
  );
  if (error || !roomResult) {
    const status = error ? getHttpError(error)?.response.status : null;
    if (status === 401 || status === 403) {
      return {
        roomResult: { rooms: [], from, to: from, total: 0, count: 0 },
        roomSearch: {
          q,
          sortBy,
          order,
          from,
          to,
          pageSize: to - from + 1,
        },
      };
    }
    throw new Response('Admin rooms temporarily unavailable', {
      status: 503,
      statusText: 'Admin rooms temporarily unavailable',
    });
  }

  return {
    roomResult,
    roomSearch: {
      q,
      sortBy,
      order,
      from,
      to,
      pageSize: to - from + 1,
    },
  };
}

const adminRoomPageSize = 10;
