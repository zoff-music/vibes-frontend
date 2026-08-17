import {
  createRoomLifecycleRequests,
  getRequestErrorMessage,
} from '@vibes/api';
import type { Providers } from '@vibes/models';
import type { ActionFunctionArgs, DataResult } from '@vibes/native-router';
import { DEFAULT_ROOM_SETTINGS } from '@vibes/shared';
import { tvApi } from '@/lib/api';

type CreateRoomInput =
  | { intent: 'create'; name: string; providers: Providers }
  | { intent: 'generate'; prompt: string };

export interface CreateRoomData {
  roomId: string;
}

const requests = createRoomLifecycleRequests(tvApi);

export async function action({
  input,
  signal,
}: ActionFunctionArgs): Promise<DataResult<CreateRoomData>> {
  if (!isCreateRoomInput(input)) {
    return { data: null, error: 'That TV action is not supported.' };
  }
  if (input.intent === 'generate') return generateRoom(input.prompt, signal);
  return createRoom(input.name, input.providers, signal);
}

async function generateRoom(
  prompt: string,
  signal: AbortSignal,
): Promise<DataResult<CreateRoomData>> {
  const normalizedPrompt = prompt.trim();
  if (!normalizedPrompt) {
    return { data: null, error: 'Describe the playlist you want.' };
  }
  const [error, room] = await requests.createGeneratedRoom(
    { prompt: normalizedPrompt },
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
  return { data: { roomId: room.id }, error: '' };
}

async function createRoom(
  name: string,
  providers: Providers,
  signal: AbortSignal,
): Promise<DataResult<CreateRoomData>> {
  const normalizedName = name.trim().toLowerCase().replace(/\s+/g, '-');
  if (!normalizedName) return { data: null, error: 'Enter a room name.' };
  if (providers.length === 0) {
    return { data: null, error: 'Music providers are still loading.' };
  }
  const [reservationError, reservation] = await requests.reserveRoom(
    normalizedName,
    { signal },
  );
  if (reservationError || !reservation) {
    return {
      data: null,
      error: await getRequestErrorMessage(
        reservationError,
        'Could not reserve that room name.',
      ),
    };
  }
  const [error, room] = await requests.createRoom(
    {
      name: normalizedName,
      mode: 'server',
      reservationToken: reservation.token,
      settings: { ...DEFAULT_ROOM_SETTINGS, enabledSources: providers },
    },
    { signal },
  );
  if (error || !room) {
    return {
      data: null,
      error: await getRequestErrorMessage(error, 'Could not create that room.'),
    };
  }
  return { data: { roomId: room.id }, error: '' };
}

function isCreateRoomInput(input: unknown): input is CreateRoomInput {
  if (!input || typeof input !== 'object' || !('intent' in input)) return false;
  if (input.intent === 'generate') {
    return 'prompt' in input && typeof input.prompt === 'string';
  }
  return (
    input.intent === 'create' &&
    'name' in input &&
    typeof input.name === 'string' &&
    'providers' in input &&
    Array.isArray(input.providers)
  );
}
