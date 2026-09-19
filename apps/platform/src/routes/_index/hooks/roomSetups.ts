import type { RoomSettings } from '@vibes/models';

export type RoomSetupSettings = Required<
  Pick<RoomSettings, 'onlyAdminAddSongs' | 'skipAllowed' | 'removeOnPlay'>
>;

export type RoomSetupId = 'adding' | 'skipping' | 'repeating';

interface RoomSetup {
  id: RoomSetupId;
  label: string;
  settings: RoomSetupSettings;
}

export const roomSetups: RoomSetup[] = [
  {
    id: 'adding',
    label: 'Adding',
    settings: {
      onlyAdminAddSongs: false,
      skipAllowed: true,
      removeOnPlay: true,
    },
  },
  {
    id: 'skipping',
    label: 'Skipping',
    settings: {
      onlyAdminAddSongs: true,
      skipAllowed: true,
      removeOnPlay: true,
    },
  },
  {
    id: 'repeating',
    label: 'Repeating',
    settings: {
      onlyAdminAddSongs: false,
      skipAllowed: true,
      removeOnPlay: false,
    },
  },
];
