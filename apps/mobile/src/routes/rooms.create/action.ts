import { createRoomLifecycleRequests } from '@vibes/api';
import type { CreateRoomRequest, RoomNameReservation } from '@vibes/models';
import type { ActionFunctionArgs, DataResult } from '@vibes/native-router';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';

type CreateRoomActionInput =
  | { intent: 'create'; request: CreateRoomRequest }
  | { intent: 'generate'; prompt: string }
  | { intent: 'reserve'; name?: string };

export type CreateRoomActionData =
  | { intent: 'created'; roomId: string }
  | { intent: 'generated'; roomId: string }
  | { intent: 'reserved'; reservation: RoomNameReservation };

const requests = createRoomLifecycleRequests(mobileApi);

export async function action({
  input,
  signal,
}: ActionFunctionArgs): Promise<DataResult<CreateRoomActionData>> {
  if (!isCreateRoomActionInput(input)) {
    return { data: null, error: 'The room request was invalid.' };
  }
  if (input.intent === 'reserve') {
    const [error, reservation] = await requests.reserveRoom(input.name, {
      signal,
    });
    if (error || !reservation) {
      return {
        data: null,
        error: await getRequestErrorMessage(
          error,
          input.name
            ? 'Could not reserve this room name.'
            : 'Could not generate a room name.',
        ),
      };
    }
    return { data: { intent: 'reserved', reservation }, error: '' };
  }
  if (input.intent === 'generate') {
    const [error, room] = await requests.createGeneratedRoom(
      { prompt: input.prompt },
      { signal },
    );
    if (error || !room) {
      return {
        data: null,
        error: await getRequestErrorMessage(
          error,
          'Could not start playlist generation.',
        ),
      };
    }
    return { data: { intent: 'generated', roomId: room.id }, error: '' };
  }
  const [error, room] = await requests.createRoom(input.request, { signal });
  if (error || !room) {
    return {
      data: null,
      error: await getRequestErrorMessage(error, 'Could not create this room.'),
    };
  }
  return { data: { intent: 'created', roomId: room.id }, error: '' };
}

function isCreateRoomActionInput(
  input: unknown,
): input is CreateRoomActionInput {
  if (!input || typeof input !== 'object' || !('intent' in input)) {
    return false;
  }
  return (
    input.intent === 'reserve' ||
    input.intent === 'generate' ||
    input.intent === 'create'
  );
}
