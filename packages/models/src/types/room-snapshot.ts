import type { PlaybackStateV2 } from '../schemas/playback';
import type { PlaylistItem } from '../schemas/playlist';
import type { RoomV2 } from '../schemas/room';

export interface RoomSnapshot {
  playback: PlaybackStateV2;
  room: RoomV2;
  playlistItems: PlaylistItem[];
}
