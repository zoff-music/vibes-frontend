import type { RoomSettingsV2 } from '@vibes/models';

export type RoomSetupSettings = Required<
  Pick<
    RoomSettingsV2,
    'onlyAdminAddPlaylistItems' | 'skipAllowed' | 'removeOnPlay'
  >
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
      onlyAdminAddPlaylistItems: false,
      skipAllowed: true,
      removeOnPlay: true,
    },
  },
  {
    id: 'skipping',
    label: 'Skipping',
    settings: {
      onlyAdminAddPlaylistItems: true,
      skipAllowed: true,
      removeOnPlay: true,
    },
  },
  {
    id: 'repeating',
    label: 'Repeating',
    settings: {
      onlyAdminAddPlaylistItems: false,
      skipAllowed: true,
      removeOnPlay: false,
    },
  },
];
