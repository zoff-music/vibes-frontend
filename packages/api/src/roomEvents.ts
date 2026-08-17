import type {
  Connected,
  EventCursor,
  PlaybackState,
  Room,
  RoomGenerationUpdate,
  RoomHostUpdate,
  SkipVoteUpdate,
  Song,
} from '@vibes/models';
import type { ApiClient } from './index';

export type RoomSSEMessage =
  | { type: 'connected'; data: Connected }
  | { type: 'event_cursor'; data: EventCursor }
  | { type: 'songs_update'; data: Song[] }
  | { type: 'playback_update'; data: PlaybackState }
  | { type: 'users_update'; data: number }
  | { type: 'song_added'; data: Song }
  | { type: 'skip_vote'; data: SkipVoteUpdate }
  | { type: 'settings_update'; data: Room }
  | { type: 'generation_update'; data: RoomGenerationUpdate }
  | { type: 'new_host'; data: RoomHostUpdate };

export type RoomSSECallback = (
  result: [Error | null, RoomSSEMessage | null],
) => void;

const CLIENT_IDS = new WeakMap<ApiClient, number>();
const ROOM_EVENT_CURSORS = new Map<string, string>();
let nextClientId = 1;

function roomCursorKey(
  client: ApiClient,
  roomId: string,
  cursorScope?: string,
): string {
  if (cursorScope) {
    return `${cursorScope}:${roomId}`;
  }

  let clientId = CLIENT_IDS.get(client);
  if (!clientId) {
    clientId = nextClientId;
    nextClientId += 1;
    CLIENT_IDS.set(client, clientId);
  }

  return `${clientId}:${roomId}`;
}

export async function subscribeRoomEvents(
  client: ApiClient,
  roomId: string,
  callback: RoomSSECallback,
  cursorScope?: string,
): Promise<[Error | null, (() => void) | null]> {
  const cursorKey = roomCursorKey(client, roomId, cursorScope);
  const lastEventId = ROOM_EVENT_CURSORS.get(cursorKey);
  const [error, unsubscribe] = await client.sse(
    '/rooms/{id}/events',
    {
      id: roomId,
      $search: lastEventId ? { lastEventId } : undefined,
    },
    (result: [Error | null, RoomSSEMessage | null]) => {
      const [eventError, message] = result;
      if (eventError || !message) {
        callback(result);
        return;
      }
      if (message.type === 'event_cursor') {
        ROOM_EVENT_CURSORS.set(cursorKey, message.data.id);
        return;
      }

      callback(result);
    },
  );

  if (error || !unsubscribe) {
    ROOM_EVENT_CURSORS.delete(cursorKey);
    return [error, null];
  }

  return [
    null,
    () => {
      unsubscribe();
      ROOM_EVENT_CURSORS.delete(cursorKey);
    },
  ];
}
