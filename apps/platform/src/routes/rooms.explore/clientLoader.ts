import {
  type ClientLoaderFunctionArgs,
  data,
  redirect,
} from '@kasperrt/smolter/preact';
import {
  apiV3,
  createPublicRoomPageRequest,
  getRateLimitResponse,
} from '@vibes/api';
import {
  publicRoomPageSize,
  type RoomBrowserLoaderData,
  readRoomBrowserSearch,
  roomBrowserRedirect,
} from './utils/search';

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
    const rateLimitResponse = getRateLimitResponse([error]);
    return data({ result: null, search } satisfies RoomBrowserLoaderData, {
      status: rateLimitResponse?.status ?? 503,
      ...(rateLimitResponse && { headers: rateLimitResponse.headers }),
    });
  }

  const destination = roomBrowserRedirect(result, search);

  if (destination) return redirect(destination);

  return { result, search } satisfies RoomBrowserLoaderData;
}
