import { getHttpError, getRequestErrorMessage } from '@vibes/api';
import type { Providers } from '@vibes/models';
import { DEFAULT_ROOM_SETTINGS, safeWrapAsync } from '@vibes/shared';
import { type ActionFunctionArgs, redirect } from 'react-router';
import { tizenApi } from '@/tizen/api';

export interface TizenSessionActionData {
  error: string;
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<Response | TizenSessionActionData> {
  const [bodyError, body] = await safeWrapAsync(request.text());
  if (bodyError || body === null) {
    return { error: 'The request could not be processed.' };
  }

  const formData = new URLSearchParams(body);
  const intent = formData.get('intent') ?? '';
  const value = formData.get('value')?.trim() ?? '';
  if (!value) return { error: 'Enter a room name or playlist description.' };
  if (intent === 'generate') return generateRoom(value);
  if (intent === 'joinOrCreate') return joinOrCreateRoom(value);
  return { error: 'That TV action is not supported.' };
}

async function generateRoom(
  prompt: string,
): Promise<Response | TizenSessionActionData> {
  const [requestError, room] = await tizenApi.post('/rooms/generation', null, {
    prompt,
  });
  if (requestError || !room) {
    return {
      error: await getRequestErrorMessage(
        requestError,
        'Could not start playlist generation.',
      ),
    };
  }
  return redirect(createRoomLocation(room.id));
}

async function joinOrCreateRoom(
  name: string,
): Promise<Response | TizenSessionActionData> {
  const roomId = name.toLowerCase().replace(/\s+/g, '-');
  const [roomError, room] = await tizenApi.get('/rooms/{id}', { id: roomId });
  if (room) return redirect(createRoomLocation(room.id));
  if (getHttpError(roomError)?.response.status !== notFoundStatus) {
    return {
      error: await getRequestErrorMessage(
        roomError,
        'Could not find that room.',
      ),
    };
  }

  const [providersError, providers] = await tizenApi.get('/providers', null);
  if (providersError || !providers?.length) {
    return {
      error: await getRequestErrorMessage(
        providersError,
        'Music providers are not available right now.',
      ),
    };
  }
  return createRoom(roomId, providers);
}

async function createRoom(
  name: string,
  providers: Providers,
): Promise<Response | TizenSessionActionData> {
  const [reservationError, reservation] = await tizenApi.post(
    '/rooms/reservations',
    null,
    { name },
  );
  if (reservationError || !reservation) {
    return {
      error: await getRequestErrorMessage(
        reservationError,
        'Could not reserve that room name.',
      ),
    };
  }

  const [createError, room] = await tizenApi.post('/rooms', null, {
    name,
    mode: 'server',
    reservationToken: reservation.token,
    settings: { ...DEFAULT_ROOM_SETTINGS, enabledSources: providers },
  });
  if (createError || !room) {
    return {
      error: await getRequestErrorMessage(
        createError,
        'Could not create that room.',
      ),
    };
  }
  return redirect(createRoomLocation(room.id));
}

function createRoomLocation(roomId: string): string {
  return `/?room=${encodeURIComponent(roomId)}`;
}

const notFoundStatus = 404;
