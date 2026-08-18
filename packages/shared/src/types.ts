import {
  AddSongOutcome,
  AddSongResponse,
  PlaybackState,
  Room,
  RoomSettings,
  RoomUpdate,
  Song,
  SourceType,
} from '@vibes/models';

export type {
  AddSongOutcome,
  AddSongResponse,
  PlaybackState,
  Room,
  RoomSettings,
  RoomUpdate,
  Song,
  SourceType,
};

export type ColorScheme = 'auto' | 'light' | 'dark';

export type ResolvedColorScheme = Exclude<ColorScheme, 'auto'>;

type DefaultRoomSettings = Omit<RoomSettings, 'onlyAdminAddSongs'> & {
  onlyAdminAddSongs: boolean;
};

export const DEFAULT_ROOM_SETTINGS: DefaultRoomSettings = {
  skipAllowed: true,
  democraticSkip: true,
  skipVoteThreshold: 0.5,
  maxContinuousAdds: 3,
  removeOnPlay: false,
  loopQueue: true,
  allowDuplicates: false,
  enabledSources: ['youtube', 'soundcloud'],
  onlyAdminAddSongs: false,
  public: false,
};
