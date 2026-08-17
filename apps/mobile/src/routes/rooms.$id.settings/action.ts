import { createRoomLifecycleRequests } from '@vibes/api';
import type { Room, RoomUpdate } from '@vibes/models';
import type { ActionFunctionArgs, DataResult } from '@vibes/native-router';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';

interface RoomSettingsActionInput {
  update: RoomUpdate;
}

export interface RoomSettingsActionData {
  room: Room;
}

const requests = createRoomLifecycleRequests(mobileApi);

export async function action({
  input,
  params,
  signal,
}: ActionFunctionArgs): Promise<DataResult<RoomSettingsActionData>> {
  const roomId = params.id;
  if (!roomId || !isRoomSettingsActionInput(input)) {
    return { data: null, error: 'The room settings request was invalid.' };
  }
  const [error, room] = await requests.updateRoom(roomId, input.update, {
    signal,
  });
  if (error || !room) {
    return {
      data: null,
      error: await getRequestErrorMessage(
        error,
        'Could not update room settings.',
      ),
    };
  }
  return { data: { room }, error: '' };
}

function isRoomSettingsActionInput(
  input: unknown,
): input is RoomSettingsActionInput {
  return Boolean(input && typeof input === 'object' && 'update' in input);
}
