import { getRateLimitMessage } from '@vibes/api';
import type { Room } from '@vibes/models';
import type { ActionFunctionArgs } from 'react-router';
import { getServerApi } from '../../http.server';

export interface RoomsCreateActionData {
  error?: string;
  rateLimitMessage?: string;
  room?: Room;
}

function readBoolean(formData: FormData, key: string) {
  return formData.get(key) === 'true';
}

function readEnabledSources(formData: FormData) {
  return formData
    .getAll('enabledSources')
    .map((source) => String(source))
    .filter(Boolean);
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<RoomsCreateActionData> {
  const formData = await request.formData();
  const name = String(formData.get('name') ?? '').trim();
  if (!name) {
    return {
      error: 'Room name is required',
    };
  }

  const password = String(formData.get('password') ?? '');
  const mode = formData.get('mode') === 'host' ? 'host' : 'server';
  const serverApi = getServerApi(request);
  const cookieHeader = request.headers.get('cookie') ?? undefined;
  const requestHeaders = cookieHeader ? { Cookie: cookieHeader } : undefined;

  const [err, room] = await serverApi.post(
    '/rooms',
    null,
    {
      name,
      password: password || undefined,
      mode,
      settings: {
        skipAllowed: readBoolean(formData, 'skipAllowed'),
        democraticSkip: readBoolean(formData, 'democraticSkip'),
        loopQueue: readBoolean(formData, 'loopQueue'),
        removeOnPlay: readBoolean(formData, 'removeOnPlay'),
        allowDuplicates: readBoolean(formData, 'allowDuplicates'),
        enabledSources: readEnabledSources(formData),
        onlyAdminAddSongs: readBoolean(formData, 'onlyAdminAddSongs'),
      },
    },
    { headers: requestHeaders },
  );
  if (err || !room) {
    const rateLimitMessage = err ? getRateLimitMessage(err) : null;
    return {
      error: rateLimitMessage ?? err?.message ?? 'Failed to create room',
      ...(rateLimitMessage && { rateLimitMessage }),
    };
  }

  return {
    room,
  };
}
