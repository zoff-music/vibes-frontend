import { createApiClient } from '@vibes/api';
import type { ClientLoaderFunctionArgs } from 'react-router';
import { createControllerRoomData } from './loadController';

export async function clientLoader({ params }: ClientLoaderFunctionArgs) {
  const remoteId = params.id ?? '';
  const client = createApiClient({ 'X-Zoff-Remote-ID': remoteId });
  if (!remoteId) {
    return { error: 'Remote ID is required.', providers: [], songs: [] };
  }
  const [remoteError, remote] = await client.get('/remotes/{id}', {
    id: remoteId,
  });
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
    client.get('/rooms/{id}', { id: roomId }),
    client.get('/rooms/{id}/songs', { id: roomId }),
    client.get('/rooms/{id}/states', { id: roomId }),
    client.get('/providers', null),
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
