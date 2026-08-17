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
  intent: 'success';
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
  const [error] =
    input.intent === 'addSong'
      ? await requests.addSong(roomId, input.request, { signal })
      : await requests.addPlaylist(roomId, input.request, { signal });
  if (error) {
    return failure(
      error,
      input.intent === 'addSong'
        ? 'Could not add this song.'
        : 'Could not add this playlist.',
    );
  }
  return { data: { intent: 'success' }, error: '' };
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
