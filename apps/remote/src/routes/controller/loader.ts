import type { LoaderFunctionArgs } from 'react-router';
import { getServerApi } from '../../http.server';
import { createControllerRoomData } from './loadController';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const remoteId = params.id ?? '';
  const cookie = request.headers.get('cookie') ?? '';
  const client = getServerApi();
  if (!remoteId) {
    return { error: 'Remote ID is required.', providers: [], songs: [] };
  }
  const headers = {
    Cookie: cookie,
    'X-Zoff-Remote-ID': remoteId,
  };
  const [remoteError, remote] = await client.get(
    '/remotes/{id}',
    { id: remoteId },
    { headers },
  );
  if (remoteError || !remote) {
    return {
      error: 'This remote is not paired, disabled, or its machine is offline.',
      providers: [],
      songs: [],
    };
  }
  if (!remote.currentRoomId) {
    return { providers: [], remote, songs: [] };
  }
  const roomId = remote.currentRoomId;
  const results = await Promise.all([
    client.get('/rooms/{id}', { id: roomId }, { headers }),
    client.get('/rooms/{id}/songs', { id: roomId }, { headers }),
    client.get('/rooms/{id}/states', { id: roomId }, { headers }),
    client.get('/providers', null, { headers }),
  ]);
  return createControllerRoomData({
    playback: results[2][1],
    providers: results[3][1],
    remote,
    room: results[0][1],
    roomError: results[0][0],
    songs: results[1][1],
  });
}
