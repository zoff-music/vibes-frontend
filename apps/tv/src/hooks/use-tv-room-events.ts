import { useRoomEventsV2 } from '@vibes/api';
import type {
  PlaybackState,
  Room,
  RoomGenerationUpdate,
  Song,
} from '@vibes/models';
import {
  synchronizeServerClock,
  usePlaybackStore,
  useQueueStore,
  useRoomStore,
} from '@vibes/shared';
import { useMemo } from 'react';
import { tvApiV2 } from '@/lib/api';

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
      onHostUpdate: ({ userId }: { userId: string }) => {
        useRoomStore.getState().setHost(userId);
      },
      onPlaybackUpdate: (playback: PlaybackState) => {
        synchronizeServerClock(playback.serverTimeMs);
        const roomMode = useRoomStore.getState().room?.mode;
        usePlaybackStore.getState().setPlaybackState(playback, roomMode);
      },
      onRoomUpdate: (room: Room) => {
        useRoomStore.getState().setRoom(room);
      },
      onSongAdded: (song: Song) => {
        useQueueStore.getState().addSong(song);
      },
      onSongRemoved: ({ id }: { id: string }) => {
        useQueueStore.getState().removeSong(id);
      },
      onSongUpdated: ({ song, position }: { song: Song; position: number }) => {
        useQueueStore.getState().positionSong(song, position);
      },
      onSongsUpdate: (songs: Song[]) => {
        useQueueStore.getState().setSongs(songs);
      },
      onUsersUpdate: (count: number) => {
        useRoomStore.getState().setUsersCount(count);
      },
    }),
    [],
  );
  useRoomEventsV2(roomId || undefined, callbacks, tvApiV2);
}
