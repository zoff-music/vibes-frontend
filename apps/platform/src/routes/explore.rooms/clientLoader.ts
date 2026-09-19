import { apiV2 } from '@vibes/api';
import { type ClientLoaderFunctionArgs, data, redirect } from 'react-router';
import {
  publicRoomPageSize,
  type RoomBrowserLoaderData,
  readRoomBrowserSearch,
  roomBrowserRedirect,
} from './search';

export async function clientLoader({ request }: ClientLoaderFunctionArgs) {
  const search = readRoomBrowserSearch(request);
  const [error, result] = await apiV2.get(
    '/rooms/public',
    {
      $search: {
        q: search.q,
        live: search.live,
        from: search.from,
        to: search.from + publicRoomPageSize - 1,
      },
    },
    { retry: 0, signal: request.signal },
  );

  if (error || !result) {
    return data({ result: null, search } satisfies RoomBrowserLoaderData, {
      status: 503,
    });
  }

  const destination = roomBrowserRedirect(result, search);
  if (destination) return redirect(destination);

  return { result, search } satisfies RoomBrowserLoaderData;
}
