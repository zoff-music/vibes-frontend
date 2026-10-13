import type {
  Connected,
  EventCursor,
  PlaybackStateV2,
  PlaylistItem,
  PlaylistItemIdUpdate,
  PlaylistItemPositionUpdate,
  RoomGenerationUpdate,
  RoomHostUpdate,
  RoomV2,
  SkipVoteUpdateV2,
} from '@vibes/models';
import type { ApiV3Client } from './client';

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

export type RoomSSEV3Message =
  | { type: 'connected'; data: Connected }
  | { type: 'event_cursor'; data: EventCursor }
  | { type: 'playlist_items_snapshot'; data: PlaylistItem[] }
  | { type: 'playback_update'; data: PlaybackStateV2 }
  | { type: 'users_update'; data: number }
  | { type: 'playlist_item_added'; data: PlaylistItem }
  | { type: 'playlist_item_updated'; data: PlaylistItemPositionUpdate }
  | { type: 'playlist_item_removed'; data: PlaylistItemIdUpdate }
  | { type: 'skip_vote'; data: SkipVoteUpdateV2 }
  | { type: 'settings_update'; data: RoomV2 }
  | { type: 'generation_update'; data: RoomGenerationUpdate }
  | { type: 'new_host'; data: RoomHostUpdate };

export type RoomSSEV3Callback = (
  result: [Error | null, RoomSSEV3Message | null],
) => void;

export interface RoomEventV3Callbacks {
  onConnected?: (serverTimeMs: number) => void;
  onGenerationUpdate?: (update: RoomGenerationUpdate) => void;
  onHostUpdate?: (update: RoomHostUpdate) => void;
  onPlaybackUpdate?: (playback: PlaybackStateV2) => void;
  onReconnect?: () => void;
  onRoomUpdate?: (room: RoomV2) => void;
  onSkipVote?: (update: SkipVoteUpdateV2) => void;
  onPlaylistItemAdded?: (playlistItem: PlaylistItem) => void;
  onPlaylistItemRemoved?: (update: PlaylistItemIdUpdate) => void;
  onPlaylistItemUpdated?: (update: PlaylistItemPositionUpdate) => void;
  onPlaylistItemsUpdate?: (playlistItems: PlaylistItem[]) => void;
  onUsersUpdate?: (count: number) => void;
}

export async function subscribeRoomEventsV3(
  client: ApiV3Client,
  roomId: string,
  callback: RoomSSEV3Callback,
  cursorScope?: string,
): Promise<[Error | null, (() => void) | null]> {
  const cursorKey = `v3:${roomCursorKey(client, roomId, cursorScope)}`;
  const lastEventId = ROOM_EVENT_CURSORS.get(cursorKey);
  const [error, unsubscribe] = await client.sse(
    '/rooms/{id}/events',
    {
      id: roomId,
      $search: lastEventId ? { lastEventId } : undefined,
    },
    (result: [Error | null, RoomSSEV3Message | null]) => {
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

export function subscribeRoomUpdatesV3(
  client: ApiV3Client,
  roomId: string,
  callbacks: RoomEventV3Callbacks,
): Promise<[Error | null, (() => void) | null]> {
  let connected = false;
  return subscribeRoomEventsV3(client, roomId, ([eventError, message]) => {
    if (eventError || !message) return;
    if (message.type === 'connected') {
      callbacks.onConnected?.(message.data.time);
      if (connected) callbacks.onReconnect?.();
      connected = true;
      return;
    }
    if (message.type === 'playlist_items_snapshot') {
      callbacks.onPlaylistItemsUpdate?.(message.data);
      return;
    }
    if (message.type === 'playback_update') {
      callbacks.onPlaybackUpdate?.(message.data);
      return;
    }
    if (message.type === 'playlist_item_added') {
      callbacks.onPlaylistItemAdded?.(message.data);
      return;
    }
    if (message.type === 'playlist_item_updated') {
      callbacks.onPlaylistItemUpdated?.(message.data);
      return;
    }
    if (message.type === 'playlist_item_removed') {
      callbacks.onPlaylistItemRemoved?.(message.data);
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
