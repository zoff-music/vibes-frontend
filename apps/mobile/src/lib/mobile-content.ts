import type {
  PlaybackState,
  Providers,
  Room,
  Song,
  SourceType,
} from '@vibes/models';
import type { RoomSnapshot } from '@/data-router/room-snapshot';

export const mobileProviders: Providers = ['youtube', 'soundcloud'];

export function isMobileProvider(source: SourceType) {
  return mobileProviders.includes(source);
}

export function filterMobileProviders(providers: Providers): Providers {
  return providers.filter(isMobileProvider);
}

export function filterMobileSongs(songs: Song[]) {
  return songs.filter((song) => isMobileProvider(song.sourceType));
}

export function positionMobileSong(
  songs: Song[],
  song: Song,
  position: number,
): Song[] {
  const nextSongs = songs.filter((item) => item.id !== song.id);
  if (!isMobileProvider(song.sourceType)) return nextSongs;

  const boundedPosition = Math.min(Math.max(position, 0), nextSongs.length);
  nextSongs.splice(boundedPosition, 0, song);

  return nextSongs;
}

export function normalizeMobilePlayback(
  playback: PlaybackState,
): PlaybackState {
  if (
    !playback.currentSong ||
    isMobileProvider(playback.currentSong.sourceType)
  ) {
    return playback;
  }
  return { ...playback, currentSong: null, isPlaying: false, positionMs: 0 };
}

export function normalizeMobileRoom(room: Room): Room {
  return {
    ...room,
    settings: {
      ...room.settings,
      enabledSources: filterMobileProviders(room.settings.enabledSources),
    },
  };
}

export function normalizeMobileSnapshot(snapshot: RoomSnapshot): RoomSnapshot {
  return {
    playback: normalizeMobilePlayback(snapshot.playback),
    room: normalizeMobileRoom(snapshot.room),
    songs: filterMobileSongs(snapshot.songs),
  };
}
