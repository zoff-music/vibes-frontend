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
