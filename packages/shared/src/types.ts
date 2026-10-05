import {
  AddPlaylistItemOutcome,
  AddPlaylistItemResponse,
  PlaybackStateV2,
  PlaylistItem,
  RoomSettingsV2,
  RoomUpdateV2,
  RoomV2,
  SourceType,
} from '@vibes/models';

export type {
  AddPlaylistItemOutcome,
  AddPlaylistItemResponse,
  PlaybackStateV2,
  PlaylistItem,
  RoomSettingsV2,
  RoomUpdateV2,
  RoomV2,
  SourceType,
};

export type ColorScheme = 'auto' | 'light' | 'dark';

export type ResolvedColorScheme = Exclude<ColorScheme, 'auto'>;

type DefaultRoomSettings = Omit<RoomSettingsV2, 'onlyAdminAddPlaylistItems'> & {
  onlyAdminAddPlaylistItems: boolean;
};

export const DEFAULT_ROOM_SETTINGS: DefaultRoomSettings = {
  skipAllowed: true,
  democraticSkip: true,
  skipVoteThreshold: 0.5,
  maxContinuousAdds: 3,
  removeOnPlay: false,
  allowDuplicates: false,
  enabledSources: ['youtube', 'soundcloud'],
  onlyAdminAddPlaylistItems: false,
  public: false,
  playlistImport: true,
};
