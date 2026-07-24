import { getRateLimitMessage } from '@vibes/api';
import type { LoaderFunctionArgs } from 'react-router';
import { getServerApi } from '../../http.server';

export interface RoomsCreateLoaderData {
  checkedName?: string;
  createRoomName?: string;
  error?: string;
  rateLimitMessage?: string;
  roomNameExists?: boolean;
  roomNameSuggestion?: string;
}

export async function loader({
  request,
}: LoaderFunctionArgs): Promise<RoomsCreateLoaderData> {
  const url = new URL(request.url);
  const name = url.searchParams.get('name') ?? undefined;
  const intent = url.searchParams.get('intent');
  if (intent === 'suggest-room-name') {
    return loadRoomNameSuggestion(request);
  }
  if (intent === 'check-room-name') {
    return loadRoomNameExistence(request, name?.trim() ?? '');
  }

  return { createRoomName: name };
}

async function loadRoomNameSuggestion(
  request: Request,
): Promise<RoomsCreateLoaderData> {
  const serverApi = getServerApi(request);
  const requestHeaders = getRequestHeaders(request);
  const [err, suggestion] = await serverApi.get('/rooms/suggestions', null, {
    headers: requestHeaders,
  });
  if (err || !suggestion) {
    return getLoaderError(err, 'Failed to generate a room name');
  }

  return {
    roomNameSuggestion: suggestion.name,
  };
}

async function loadRoomNameExistence(
  request: Request,
  name: string,
): Promise<RoomsCreateLoaderData> {
  if (!name) {
    return {
      checkedName: name,
      error: 'Room name is required',
    };
  }

  const roomID = slugifyRoomName(name);
  if (!roomID) {
    return {
      checkedName: name,
      error: 'Room name is invalid',
    };
  }

  const serverApi = getServerApi(request);
  const requestHeaders = getRequestHeaders(request);
  const [err, exists] = await serverApi.roomExists(roomID, {
    headers: requestHeaders,
  });
  if (err || exists === null) {
    return {
      checkedName: name,
      ...getLoaderError(err, 'Could not check this name'),
    };
  }

  return {
    checkedName: name,
    roomNameExists: exists,
  };
}

function getRequestHeaders(request: Request): Record<string, string> {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) {
    return {};
  }

  return { Cookie: cookieHeader };
}

function getLoaderError(
  err: Error | null,
  fallbackMessage: string,
): RoomsCreateLoaderData {
  const rateLimitMessage = err ? getRateLimitMessage(err) : null;
  return {
    error: rateLimitMessage ?? err?.message ?? fallbackMessage,
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
