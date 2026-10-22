import type { LoaderFunctionArgs } from '@kasperrt/smolter/preact';
import { getServerApi } from '../../http.server';
import { createControllerRoomData } from './utils/createControllerRoomData';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const remoteId = params.id ?? '';
  const cookie = request.headers.get('cookie') ?? '';
  const client = getServerApi(request);

  if (!remoteId) {
    return {
      error: 'Remote ID is required.',
      providers: [],
      playlistItems: [],
    };
  }

  const headers = {
    Cookie: cookie,
    'X-Zoff-Remote-ID': remoteId,
  };
  const [remoteError, remote] = await client.v2.get(
    '/remotes/{id}',
    { id: remoteId },
    { signal: request.signal, headers },
  );

  if (remoteError || !remote) {
    return {
      error: 'This remote is not paired, disabled, or its machine is offline.',
      providers: [],
      playlistItems: [],
    };
  }

  if (!remote.currentRoomId) {
    return { providers: [], remote, playlistItems: [] };
  }

  const roomId = remote.currentRoomId;
  const results = await Promise.all([
    client.v2.get(
      '/rooms/{id}',
      { id: roomId },
      { signal: request.signal, headers },
    ),
    client.v3.get(
      '/rooms/{id}/items',
      { id: roomId, $search: {} },
      { signal: request.signal, headers },
    ),
    client.v2.get(
      '/rooms/{id}/states',
      { id: roomId },
      { signal: request.signal, headers },
    ),
    client.get('/providers', null, { signal: request.signal, headers }),
  ]);

  return createControllerRoomData({
    playback: results[2][1],
    providers: results[3][1],
    remote,
    room: results[0][1],
    roomError: results[0][0],
    playlistItems: results[1][1]?.data ?? null,
  });
}
