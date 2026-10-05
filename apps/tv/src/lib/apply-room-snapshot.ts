import {
  synchronizeServerClock,
  usePlaybackStore,
  useQueueStore,
  useRoomStore,
} from '@vibes/shared';
import type { RoomSnapshot } from '@/data-router/room-snapshot';

export function applyRoomSnapshot(snapshot: RoomSnapshot) {
  useRoomStore.getState().setRoom(snapshot.room);
  useQueueStore.getState().setPlaylistItems(snapshot.playlistItems);
  synchronizeServerClock(snapshot.playback.serverTimeMs);
  usePlaybackStore
    .getState()
    .resetPlaybackState(snapshot.playback, snapshot.room.mode);
}
