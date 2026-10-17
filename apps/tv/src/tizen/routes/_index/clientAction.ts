import {
  type ClientActionFunctionArgs,
  redirect,
} from '@kasperrt/smolter/preact';
import { getHttpError, getRequestErrorMessage } from '@vibes/api';
import type { Providers, RoomType } from '@vibes/models';
import { DEFAULT_ROOM_SETTINGS, safeWrapAsync } from '@vibes/shared';
import { tizenApi } from '@/tizen/api';

export interface TizenSessionActionData {
  error: string;
}

export async function clientAction({
  request,
}: ClientActionFunctionArgs): Promise<Response | TizenSessionActionData> {
  const [bodyError, formData] = await safeWrapAsync(request.formData());

  if (bodyError || !formData) {
    return { error: 'The request could not be processed.' };
  }

  const intent = String(formData.get('intent') ?? '');
  const value = String(formData.get('value') ?? '').trim();
  const roomType = formData.get('roomType') === 'WATCH' ? 'WATCH' : 'MUSIC';

  if (!value) return { error: 'Enter a room name or playlist description.' };

  if (intent === 'generate')
    return generateRoom(value, roomType, request.signal);

  if (intent === 'joinOrCreate')
    return joinOrCreateRoom(value, roomType, request.signal);

  return { error: 'That TV action is not supported.' };
}

async function generateRoom(
  prompt: string,
  roomType: RoomType,
  signal: AbortSignal,
): Promise<Response | TizenSessionActionData> {
  const [requestError, room] = await tizenApi.v2.post(
    '/rooms/generation',
    null,
    {
      prompt,
      roomType,
    },
    { signal },
  );

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
  roomType: RoomType,
  signal: AbortSignal,
): Promise<Response | TizenSessionActionData> {
  const roomId = name.toLowerCase().replace(/\s+/g, '-');
  const [roomError, room] = await tizenApi.v2.get(
    '/rooms/{id}',
    {
      id: roomId,
    },
    { signal },
  );

  if (room) return redirect(createRoomLocation(room.id));

  if (getHttpError(roomError)?.response.status !== notFoundStatus) {
    return {
      error: await getRequestErrorMessage(
        roomError,
        'Could not find that room.',
      ),
    };
  }

  const [providersError, providers] = await tizenApi.get('/providers', null, {
    signal,
  });

  if (providersError || !providers?.length) {
    return {
      error: await getRequestErrorMessage(
        providersError,
        'Music providers are not available right now.',
      ),
    };
  }

  return createRoom(roomId, providers, roomType, signal);
}

async function createRoom(
  name: string,
  providers: Providers,
  roomType: RoomType,
  signal: AbortSignal,
): Promise<Response | TizenSessionActionData> {
  const [reservationError, reservation] = await tizenApi.post(
    '/rooms/reservations',
    null,
    { name },
    { signal },
  );

  if (reservationError || !reservation) {
    return {
      error: await getRequestErrorMessage(
        reservationError,
        'Could not reserve that room name.',
      ),
    };
  }

  const [createError, room] = await tizenApi.v2.post(
    '/rooms',
    null,
    {
      name,
      mode: 'server',
      roomType,
      reservationToken: reservation.token,
      settings: {
        ...DEFAULT_ROOM_SETTINGS,
        enabledSources: providers.filter(
          (provider) => roomType !== 'WATCH' || provider === 'youtube',
        ),
      },
    },
    { signal },
  );

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
