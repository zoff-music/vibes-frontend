import type {
  PlaybackStateV2,
  PlaylistItem,
  Providers,
  RoomV2,
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

export function filterMobilePlaylistItems(playlistItems: PlaylistItem[]) {
  return playlistItems.filter((playlistItem) =>
    isMobileProvider(playlistItem.sourceType),
  );
}

export function positionMobilePlaylistItem(
  playlistItems: PlaylistItem[],
  playlistItem: PlaylistItem,
  position: number,
): PlaylistItem[] {
  const nextPlaylistItems = playlistItems.filter(
    (item) => item.id !== playlistItem.id,
  );
  if (!isMobileProvider(playlistItem.sourceType)) return nextPlaylistItems;

  const boundedPosition = Math.min(
    Math.max(position, 0),
    nextPlaylistItems.length,
  );
  nextPlaylistItems.splice(boundedPosition, 0, playlistItem);

  return nextPlaylistItems;
}

export function normalizeMobilePlayback(
  playback: PlaybackStateV2,
): PlaybackStateV2 {
  if (
    !playback.currentPlaylistItem ||
    isMobileProvider(playback.currentPlaylistItem.sourceType)
  ) {
    return playback;
  }
  return {
    ...playback,
    currentPlaylistItem: null,
    isPlaying: false,
    positionMs: 0,
  };
}

export function normalizeMobileRoom(room: RoomV2): RoomV2 {
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
    playlistItems: filterMobilePlaylistItems(snapshot.playlistItems),
  };
}
