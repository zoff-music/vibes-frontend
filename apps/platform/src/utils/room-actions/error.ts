import {
  getAPIErrorResponse,
  getHttpError,
  getRateLimitMessage,
} from '@vibes/api';
import type { RoomActionData, RoomActionIntent } from './submitRoomAction';

export async function createErrorData(
  intent: RoomActionIntent,
  error: Error | null,
) {
  const apiError = error ? await getAPIErrorResponse(error) : null;
  const status = error ? getHttpError(error)?.response.status : null;

  if (apiError?.error === 'youtube_search_quota_exhausted') {
    return {
      error:
        'YouTube search has reached its daily limit for Zoff, not just you. It resets at midnight Pacific time. You can still try pasting a YouTube song or playlist link.',
      intent,
    } satisfies RoomActionData;
  }

  let permissionError: string | null = null;

  if (apiError?.error === 'song_room_admin_required') {
    permissionError =
      intent === 'addPlaylist'
        ? 'Only room admins can import playlists here.'
        : 'Only room admins can add songs here.';
  }

  if (intent === 'skip' && !apiError) {
    if (status === UNAUTHORIZED_STATUS) {
      permissionError = 'Rejoin the room before skipping songs.';
    }

    if (status === FORBIDDEN_STATUS) {
      permissionError =
        'You do not have permission to skip songs in this room.';
    }
  }

  if (
    intent === 'generatePlaylist' &&
    (status === UNAUTHORIZED_STATUS || status === FORBIDDEN_STATUS)
  ) {
    permissionError = 'Log in as admin to generate songs for this room.';
  }

  return {
    error:
      permissionError ??
      (error && getRateLimitMessage(error)) ??
      apiError?.message ??
      ((intent === 'skip' && 'Failed to skip. Please try again.') ||
        (intent === 'search' &&
          'Could not search for music. Please try again.') ||
        (intent === 'addPlaylist' &&
          'Failed to import the playlist. Please try again.') ||
        (intent === 'providerItem' && 'Could not load that item.') ||
        (intent === 'providerPlaylist' && 'Could not load that playlist.') ||
        'The request failed'),
    ...(apiError?.error === 'song_room_admin_required' && {
      errorAction: 'adminLogin' as const,
    }),
    intent,
  } satisfies RoomActionData;
}

const FORBIDDEN_STATUS = 403;

const UNAUTHORIZED_STATUS = 401;
