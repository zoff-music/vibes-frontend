import type { RoomSettings } from '@vibes/models';

export type RoomSetupSettings = Required<
  Pick<
    RoomSettings,
    | 'onlyAdminAddSongs'
    | 'playlistImport'
    | 'skipAllowed'
    | 'democraticSkip'
    | 'removeOnPlay'
    | 'allowDuplicates'
  >
>;

export type RoomSetupId = 'friends' | 'curated' | 'repeat';

interface RoomSetup {
  id: RoomSetupId;
  label: string;
  settings: RoomSetupSettings;
}

export const roomSetups: RoomSetup[] = [
  {
    id: 'friends',
    label: 'With friends',
    settings: {
      onlyAdminAddSongs: false,
      playlistImport: true,
      skipAllowed: true,
      democraticSkip: true,
      removeOnPlay: true,
      allowDuplicates: false,
    },
  },
  {
    id: 'curated',
    label: 'Your picks',
    settings: {
      onlyAdminAddSongs: true,
      playlistImport: true,
      skipAllowed: false,
      democraticSkip: false,
      removeOnPlay: true,
      allowDuplicates: false,
    },
  },
  {
    id: 'repeat',
    label: 'On repeat',
    settings: {
      onlyAdminAddSongs: false,
      playlistImport: true,
      skipAllowed: true,
      democraticSkip: true,
      removeOnPlay: false,
      allowDuplicates: false,
    },
  },
];
