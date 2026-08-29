import { createQueueAddRequests, createRoomQueueRequests } from '@vibes/api';
import type { AddPlaylistRequest, AddSongRequest } from '@vibes/models';
import type { ActionFunctionArgs, DataResult } from '@vibes/native-router';
import { createRemoteApi, getRequestErrorMessage, mobileApi } from '@/lib/api';

interface RemoteCredentials {
  controllerToken: string;
  remoteId: string;
}

type SearchActionInput =
  | {
      credentials?: RemoteCredentials;
      intent: 'addPlaylist';
      request: AddPlaylistRequest;
    }
  | {
      credentials?: RemoteCredentials;
      intent: 'addSong';
      request: AddSongRequest;
    }
  | {
      credentials?: RemoteCredentials;
      intent: 'generate';
      prompt: string;
    };

export interface SearchActionData {
  intent: 'playlistQueued' | 'success';
  queuedCount?: number;
}

export async function action({
  input,
  params,
  signal,
}: ActionFunctionArgs): Promise<DataResult<SearchActionData>> {
  const roomId = params.id;
  if (!roomId) return { data: null, error: 'A room is required.' };
  if (!isSearchActionInput(input)) {
    return { data: null, error: 'The music request was invalid.' };
  }
  const client = input.credentials
    ? createRemoteApi(
        input.credentials.remoteId,
        input.credentials.controllerToken,
      )
    : mobileApi;
  if (input.intent === 'generate') {
    const [error] = await createRoomQueueRequests(client).generatePlaylist(
      roomId,
      { prompt: input.prompt },
      { signal },
    );
    if (error) return failure(error, 'Could not start playlist generation.');
    return { data: { intent: 'success' }, error: '' };
  }
  const requests = createQueueAddRequests(client);
  if (input.intent === 'addSong') {
    const [error] = await requests.addSong(roomId, input.request, { signal });
    if (error) return failure(error, 'Could not add this song.');

    return { data: { intent: 'success' }, error: '' };
  }

  const [error, playlistImport] = await requests.addPlaylist(
    roomId,
    input.request,
    { signal },
  );
  if (error) return failure(error, 'Could not queue this playlist.');
  if (!playlistImport) {
    return { data: null, error: 'Could not queue this playlist.' };
  }

  return {
    data: {
      intent: 'playlistQueued',
      queuedCount: playlistImport.queuedCount,
    },
    error: '',
  };
}

async function failure(
  error: Error,
  fallback: string,
): Promise<DataResult<SearchActionData>> {
  return { data: null, error: await getRequestErrorMessage(error, fallback) };
}

function isSearchActionInput(input: unknown): input is SearchActionInput {
  if (!input || typeof input !== 'object' || !('intent' in input)) return false;
  return ['addPlaylist', 'addSong', 'generate'].includes(String(input.intent));
}
