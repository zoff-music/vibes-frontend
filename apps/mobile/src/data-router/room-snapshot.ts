import type { PlaybackStateV2, PlaylistItem, RoomV2 } from '@vibes/models';

export interface RoomSnapshot {
  playback: PlaybackStateV2;
  room: RoomV2;
  playlistItems: PlaylistItem[];
}
