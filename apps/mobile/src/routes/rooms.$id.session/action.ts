import {
  createRoomLifecycleRequests,
  createRoomPlaybackRequests,
  createRoomReadRequests,
  getHttpError,
} from '@vibes/api';
import type { Room } from '@vibes/models';
import type { ActionFunctionArgs, DataResult } from '@vibes/native-router';
import type { RoomSnapshot } from '@/data-router/room-snapshot';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';
import {
  deleteSecureValue,
  getSecureValue,
  setSecureValue,
} from '@/lib/secure-storage';
import {
  getRoomAdminPasswordStorageKey,
  remoteStorageKey,
  remoteTokenStorageKey,
} from '@/lib/storage-keys';

type RoomSessionActionInput =
  | { intent: 'authenticate'; password: string }
  | { intent: 'logoutAdmin' }
  | { intent: 'open'; password?: string };

export type RoomSessionActionData =
  | { intent: 'joined'; snapshot: RoomSnapshot; warning: string }
  | { intent: 'roomUpdated'; room: Room; warning: string }
  | { intent: 'success'; warning: string };

const lifecycleRequests = createRoomLifecycleRequests(mobileApi);
const playbackRequests = createRoomPlaybackRequests(mobileApi);
const readRequests = createRoomReadRequests(mobileApi);
const notFoundStatus = 404;

export async function action({
  input,
  params,
  signal,
}: ActionFunctionArgs): Promise<DataResult<RoomSessionActionData>> {
  const roomId = params.id;
  if (!roomId) return { data: null, error: 'A room is required.' };
  if (!isRoomSessionActionInput(input)) {
    return { data: null, error: 'The room session request was invalid.' };
  }
  if (input.intent === 'open') return openRoom(roomId, signal, input.password);
  if (input.intent === 'logoutAdmin') return logOut(roomId, signal);

  const [error, session] = await lifecycleRequests.joinRoom(
    roomId,
    input.password,
    { signal },
  );
  if (error || !session) {
    return requestFailure(error, 'The admin password was not accepted.');
  }
  const [storageError] = await setSecureValue(
    getRoomAdminPasswordStorageKey(roomId),
    input.password,
  );
  return {
    data: {
      intent: 'roomUpdated',
      room: session.room,
      warning: storageError
        ? 'Admin access was granted, but the password could not be saved.'
        : '',
    },
    error: '',
  };
}

async function logOut(
  roomId: string,
  signal: AbortSignal,
): Promise<DataResult<RoomSessionActionData>> {
  const [error] = await lifecycleRequests.logOutRoomAdmin(roomId, { signal });
  const status = error ? getHttpError(error)?.response.status : null;
  if (error && status !== 404 && status !== 405) {
    return requestFailure(error, 'Could not sign out as room admin.');
  }
  const [storageError] = await deleteSecureValue(
    getRoomAdminPasswordStorageKey(roomId),
  );
  return {
    data: {
      intent: 'success',
      warning: storageError
        ? 'Signed out, but the saved password could not be removed.'
        : '',
    },
    error: '',
  };
}

async function openRoom(
  roomId: string,
  signal: AbortSignal,
  password = '',
): Promise<DataResult<RoomSessionActionData>> {
  const [storageError, storedPassword] = await getSecureValue(
    getRoomAdminPasswordStorageKey(roomId),
  );
  const adminPassword = password || storedPassword || '';
  let warning = storageError
    ? 'Room opened, but the saved admin password could not be read.'
    : '';
  let authenticated = false;
  if (adminPassword) {
    const [error] = await lifecycleRequests.joinRoom(roomId, adminPassword, {
      signal,
    });
    if (error && password) {
      return requestFailure(
        error,
        'Could not authenticate with that admin password.',
      );
    }
    if (error) {
      warning = 'Room opened, but the saved admin password was not accepted.';
      const [deleteError] = await deleteSecureValue(
        getRoomAdminPasswordStorageKey(roomId),
      );
      if (deleteError) {
        warning = 'Room opened, but the rejected saved password remains.';
      }
    } else {
      authenticated = true;
      const [saveError] = await setSecureValue(
        getRoomAdminPasswordStorageKey(roomId),
        adminPassword,
      );
      if (saveError) {
        warning = 'Room opened, but the admin password could not be saved.';
      }
    }
  }

  const [roomResult, songsResult, playbackResult] = await Promise.all([
    readRequests.fetchRoom(roomId, { signal }),
    readRequests.fetchSongs(roomId, { signal }),
    playbackRequests.fetchPlayback(roomId, { signal }),
  ]);
  const error = roomResult[0] ?? songsResult[0] ?? playbackResult[0];
  if (error || !roomResult[1] || !songsResult[1] || !playbackResult[1]) {
    const status = error ? getHttpError(error)?.response.status : null;
    return {
      data: null,
      error:
        status === notFoundStatus
          ? 'ROOM_NOT_FOUND'
          : await getRequestErrorMessage(
              error,
              'Could not open that room. Check the room name and try again.',
            ),
    };
  }
  const snapshot: RoomSnapshot = {
    playback: playbackResult[1],
    room: roomResult[1],
    songs: songsResult[1],
  };
  const credentialResults = await Promise.all([
    deleteSecureValue(remoteStorageKey),
    deleteSecureValue(remoteTokenStorageKey),
  ]);
  if (credentialResults[0][0] || credentialResults[1][0]) {
    warning = 'Room opened, but the previous remote session remains saved.';
  }
  return {
    data: {
      intent: 'joined',
      snapshot: {
        ...snapshot,
        room:
          snapshot.room.hasPassword && authenticated
            ? { ...snapshot.room, isAdmin: true }
            : snapshot.room,
      },
      warning,
    },
    error: '',
  };
}

async function requestFailure(
  error: Error | null,
  fallback: string,
): Promise<DataResult<RoomSessionActionData>> {
  return { data: null, error: await getRequestErrorMessage(error, fallback) };
}

function isRoomSessionActionInput(
  input: unknown,
): input is RoomSessionActionInput {
  if (!input || typeof input !== 'object' || !('intent' in input)) return false;
  return ['authenticate', 'logoutAdmin', 'open'].includes(String(input.intent));
}
