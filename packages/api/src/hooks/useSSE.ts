import type {
  PlaybackState,
  Room,
  RoomGenerationUpdate,
  RoomHostUpdate,
  SkipVoteUpdate,
  Song,
} from '@vibes/models';
import { useEffect, useRef } from 'react';
import type { ApiClient } from '../index';
import { api } from '../index';
import { subscribeRoomEvents } from '../roomEvents';

export interface RoomEventCallbacks {
  onConnected?: (serverTimeMs: number) => void;
  onGenerationUpdate?: (update: RoomGenerationUpdate) => void;
  onHostUpdate?: (update: RoomHostUpdate) => void;
  onPlaybackUpdate?: (playback: PlaybackState) => void;
  onReconnect?: () => void;
  onRoomUpdate?: (room: Room) => void;
  onSkipVote?: (update: SkipVoteUpdate) => void;
  onSongAdded?: (song: Song) => void;
  onSongsUpdate?: (songs: Song[]) => void;
  onUsersUpdate?: (count: number) => void;
}

export function useSSE(
  roomId: string | undefined,
  callbacks: RoomEventCallbacks,
  client: ApiClient = api,
) {
  const callbacksRef = useRef(callbacks);

  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    if (!roomId) return;

    let active = true;
    let connected = false;
    let unsubscribe: (() => void) | null = null;

    const subscribe = async () => {
      const [error, stop] = await subscribeRoomEvents(
        client,
        roomId,
        ([eventError, message]) => {
          if (!active || eventError || !message) return;
          const current = callbacksRef.current;
          if (message.type === 'connected') {
            current.onConnected?.(message.data.time);
            if (connected) {
              current.onReconnect?.();
            }
            connected = true;
            return;
          }
          if (message.type === 'songs_update') {
            current.onSongsUpdate?.(message.data);
            return;
          }
          if (message.type === 'playback_update') {
            current.onPlaybackUpdate?.(message.data);
            return;
          }
          if (message.type === 'song_added') {
            current.onSongAdded?.(message.data);
            return;
          }
          if (message.type === 'settings_update') {
            current.onRoomUpdate?.(message.data);
            return;
          }
          if (message.type === 'users_update') {
            current.onUsersUpdate?.(message.data);
            return;
          }
          if (message.type === 'generation_update') {
            current.onGenerationUpdate?.(message.data);
            return;
          }
          if (message.type === 'new_host') {
            current.onHostUpdate?.(message.data);
            return;
          }
          if (message.type === 'skip_vote') {
            current.onSkipVote?.(message.data);
          }
        },
      );
      if (!active) {
        stop?.();
        return;
      }
      if (!error && stop) {
        unsubscribe = stop;
      }
    };

    void subscribe();

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [client, roomId]);
}
