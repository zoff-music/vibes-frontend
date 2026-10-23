import type { ClientActionFunctionArgs } from '@kasperrt/smolter/preact';
import { api, getAPIErrorMessage, getRateLimitMessage } from '@vibes/api';
import type { RoomType } from '@vibes/models';
import {
  type PendingGeneration,
  savePendingGeneration,
} from '../../../../utils/pendingGeneration';

export interface HomeActionData {
  error?: string;
  intent: 'generateRoom' | 'roomExists';
  roomCode?: string;
  roomExists?: boolean;
  generation?: PendingGeneration;
  generationRoomType?: RoomType;
}

export async function clientAction({
  request,
}: ClientActionFunctionArgs): Promise<HomeActionData | Response> {
  const formData = await request.formData();
  const intent = String(formData.get('intent') ?? 'roomExists');

  if (intent === 'generateRoom') {
    const prompt = String(formData.get('prompt') ?? '').trim();
    const roomType = formData.get('roomType') === 'WATCH' ? 'WATCH' : 'MUSIC';

    if (!prompt) {
      return {
        error: 'Describe the playlist you want.',
        intent: 'generateRoom',
      };
    }

    const [createError, generation] = await api.post(
      '/generations',
      null,
      {
        prompt,
        roomType,
      },
      { retry: 0 },
    );

    if (createError) {
      const apiErrorMessage = await getAPIErrorMessage(createError);

      return {
        intent: 'generateRoom',
        error:
          apiErrorMessage ??
          getRateLimitMessage(createError) ??
          'Could not generate your room. Please try again.',
      };
    }

    const pending = { id: generation.id, prompt, createdAt: Date.now() };
    savePendingGeneration(roomType, pending);

    return {
      intent: 'generateRoom',
      generation: pending,
      generationRoomType: roomType,
    };
  }

  const rawRoomCode = String(formData.get('roomCode') ?? '');
  const roomCode = rawRoomCode.trim().toLowerCase().replace(/\s+/g, '-');

  if (!roomCode) {
    return {
      intent: 'roomExists',
      roomCode,
      roomExists: false,
    };
  }

  const [error] = await api.v2.get('/rooms/{id}', { id: roomCode });

  return {
    intent: 'roomExists',
    roomCode,
    roomExists: !error,
  };
}
