import type { RoomSnapshot } from '@vibes/models';
import {
  synchronizeServerClock,
  usePlaybackStore,
  useQueueStore,
  useRoomStore,
} from '@vibes/shared';

export function applyRoomSnapshot(snapshot: RoomSnapshot) {
  useRoomStore.getState().setRoom(snapshot.room);
  useQueueStore.getState().setPlaylistItems(snapshot.playlistItems);
  synchronizeServerClock(snapshot.playback.serverTimeMs);
  usePlaybackStore
    .getState()
    .resetPlaybackState(snapshot.playback, snapshot.room.mode);
}
