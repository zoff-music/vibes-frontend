import {
  type ClientActionFunctionArgs,
  redirect,
} from '@kasperrt/smolter/preact';
import {
  api,
  getAPIErrorMessage,
  getHttpError,
  getRateLimitMessage,
} from '@vibes/api';
import type { RoomType } from '@vibes/models';
import {
  type PendingGeneration,
  savePendingGeneration,
} from '../../../../utils/pendingGeneration';

export interface HomeActionData {
  error?: string;
  intent: 'generateRoom' | 'roomExists' | 'joinRoom';
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

    const pending: PendingGeneration = {
      id: generation.id,
      prompt,
      roomType,
      createdAt: Date.now(),
    };
    savePendingGeneration(roomType, pending);

    return {
      intent: 'generateRoom',
      generation: pending,
      generationRoomType: roomType,
    };
  }

  const rawRoomCode = String(formData.get('roomCode') ?? '');
  const roomCode = rawRoomCode.trim();

  if (!roomCode) {
    return {
      intent: 'roomExists',
      roomCode,
      roomExists: false,
    };
  }

  const [error, room] = await api.v2.get(
    '/room-resolutions',
    {
      $search: { name: roomCode },
    },
    { signal: request.signal },
  );
  if (intent === 'joinRoom') {
    if (error && getHttpError(error)?.response.status !== 404) {
      return {
        intent: 'joinRoom',
        error:
          (await getAPIErrorMessage(error)) ??
          getRateLimitMessage(error) ??
          'Could not find that room. Please try again.',
      };
    }
    if (room) return redirect(`/${encodeURIComponent(room.id)}`);
    const createUrl = new URL('/rooms/create', request.url);
    createUrl.searchParams.set('name', roomCode);
    if (formData.get('roomType') === 'WATCH')
      createUrl.searchParams.set('type', 'watch');
    return redirect(createUrl.toString());
  }

  return {
    intent: 'roomExists',
    roomCode,
    roomExists: !error,
  };
}
