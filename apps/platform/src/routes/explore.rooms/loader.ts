import { data, type LoaderFunctionArgs, redirect } from 'react-router';
import { getServerApiV2 } from '../../http.server';
import {
  publicRoomPageSize,
  type RoomBrowserLoaderData,
  readRoomBrowserSearch,
  roomBrowserRedirect,
} from './search';

export async function loader({ request }: LoaderFunctionArgs) {
  const search = readRoomBrowserSearch(request);
  const serverApi = getServerApiV2(request);
  const [error, result] = await serverApi.get(
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
