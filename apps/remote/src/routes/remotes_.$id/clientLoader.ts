import type { ClientLoaderFunctionArgs } from '@kasperrt/smolter/preact';
import { createApiClient } from '@vibes/api';
import { createControllerRoomData } from './utils/createControllerRoomData';
import { retainedController } from './utils/retainedController';

export async function clientLoader({
  params,
  request,
  reason,
}: ClientLoaderFunctionArgs) {
  const remoteId = params.id ?? '';
  if (new URL(request.url).pathname.endsWith('/settings/device')) {
    await import('../../components/DeviceSettings');
  }
  const retained = retainedController(remoteId);
  if (retained && (reason === 'navigation' || reason === 'prefetch'))
    return retained;
  const client = createApiClient({ 'X-Zoff-Remote-ID': remoteId });

  if (!remoteId) {
    return {
      error: 'Remote ID is required.',
      providers: [],
      playlistItems: [],
    };
  }

  const [remoteError, remote] = await client.v2.get(
    '/remotes/{id}',
    {
      id: remoteId,
    },
    { signal: request.signal },
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
    client.v2.get('/rooms/{id}', { id: roomId }, { signal: request.signal }),
    client.v3.get(
      '/rooms/{id}/items',
      { id: roomId, $search: {} },
      { signal: request.signal },
    ),
    client.v2.get(
      '/rooms/{id}/states',
      { id: roomId },
      { signal: request.signal },
    ),
    client.get('/providers', null, { signal: request.signal }),
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
