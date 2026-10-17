import { createRoomLifecycleRequests } from '@vibes/api';
import {
  type CreateRoomRequestV2,
  createRoomRequestV2Schema,
  type RoomNameReservation,
  type RoomType,
  roomNameReservationRequestSchema,
} from '@vibes/models';
import type { MutationArgs, RequestResult } from '@vibes/shared/requests';
import { safeParse } from 'valibot';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';

type CreateRoomActionInput =
  | { intent: 'create'; request: CreateRoomRequestV2 }
  | { intent: 'generate'; prompt: string; roomType?: RoomType }
  | { intent: 'reserve'; name?: string };

export type CreateRoomActionData =
  | { intent: 'created'; roomId: string }
  | { intent: 'generated'; roomId: string }
  | { intent: 'reserved'; reservation: RoomNameReservation };

const requests = createRoomLifecycleRequests(mobileApi);

export async function updateRoomCreation({
  input,
  signal,
}: MutationArgs): Promise<RequestResult<CreateRoomActionData>> {
  if (!isCreateRoomActionInput(input)) {
    return { data: null, error: 'The room request was invalid.' };
  }

  if (input.intent === 'reserve') {
    const parsed = safeParse(roomNameReservationRequestSchema, {
      name: input.name,
    });

    if (!parsed.success) {
      return {
        data: null,
        error: parsed.issues[0]?.message ?? 'Enter a valid room name.',
      };
    }

    const [error, reservation] = await requests.reserveRoom(
      parsed.output.name,
      {
        signal,
      },
    );

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
      { prompt: input.prompt, roomType: input.roomType ?? 'MUSIC' },
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

  const parsed = safeParse(createRoomRequestV2Schema, input.request);

  if (!parsed.success) {
    return {
      data: null,
      error: parsed.issues[0]?.message ?? 'Check the room settings.',
    };
  }

  const [error, room] = await requests.createRoom(parsed.output, { signal });

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
