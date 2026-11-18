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

// Every example starts from a new room's defaults and changes one rule.
const defaults: RoomSetupSettings = {
  onlyAdminAddPlaylistItems: false,
  skipAllowed: true,
  removeOnPlay: false,
};

export const roomSetups: RoomSetup[] = [
  {
    id: 'adding',
    label: 'Adding',
    settings: defaults,
  },
  {
    id: 'skipping',
    label: 'Skipping',
    settings: defaults,
  },
  {
    id: 'repeating',
    label: 'Repeating',
    settings: defaults,
  },
];
