import { getRateLimitMessage, getRequestErrorMessage } from '@vibes/api';
import type { Providers } from '@vibes/models';
import type { LoaderFunctionArgs } from 'react-router';
import { getServerApi } from '../../http.server';

export interface RoomsCreateLoaderData {
  checkedName?: string;
  createRoomName?: string;
  error?: string;
  rateLimitMessage?: string;
  roomNameExists?: boolean;
  roomNameSuggestion?: string;
  providers?: Providers;
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

  const serverApi = getServerApi(request);
  const requestHeaders = getRequestHeaders(request);
  const [err, providers] = await serverApi.get('/providers', null, {
    headers: requestHeaders,
  });
  if (err || !providers) {
    return {
      createRoomName: name,
      providers: [],
      ...(await getLoaderError(err, 'Failed to load music providers')),
    };
  }

  return {
    createRoomName: name,
    providers,
  };
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
      ...(await getLoaderError(err, 'Could not check this name')),
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
