import type { LoaderFunctionArgs } from '@kasperrt/smolter/preact';
import { getHttpError } from '@vibes/api';
import { type ColorScheme, parseColorScheme, safeWrap } from '@vibes/shared';
import { getServerApi } from '../../http.server';

export interface EmbedOptions {
  autoplay: boolean;
  player: boolean;
  playlist: boolean;
  skip: boolean;
  vote: boolean;
  theme: ColorScheme;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const requestUrl = new URL(request.url);
  const embedBasePath = `/${(process.env.EMBED_BASE_PATH ?? '/embed').replace(/^\/+|\/+$/g, '')}`;
  const pathPrefix = `${embedBasePath}/`;

  if (!requestUrl.pathname.startsWith(pathPrefix)) {
    throw new Response('Not found', { status: 404 });
  }

  const encodedRoomId = requestUrl.pathname.slice(pathPrefix.length);

  if (!encodedRoomId || encodedRoomId.includes('/')) {
    throw new Response('Room not found', { status: 404 });
  }

  const [decodeError, roomId] = safeWrap(() =>
    decodeURIComponent(encodedRoomId),
  );

  if (decodeError || !roomId) {
    throw new Response('Room not found', { status: 404 });
  }

  const serverApi = getServerApi();
  const cookieHeader = request.headers.get('cookie') ?? undefined;
  const requestHeaders = cookieHeader ? { Cookie: cookieHeader } : undefined;
  const [roomResult, playlistItemsResult, playbackResult, providersResult] =
    await Promise.all([
      serverApi.v2.get(
        '/rooms/{id}',
        { id: roomId },
        { signal: request.signal, headers: requestHeaders },
      ),
      serverApi.v3.get(
        '/rooms/{id}/items',
        { id: roomId, $search: {} },
        { signal: request.signal, headers: requestHeaders },
      ),
      serverApi.v2.get(
        '/rooms/{id}/states',
        { id: roomId },
        { signal: request.signal, headers: requestHeaders },
      ),
      serverApi.get('/providers', null, {
        signal: request.signal,
        headers: requestHeaders,
      }),
    ]);

  const [roomError, room] = roomResult;
  const [playlistItemsError, playlistItems] = playlistItemsResult;
  const [playbackError, playback] = playbackResult;
  const [providersError, providers] = providersResult;

  if (
    roomError ||
    playlistItemsError ||
    playbackError ||
    providersError ||
    !room
  ) {
    const roomStatus = roomError
      ? getHttpError(roomError)?.response.status
      : null;

    if (roomStatus === 404) {
      throw new Response('Room not found', { status: 404 });
    }

    throw new Response('Embedded room temporarily unavailable', {
      status: 503,
      statusText: 'Embedded room temporarily unavailable',
    });
  }

  return {
    room,
    roomId,
    playlistItems: playlistItems?.data ?? [],
    playback: playback ?? undefined,
    providers: providers ?? [],
    options: {
      autoplay: requestUrl.searchParams.get('autoplay') === 'true',
      player: requestUrl.searchParams.get('player') !== 'false',
      playlist: requestUrl.searchParams.get('playlist') !== 'false',
      skip: requestUrl.searchParams.get('skip') !== 'false',
      vote: requestUrl.searchParams.get('vote') !== 'false',
      theme: parseColorScheme(requestUrl.searchParams.get('theme')),
    },
  };
}

export type EmbedLoaderData = Awaited<ReturnType<typeof loader>>;

export { loader as embedRoomLoader };
