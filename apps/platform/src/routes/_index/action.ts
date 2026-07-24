import { api, getAPIErrorMessage, getRateLimitMessage } from '@vibes/api';
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
    if (!prompt) {
      return {
        error: 'Describe the playlist you want.',
        intent: 'generateRoom',
      };
    }

    const [createError, room] = await api.post('/rooms/generation', null, {
      prompt,
    });
    if (createError) {
      const apiErrorMessage = await getAPIErrorMessage(createError);
      return {
        intent: 'generateRoom',
        error:
          apiErrorMessage ??
          getRateLimitMessage(createError) ??
          'Could not generate your music room. Please try again.',
      };
    }

    return redirect(`/rooms/${room.id}`);
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
