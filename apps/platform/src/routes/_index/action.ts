import { api, getRateLimitMessage } from '@vibes/api';
import { type ClientActionFunctionArgs, redirect } from 'react-router';

export interface HomeActionData {
  error?: string;
  intent: 'generateRoom' | 'roomExists';
  roomCode?: string;
  roomExists?: boolean;
}

export async function clientAction({
  request,
}: ClientActionFunctionArgs): Promise<HomeActionData | Response> {
  const formData = await request.formData();
  const intent = String(formData.get('intent') ?? 'roomExists');

  if (intent === 'generateRoom') {
    const prompt = String(formData.get('prompt') ?? '').trim();
    const [error, generatedRoom] = await api.post(
      '/rooms/generations',
      null,
      { prompt },
      { timeout: 50_000 },
    );
    const responseData: HomeActionData = {
      intent: 'generateRoom',
      ...(error && {
        error:
          getRateLimitMessage(error) ??
          'Could not generate your music room. Please try again.',
      }),
    };

    if (generatedRoom) {
      return redirect(`/rooms/${generatedRoom.room.id}`);
    }

    return responseData;
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

  const [error] = await api.get('/rooms/{id}', { id: roomCode });

  return {
    intent: 'roomExists',
    roomCode,
    roomExists: !error,
  };
}
