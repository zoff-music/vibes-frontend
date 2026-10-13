import { apiV3, createPublicRoomPageRequest } from '@vibes/api';
import { type ClientLoaderFunctionArgs, data, redirect } from 'react-router';
import {
  publicRoomPageSize,
  type RoomBrowserLoaderData,
  readRoomBrowserSearch,
  roomBrowserRedirect,
} from './search';

const getPublicRooms = createPublicRoomPageRequest(apiV3);

export async function clientLoader({ request }: ClientLoaderFunctionArgs) {
  const search = readRoomBrowserSearch(request);
  const [error, result] = await getPublicRooms(
    {
      q: search.q,
      roomType: search.roomType,
      live: search.live,
      from: search.from,
      to: search.from + publicRoomPageSize - 1,
    },
    { signal: request.signal },
    new URL(request.url).searchParams.get('intent') === 'prefetch',
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
