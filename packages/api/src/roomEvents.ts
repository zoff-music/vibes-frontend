import type {
  Connected,
  EventCursor,
  PlaybackState,
  Room,
  RoomGenerationUpdate,
  RoomHostUpdate,
  SkipVoteUpdate,
  Song,
  SongIdUpdate,
  SongPositionUpdate,
} from '@vibes/models';
import type { ApiClient, ApiV2Client } from './client';

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

export type RoomSSEV2Message =
  | { type: 'connected'; data: Connected }
  | { type: 'event_cursor'; data: EventCursor }
  | { type: 'songs_snapshot'; data: Song[] }
  | { type: 'playback_update'; data: PlaybackState }
  | { type: 'users_update'; data: number }
  | { type: 'song_added'; data: Song }
  | { type: 'song_updated'; data: SongPositionUpdate }
  | { type: 'song_removed'; data: SongIdUpdate }
  | { type: 'skip_vote'; data: SkipVoteUpdate }
  | { type: 'settings_update'; data: Room }
  | { type: 'generation_update'; data: RoomGenerationUpdate }
  | { type: 'new_host'; data: RoomHostUpdate };

export type RoomSSECallback = (
  result: [Error | null, RoomSSEMessage | null],
) => void;

export type RoomSSEV2Callback = (
  result: [Error | null, RoomSSEV2Message | null],
) => void;

export interface RoomEventCallbacks {
  onConnected?: (serverTimeMs: number) => void;
  onGenerationUpdate?: (update: RoomGenerationUpdate) => void;
  onHostUpdate?: (update: RoomHostUpdate) => void;
  onPlaybackUpdate?: (playback: PlaybackState) => void;
  onReconnect?: () => void;
  onRoomUpdate?: (room: Room) => void;
  onSkipVote?: (update: SkipVoteUpdate) => void;
  onSongAdded?: (song: Song) => void;
  onSongRemoved?: (update: SongIdUpdate) => void;
  onSongUpdated?: (update: SongPositionUpdate) => void;
  onSongsUpdate?: (songs: Song[]) => void;
  onUsersUpdate?: (count: number) => void;
}

const CLIENT_IDS = new WeakMap<object, number>();
const ROOM_EVENT_CURSORS = new Map<string, string>();
let nextClientId = 1;

function roomCursorKey(
  client: object,
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

export async function subscribeRoomEventsV2(
  client: ApiV2Client,
  roomId: string,
  callback: RoomSSEV2Callback,
  cursorScope?: string,
): Promise<[Error | null, (() => void) | null]> {
  const cursorKey = `v2:${roomCursorKey(client, roomId, cursorScope)}`;
  const lastEventId = ROOM_EVENT_CURSORS.get(cursorKey);
  const [error, unsubscribe] = await client.sse(
    '/rooms/{id}/events',
    {
      id: roomId,
      $search: lastEventId ? { lastEventId } : undefined,
    },
    (result: [Error | null, RoomSSEV2Message | null]) => {
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

export function subscribeRoomUpdates(
  client: ApiClient,
  roomId: string,
  callbacks: RoomEventCallbacks,
): Promise<[Error | null, (() => void) | null]> {
  let connected = false;
  return subscribeRoomEvents(client, roomId, ([eventError, message]) => {
    if (eventError || !message) return;
    if (message.type === 'connected') {
      callbacks.onConnected?.(message.data.time);
      if (connected) callbacks.onReconnect?.();
      connected = true;
      return;
    }
    if (message.type === 'songs_update') {
      callbacks.onSongsUpdate?.(message.data);
      return;
    }
    if (message.type === 'playback_update') {
      callbacks.onPlaybackUpdate?.(message.data);
      return;
    }
    if (message.type === 'song_added') {
      callbacks.onSongAdded?.(message.data);
      return;
    }
    if (message.type === 'settings_update') {
      callbacks.onRoomUpdate?.(message.data);
      return;
    }
    if (message.type === 'users_update') {
      callbacks.onUsersUpdate?.(message.data);
      return;
    }
    if (message.type === 'generation_update') {
      callbacks.onGenerationUpdate?.(message.data);
      return;
    }
    if (message.type === 'new_host') {
      callbacks.onHostUpdate?.(message.data);
      return;
    }
    if (message.type === 'skip_vote') {
      callbacks.onSkipVote?.(message.data);
    }
  });
}

export function subscribeRoomUpdatesV2(
  client: ApiV2Client,
  roomId: string,
  callbacks: RoomEventCallbacks,
): Promise<[Error | null, (() => void) | null]> {
  let connected = false;
  return subscribeRoomEventsV2(client, roomId, ([eventError, message]) => {
    if (eventError || !message) return;
    if (message.type === 'connected') {
      callbacks.onConnected?.(message.data.time);
      if (connected) callbacks.onReconnect?.();
      connected = true;
      return;
    }
    if (message.type === 'songs_snapshot') {
      callbacks.onSongsUpdate?.(message.data);
      return;
    }
    if (message.type === 'playback_update') {
      callbacks.onPlaybackUpdate?.(message.data);
      return;
    }
    if (message.type === 'song_added') {
      callbacks.onSongAdded?.(message.data);
      return;
    }
    if (message.type === 'song_updated') {
      callbacks.onSongUpdated?.(message.data);
      return;
    }
    if (message.type === 'song_removed') {
      callbacks.onSongRemoved?.(message.data);
      return;
    }
    if (message.type === 'settings_update') {
      callbacks.onRoomUpdate?.(message.data);
      return;
    }
    if (message.type === 'users_update') {
      callbacks.onUsersUpdate?.(message.data);
      return;
    }
    if (message.type === 'generation_update') {
      callbacks.onGenerationUpdate?.(message.data);
      return;
    }
    if (message.type === 'new_host') {
      callbacks.onHostUpdate?.(message.data);
      return;
    }
    if (message.type === 'skip_vote') {
      callbacks.onSkipVote?.(message.data);
    }
  });
}
