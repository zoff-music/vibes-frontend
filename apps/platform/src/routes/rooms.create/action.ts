import {
  api,
  getAPIErrorMessage,
  getHttpError,
  getRateLimitMessage,
} from '@vibes/api';
import { isSourceType, type RoomNameReservation } from '@vibes/models';
import { type ClientActionFunctionArgs, redirect } from 'react-router';

export interface RoomsCreateActionData {
  checkedName?: string;
  error?: string;
  rateLimitMessage?: string;
  reservation?: RoomNameReservation;
  roomNameUnavailable?: boolean;
}

const CONFLICT_STATUS = 409;

function readBoolean(formData: FormData, key: string) {
  const value = formData.get(key);
  return value === 'on' || value === 'true';
}

function readEnabledSources(formData: FormData) {
  return formData
    .getAll('enabledSources')
    .map((source) => String(source))
    .filter(isSourceType);
}

export async function clientAction({
  request,
}: ClientActionFunctionArgs): Promise<RoomsCreateActionData | Response> {
  const formData = await request.formData();
  const intent = String(formData.get('intent') ?? 'createRoom');
  if (intent === 'reserveRoomName') {
    return reserveRoomName(formData);
  }

  const name = String(formData.get('name') ?? '').trim();
  if (!name) {
    return {
      error: 'Room name is required',
    };
  }

  const password = String(formData.get('password') ?? '');
  const isPublic = readBoolean(formData, 'public');
  if (isPublic && !password) {
    return {
      error: 'Add an admin password before making this room public.',
    };
  }

  const reservationToken = String(
    formData.get('reservationToken') ?? '',
  ).trim();
  const mode = formData.get('mode') === 'host' ? 'host' : 'server';
  const [err, room] = await api.post('/rooms', null, {
    name,
    password: password || undefined,
    reservationToken: reservationToken || undefined,
    mode,
    settings: {
      skipAllowed: readBoolean(formData, 'skipAllowed'),
      democraticSkip: readBoolean(formData, 'democraticSkip'),
      removeOnPlay: readBoolean(formData, 'removeOnPlay'),
      allowDuplicates: readBoolean(formData, 'allowDuplicates'),
      enabledSources: readEnabledSources(formData),
      onlyAdminAddSongs: readBoolean(formData, 'onlyAdminAddSongs'),
      public: isPublic,
      playlistImport: readBoolean(formData, 'playlistImport'),
    },
  });
  if (err || !room) {
    const rateLimitMessage = err ? getRateLimitMessage(err) : null;
    const apiErrorMessage = err ? await getAPIErrorMessage(err) : null;
    return {
      error: rateLimitMessage ?? apiErrorMessage ?? 'Failed to create room',
      ...(rateLimitMessage && { rateLimitMessage }),
    };
  }

  return redirect(`/${room.id}`);
}

async function reserveRoomName(
  formData: FormData,
): Promise<RoomsCreateActionData> {
  const name = String(formData.get('name') ?? '').trim();
  const [err, reservation] = await api.post('/rooms/reservations', null, {
    name: name || undefined,
  });
  if (err || !reservation) {
    const rateLimitMessage = err ? getRateLimitMessage(err) : null;
    const apiErrorMessage = err ? await getAPIErrorMessage(err) : null;
    const status = err ? getHttpError(err)?.response.status : null;
    return {
      checkedName: name,
      error:
        rateLimitMessage ?? apiErrorMessage ?? 'Could not reserve this name',
      ...(rateLimitMessage && { rateLimitMessage }),
      ...(status === CONFLICT_STATUS && { roomNameUnavailable: true }),
    };
  }

  return {
    checkedName: name,
    reservation,
  };
}
