import { useRoomEventsV3 } from '@vibes/api';
import {
  type PlaybackStateV2,
  type PlaylistItem,
  type PlaylistItemIdUpdate,
  type PlaylistItemPositionUpdate,
  type RoomGenerationUpdate,
  type RoomHostUpdate,
  type RoomV2,
} from '@vibes/models';
import {
  synchronizeServerClock,
  usePlaybackStore,
  useQueueStore,
  useRoomStore,
} from '@vibes/shared';
import { useMemo } from 'react';
import { tvApiV3 } from '@/lib/api';

export function useTvRoomEvents(roomId: string) {
  const callbacks = useMemo(
    () => ({
      onConnected: synchronizeServerClock,
      onGenerationUpdate: (update: RoomGenerationUpdate) => {
        const room = useRoomStore.getState().room;

        if (!room) return;

        useRoomStore.getState().setRoom({
          ...room,
          generationError:
            update.status === 'failed'
              ? (update.error ?? 'Playlist generation could not be completed.')
              : undefined,
          isGenerating: update.status === 'generating',
        });
      },
      onHostUpdate: ({ userId }: RoomHostUpdate) => {
        useRoomStore.getState().setHost(userId);
      },
      onPlaybackUpdate: (playback: PlaybackStateV2) => {
        synchronizeServerClock(playback.serverTimeMs);
        const roomMode = useRoomStore.getState().room?.mode;
        usePlaybackStore.getState().setPlaybackState(playback, roomMode);
      },
      onRoomUpdate: (room: RoomV2) => {
        useRoomStore.getState().setRoom(room);
      },
      onPlaylistItemAdded: (playlistItem: PlaylistItem) => {
        useQueueStore.getState().addPlaylistItem(playlistItem);
      },
      onPlaylistItemRemoved: ({ id }: PlaylistItemIdUpdate) => {
        useQueueStore.getState().removePlaylistItem(id);
      },
      onPlaylistItemUpdated: ({
        playlistItem,
        position,
      }: PlaylistItemPositionUpdate) => {
        useQueueStore.getState().positionPlaylistItem(playlistItem, position);
      },
      onPlaylistItemsUpdate: (playlistItems: PlaylistItem[]) => {
        useQueueStore.getState().setPlaylistItems(playlistItems);
      },
      onUsersUpdate: (count: number) => {
        useRoomStore.getState().setUsersCount(count);
      },
    }),
    [],
  );
  useRoomEventsV3(roomId || undefined, callbacks, tvApiV3);
}
