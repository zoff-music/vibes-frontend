import type { PlaybackState, Room, Song } from '@vibes/models';

export interface RoomSnapshot {
  playback: PlaybackState;
  room: Room;
  songs: Song[];
}
