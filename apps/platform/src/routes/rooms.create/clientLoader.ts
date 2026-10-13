import {
  api,
  getProviders,
  getRateLimitMessage,
  getRequestErrorMessage,
} from '@vibes/api';
import { roomNameInputSchema } from '@vibes/models';
import type { ClientLoaderFunctionArgs } from 'react-router';
import type { RoomsCreateLoaderData } from './loader';

export async function clientLoader({
  request,
}: ClientLoaderFunctionArgs): Promise<RoomsCreateLoaderData> {
  const url = new URL(request.url);
  const name = url.searchParams.get('name') ?? undefined;
  const intent = url.searchParams.get('intent');
  const options = { signal: request.signal };

  if (intent === 'suggest-room-name') {
    const [err, suggestion] = await api.get(
      '/rooms/suggestions',
      null,
      options,
    );
    if (err || !suggestion) {
      return getLoaderError(err, 'Failed to generate a room name');
    }
    return { roomNameSuggestion: suggestion.name };
  }

  if (intent === 'check-room-name') {
    const trimmedName = name?.trim() ?? '';
    const parsed = roomNameInputSchema.safeParse(trimmedName);
    if (!parsed.success) {
      return {
        checkedName: trimmedName,
        error: parsed.error.issues[0]?.message ?? 'Enter a valid room name.',
      };
    }
    const roomID = slugifyRoomName(trimmedName);
    if (!roomID) {
      return { checkedName: trimmedName, error: 'Room name is invalid' };
    }
    const [err, exists] = await api.roomExists(roomID, options);
    if (err || exists === null) {
      return {
        checkedName: trimmedName,
        ...(await getLoaderError(err, 'Could not check this name')),
      };
    }
    return { checkedName: trimmedName, roomNameExists: exists };
  }

  const [err, providers] = await getProviders(options);
  if (err || !providers) {
    return {
      createRoomName: name,
      providers: [],
      ...(await getLoaderError(err, 'Failed to load providers')),
    };
  }

  return {
    createRoomName: name,
    providers: providers.filter(
      (provider) =>
        url.searchParams.get('type') !== 'watch' || provider === 'youtube',
    ),
  };
}

async function getLoaderError(
  err: Error | null,
  fallbackMessage: string,
): Promise<RoomsCreateLoaderData> {
  const rateLimitMessage = err ? getRateLimitMessage(err) : null;
  return {
    error: await getRequestErrorMessage(err, fallbackMessage),
    ...(rateLimitMessage && { rateLimitMessage }),
  };
}

function slugifyRoomName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/[ -]+/g, '-')
    .replace(/^-|-$/g, '');
}
