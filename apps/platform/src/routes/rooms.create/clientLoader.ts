import { api, getRateLimitMessage, getRequestErrorMessage } from '@vibes/api';
import type { ClientLoaderFunctionArgs } from 'react-router';
import type { RoomsCreateLoaderData } from './loader';

export async function clientLoader({
  request,
  serverLoader,
}: ClientLoaderFunctionArgs): Promise<RoomsCreateLoaderData> {
  const url = new URL(request.url);
  const name = url.searchParams.get('name') ?? undefined;
  const intent = url.searchParams.get('intent');

  if (intent === 'suggest-room-name') {
    const [err, suggestion] = await api.get('/rooms/suggestions', null);
    if (err || !suggestion) {
      return getLoaderError(err, 'Failed to generate a room name');
    }
    return { roomNameSuggestion: suggestion.name };
  }

  if (intent === 'check-room-name') {
    const trimmedName = name?.trim() ?? '';
    if (!trimmedName) {
      return { checkedName: trimmedName, error: 'Room name is required' };
    }
    const roomID = slugifyRoomName(trimmedName);
    if (!roomID) {
      return { checkedName: trimmedName, error: 'Room name is invalid' };
    }
    const [err, exists] = await api.roomExists(roomID);
    if (err || exists === null) {
      return {
        checkedName: trimmedName,
        ...(await getLoaderError(err, 'Could not check this name')),
      };
    }
    return { checkedName: trimmedName, roomNameExists: exists };
  }

  const loaderData = await serverLoader<RoomsCreateLoaderData>();
  return loaderData;
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
