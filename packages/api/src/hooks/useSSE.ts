import type {
  PlaybackState,
  Room,
  RoomGenerationUpdate,
  Song,
} from '@vibes/models';
import {
  safeWrap,
  usePlaybackStore,
  useQueueStore,
  useRoomStore,
} from '@vibes/shared';
import { useEffect, useRef } from 'react';
import type { ApiClient } from '../index';
import { api } from '../index';
import { subscribeRoomEvents } from '../roomEvents';

const ACTIVE_CONNECTIONS = new Map<
  string,
  { count: number; unsubscribe: () => void }
>();

type UnsubscribeResult = Promise<[Error | null, (() => void) | null]>;

const IN_FLIGHT_CONNECTIONS = new Map<string, UnsubscribeResult>();
const PENDING_CLEANUPS = new Map<string, ReturnType<typeof setTimeout>>();
const ROOM_CALLBACKS = new Map<string, Set<USE_SSE_CALLBACKS>>();

function scheduleConnectionCleanup(roomId: string): void {
  const pendingCleanup = PENDING_CLEANUPS.get(roomId);
  if (pendingCleanup) {
    clearTimeout(pendingCleanup);
  }

  const timeout = setTimeout(() => {
    const connection = ACTIVE_CONNECTIONS.get(roomId);
    if (connection && connection.count <= 0) {
      connection.unsubscribe();
      ACTIVE_CONNECTIONS.delete(roomId);
    }
    PENDING_CLEANUPS.delete(roomId);
  }, 2000);
  PENDING_CLEANUPS.set(roomId, timeout);
}

export interface USE_SSE_CALLBACKS {
  onGenerationUpdate?: (update: RoomGenerationUpdate) => void;
  onPlaybackUpdate?: (playback: PlaybackState) => void;
  onRoomUpdate?: (room: Room) => void;
  onSongAdded?: (song: Song) => void;
  onSongsUpdate?: (songs: Song[]) => void;
  onToast?: (message: string, type: 'success' | 'error' | 'info') => void;
  onUsersUpdate?: (count: number) => void;
}

export const useSSE = (
  roomId: string | undefined,
  callbacks?: USE_SSE_CALLBACKS,
  client: ApiClient = api,
) => {
  const setRoom = useRoomStore((state) => state.setRoom);
  const setHost = useRoomStore((state) => state.setHost);
  const setUsersCount = useRoomStore((state) => state.setUsersCount);
  const addSong = useQueueStore((state) => state.addSong);
  const setSongs = useQueueStore((state) => state.setSongs);
  const setPlaybackState = usePlaybackStore((state) => state.setPlaybackState);
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    if (!roomId || !callbacks) {
      return;
    }

    const roomCallbacks = ROOM_CALLBACKS.get(roomId) ?? new Set();
    roomCallbacks.add(callbacks);
    ROOM_CALLBACKS.set(roomId, roomCallbacks);

    return () => {
      roomCallbacks.delete(callbacks);
      if (roomCallbacks.size === 0) {
        ROOM_CALLBACKS.delete(roomId);
      }
    };
  }, [callbacks, roomId]);

  useEffect(() => {
    if (!roomId) return;
    let isMounted = true;

    const setupConnection = async () => {
      if (PENDING_CLEANUPS.has(roomId)) {
        clearTimeout(PENDING_CLEANUPS.get(roomId));
        PENDING_CLEANUPS.delete(roomId);
      }

      let connection = ACTIVE_CONNECTIONS.get(roomId);

      if (!connection) {
        let inFlight = IN_FLIGHT_CONNECTIONS.get(roomId);

        if (!inFlight) {
          inFlight = subscribeRoomEvents(client, roomId, (result) => {
            const [err, msg] = result;
            if (err) {
              console.error('SSE Error:', err);
              return;
            }

            if (!msg) return;
            const message = msg;

            switch (message.type) {
              case 'connected':
                break;
              case 'songs_update': {
                const [error] = safeWrap(() => {
                  setSongs(message.data);
                  const roomCallbacks = ROOM_CALLBACKS.get(roomId);
                  for (const roomCallback of roomCallbacks ?? []) {
                    roomCallback.onSongsUpdate?.(message.data);
                  }
                });
                if (error) console.error('Failed to parse songs_update', error);
                break;
              }
              case 'playback_update': {
                const [error] = safeWrap(() => {
                  const roomMode = useRoomStore.getState().room?.mode;
                  setPlaybackState(message.data, roomMode);
                  const roomCallbacks = ROOM_CALLBACKS.get(roomId);
                  for (const roomCallback of roomCallbacks ?? []) {
                    roomCallback.onPlaybackUpdate?.(message.data);
                  }
                });
                if (error)
                  console.error('Failed to parse playback_update', error);
                break;
              }
              case 'song_added': {
                const [error] = safeWrap(() => {
                  const song = message.data;
                  console.log('[SSE] song_added received:', song);
                  addSong(song);
                  const roomCallbacks = ROOM_CALLBACKS.get(roomId);
                  let hasSongAddedCallback = false;
                  for (const roomCallback of roomCallbacks ?? []) {
                    if (roomCallback.onSongAdded) {
                      hasSongAddedCallback = true;
                      roomCallback.onSongAdded(song);
                    }
                  }
                  if (
                    !hasSongAddedCallback &&
                    typeof window !== 'undefined' &&
                    window.dispatchEvent
                  ) {
                    // Value backward compatibility for now
                    window.dispatchEvent(
                      new CustomEvent('song-added', { detail: song }),
                    );
                  }
                });
                if (error) console.error('Failed to parse song_added', error);
                break;
              }
              case 'settings_update': {
                const [error] = safeWrap(() => {
                  setRoom(message.data);
                  const roomCallbacks = ROOM_CALLBACKS.get(roomId);
                  for (const roomCallback of roomCallbacks ?? []) {
                    roomCallback.onRoomUpdate?.(message.data);
                  }
                });
                if (error)
                  console.error('Failed to parse settings_update', error);
                break;
              }
              case 'users_update': {
                const [error] = safeWrap(() => {
                  setUsersCount(message.data);
                  const roomCallbacks = ROOM_CALLBACKS.get(roomId);
                  for (const roomCallback of roomCallbacks ?? []) {
                    roomCallback.onUsersUpdate?.(message.data);
                  }
                });
                if (error) console.error('Failed to parse users_update', error);
                break;
              }
              case 'skip_vote':
                break;
              case 'generation_update': {
                const roomCallbacks = ROOM_CALLBACKS.get(roomId);
                for (const roomCallback of roomCallbacks ?? []) {
                  roomCallback.onGenerationUpdate?.(message.data);
                }
                break;
              }
              case 'new_host': {
                const [error] = safeWrap(() => {
                  setHost(message.data.userId);
                });
                if (error) {
                  console.error('Failed to parse new_host', error);
                }
                break;
              }
            }
          });
          if (inFlight) IN_FLIGHT_CONNECTIONS.set(roomId, inFlight);
        }

        if (!inFlight) return;
        const [err, unsubscribe] = await inFlight;

        if (IN_FLIGHT_CONNECTIONS.get(roomId) === inFlight) {
          IN_FLIGHT_CONNECTIONS.delete(roomId);
        }

        if (err || !isMounted) {
          if (!isMounted && unsubscribe && !ACTIVE_CONNECTIONS.has(roomId)) {
            connection = { count: 0, unsubscribe };
            ACTIVE_CONNECTIONS.set(roomId, connection);
            scheduleConnectionCleanup(roomId);
          }
          return;
        }

        if (!ACTIVE_CONNECTIONS.has(roomId) && unsubscribe) {
          connection = { count: 0, unsubscribe };
          ACTIVE_CONNECTIONS.set(roomId, connection);
        } else {
          connection = ACTIVE_CONNECTIONS.get(roomId);
        }
      }

      if (connection && isMounted) {
        connection.count++;
        isSubscribedRef.current = true;
      }
    };

    void setupConnection();

    return () => {
      isMounted = false;
      if (isSubscribedRef.current) {
        const connection = ACTIVE_CONNECTIONS.get(roomId);
        if (connection) {
          connection.count--;
          if (connection.count <= 0) {
            scheduleConnectionCleanup(roomId);
          }
        }
        isSubscribedRef.current = false;
      }
    };
  }, [
    roomId,
    addSong,
    setHost,
    setRoom,
    setUsersCount,
    setSongs,
    setPlaybackState,
    client,
  ]);
};
