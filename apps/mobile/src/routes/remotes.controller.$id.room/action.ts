import { createRoomLifecycleRequests } from '@vibes/api';
import type { Room, RoomUpdate } from '@vibes/models';
import type { ActionFunctionArgs, DataResult } from '@vibes/native-router';
import { createRemoteApi, getRequestErrorMessage } from '@/lib/api';

type ControllerRoomActionInput =
  | { intent: 'authenticate'; password: string; roomId: string }
  | { intent: 'logout'; roomId: string }
  | { intent: 'settings'; roomId: string; update: RoomUpdate };

export type ControllerRoomActionData =
  | { intent: 'roomUpdated'; room: Room }
  | { intent: 'success' };

export async function action({
  input,
  params,
  signal,
}: ActionFunctionArgs): Promise<DataResult<ControllerRoomActionData>> {
  const remoteId = params.id;
  const controllerToken = params.controllerToken;
  if (!remoteId || !controllerToken || !isControllerRoomActionInput(input)) {
    return { data: null, error: 'The controlled-room request was invalid.' };
  }
  const requests = createRoomLifecycleRequests(
    createRemoteApi(remoteId, controllerToken),
  );
  if (input.intent === 'authenticate') {
    const [error, session] = await requests.joinRoom(
      input.roomId,
      input.password,
      { signal },
    );
    if (error || !session) {
      return failure(error, 'The admin password was not accepted.');
    }
    return { data: { intent: 'roomUpdated', room: session.room }, error: '' };
  }
  if (input.intent === 'logout') {
    const [error] = await requests.logOutRoomAdmin(input.roomId, { signal });
    if (error) return failure(error, 'Could not log out of this room.');
    return { data: { intent: 'success' }, error: '' };
  }
  const [error, room] = await requests.updateRoom(input.roomId, input.update, {
    signal,
  });
  if (error || !room) return failure(error, 'Could not update room settings.');
  return { data: { intent: 'roomUpdated', room }, error: '' };
}

async function failure(
  error: Error | null,
  fallback: string,
): Promise<DataResult<ControllerRoomActionData>> {
  return { data: null, error: await getRequestErrorMessage(error, fallback) };
}

function isControllerRoomActionInput(
  input: unknown,
): input is ControllerRoomActionInput {
  if (!input || typeof input !== 'object' || !('intent' in input)) return false;
  return ['authenticate', 'logout', 'settings'].includes(String(input.intent));
}
