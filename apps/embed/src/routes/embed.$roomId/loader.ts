import { safeWrap } from '@vibes/shared';
import type { LoaderFunctionArgs } from 'react-router';
import { getServerApi } from '../../http.server';

export interface EmbedOptions {
  autoplay: boolean;
  player: boolean;
  playlist: boolean;
  skip: boolean;
  vote: boolean;
}

export async function embedRoomLoader({ request }: LoaderFunctionArgs) {
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
  const [roomResult, songsResult, playbackResult] = await Promise.all([
    serverApi.get('/rooms/{id}', { id: roomId }, { headers: requestHeaders }),
    serverApi.get(
      '/rooms/{id}/songs',
      { id: roomId },
      { headers: requestHeaders },
    ),
    serverApi.get(
      '/rooms/{id}/states',
      { id: roomId },
      { headers: requestHeaders },
    ),
  ]);

  const [roomError, room] = roomResult;
  const [songsError, songs] = songsResult;
  const [playbackError, playback] = playbackResult;
  if (roomError || songsError || playbackError || !room) {
    throw new Response('Room not found', { status: 404 });
  }

  return {
    room,
    roomId,
    songs: songs ?? [],
    playback: playback ?? undefined,
    options: {
      autoplay: requestUrl.searchParams.get('autoplay') === 'true',
      player: requestUrl.searchParams.get('player') !== 'false',
      playlist: requestUrl.searchParams.get('playlist') !== 'false',
      skip: requestUrl.searchParams.get('skip') !== 'false',
      vote: requestUrl.searchParams.get('vote') !== 'false',
    },
  };
}

export type EmbedLoaderData = Awaited<ReturnType<typeof embedRoomLoader>>;
