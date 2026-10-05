import {
  createApiV3Client,
  type RoomSSEV3Message,
  subscribeRoomEventsV3,
} from '@vibes/api';
import type { PlaylistItem } from '@vibes/models';
import { synchronizeServerClock, usePlaybackStore } from '@vibes/shared';
import { useEffect } from 'react';
import type { CastRoomSnapshot } from '../routes/cast/loader';
import type { QueueItem, RoomInfo } from '../types';
import { normalizePlaylistItem } from '../utils/item';

interface UseRoomSyncProps {
  roomId: string | null;
  casterId: string | null;
  castToken: string | null;
  loadError: string | null;
  snapshot: CastRoomSnapshot | null;
  setQueue: React.Dispatch<React.SetStateAction<QueueItem[]>>;
  setRoomInfo: React.Dispatch<React.SetStateAction<RoomInfo | null>>;
  setStatusText: (text: string) => void;
  setRoomMode: (mode: string | null) => void;
  setError: (err: string | null) => void;
  setEnabledProviders: (providers: string[]) => void;
  updateMediaMetadata: (playlistItem: PlaylistItem) => void;
}

export function useRoomSync({
  roomId,
  casterId,
  castToken,
  loadError,
  snapshot,
  setQueue,
  setRoomInfo,
  setStatusText,
  setRoomMode,
  setError,
  setEnabledProviders,
  updateMediaMetadata,
}: UseRoomSyncProps) {
  const setPlaybackState = usePlaybackStore((state) => state.setPlaybackState);
  const setIsPlaying = usePlaybackStore((state) => state.setIsPlaying);

  useEffect(() => {
    if (loadError) {
      setError(loadError);
      setStatusText('Could not load the room. Waiting for updates…');
      return;
    }
    if (!snapshot) return;

    setError(null);
    setRoomInfo({
      name: snapshot.room.name,
      participantCount: snapshot.room.userCount ?? 0,
    });
    setRoomMode(snapshot.room.mode);
    setEnabledProviders(snapshot.providers);
    setQueue(
      snapshot.playlistItems.map((playlistItem) =>
        normalizePlaylistItem(playlistItem),
      ),
    );

    if (!snapshot.playback.currentPlaylistItem) return;
    synchronizeServerClock(snapshot.playback.serverTimeMs);
    const normalizedPlaylistItem = normalizePlaylistItem(
      snapshot.playback.currentPlaylistItem,
    );
    setPlaybackState({
      ...snapshot.playback,
      currentPlaylistItem: normalizedPlaylistItem,
    });
    setIsPlaying(snapshot.playback.isPlaying);
    setStatusText(`Now Playing: ${normalizedPlaylistItem.title}`);
    updateMediaMetadata(normalizedPlaylistItem);
  }, [
    loadError,
    setEnabledProviders,
    setError,
    setIsPlaying,
    setPlaybackState,
    setQueue,
    setRoomInfo,
    setRoomMode,
    setStatusText,
    snapshot,
    updateMediaMetadata,
  ]);

  useEffect(() => {
    if (!roomId || !castToken) return;

    const api = createApiV3Client({ Authorization: `Bearer ${castToken}` });
    const availableProviders = snapshot?.providers ?? [];
    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    const connect = async () => {
      const [err, stop] = await subscribeRoomEventsV3(
        api,
        roomId,
        (result) => {
          const [eventError, message] = result;
          if (eventError) {
            // connection error
            return;
          }
          if (!message || !isMounted) return;

          const typedMessage: RoomSSEV3Message = message;

          switch (typedMessage.type) {
            case 'connected':
              synchronizeServerClock(typedMessage.data.time);
              setStatusText(`Connected to ${roomId}`);
              break;
            case 'playback_update': {
              const data = typedMessage.data;
              const normalizedPlaylistItem = data.currentPlaylistItem
                ? normalizePlaylistItem(data.currentPlaylistItem)
                : null;

              setPlaybackState({
                ...data,
                currentPlaylistItem: normalizedPlaylistItem,
              });

              if (normalizedPlaylistItem) {
                updateMediaMetadata(normalizedPlaylistItem);
                setStatusText(`Now Playing: ${normalizedPlaylistItem.title}`);
              } else {
                setStatusText('Ready for Casting');
              }

              setIsPlaying(data.isPlaying);
              break;
            }
            case 'playlist_items_snapshot':
              if (Array.isArray(typedMessage.data)) {
                const normalizedQueue = typedMessage.data.map((s) =>
                  normalizePlaylistItem(s),
                );
                setQueue(normalizedQueue);
              }
              break;
            case 'playlist_item_added': {
              const playlistItem = normalizePlaylistItem(typedMessage.data);
              setQueue((current) => {
                if (current.some((item) => item.id === playlistItem.id))
                  return current;
                return [...current, playlistItem];
              });
              break;
            }
            case 'playlist_item_updated': {
              const playlistItem = normalizePlaylistItem(
                typedMessage.data.playlistItem,
              );
              setQueue((current) => {
                const queue = current.filter(
                  (item) => item.id !== playlistItem.id,
                );
                const position = Math.min(
                  Math.max(typedMessage.data.position, 0),
                  queue.length,
                );
                queue.splice(position, 0, playlistItem);
                return queue;
              });
              break;
            }
            case 'playlist_item_removed':
              setQueue((current) =>
                current.filter((item) => item.id !== typedMessage.data.id),
              );
              break;
            case 'settings_update':
              setRoomMode(typedMessage.data.mode);
              setEnabledProviders(
                availableProviders.filter((provider) =>
                  typedMessage.data.settings.enabledSources.includes(provider),
                ),
              );
              setRoomInfo((current) => ({
                name: typedMessage.data.name,
                participantCount: current?.participantCount ?? 0,
              }));
              break;
            case 'users_update':
              setRoomInfo((current) => ({
                name: current?.name || roomId,
                participantCount: typedMessage.data,
              }));
              break;
          }
        },
        `cast:${casterId ?? 'receiver'}`,
      );

      if (!isMounted) {
        if (!err && stop) {
          stop();
        }
        return;
      }

      if (!err && stop) {
        unsubscribe = stop;
      }
    };

    void connect();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [
    roomId,
    setQueue,
    setRoomInfo,
    setStatusText,
    setRoomMode,
    updateMediaMetadata,
    setPlaybackState,
    setIsPlaying,
    setEnabledProviders,
    casterId,
    castToken,
    snapshot?.providers,
  ]);
}
