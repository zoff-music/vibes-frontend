import { SegmentedToggle } from '@vibes/ui/web';
import type {
  RoomSetupId,
  RoomSetupSettings as Settings,
} from '../hooks/roomSetups';

interface RoomSetupSettingsProps {
  setupId: RoomSetupId;
  settings: Settings;
  onChange: (key: keyof Settings, checked: boolean) => void;
}

export function RoomSetupSettings({
  setupId,
  settings,
  onChange,
}: RoomSetupSettingsProps) {
  return (
    <div className="grid gap-x-10 gap-y-6 lg:grid-cols-3">
      {setupId !== 'repeat' && (
        <SegmentedToggle
          label="Admins Only Add"
          description="Only admins add songs"
          variant="plain-full"
          checked={settings.onlyAdminAddSongs}
          onChange={(checked) => onChange('onlyAdminAddSongs', checked)}
        />
      )}
      {setupId === 'curated' && (
        <>
          <SegmentedToggle
            label="Admins Only Skip"
            description="Keep skipping to admins"
            variant="plain-full"
            checked={!settings.skipAllowed}
            onChange={(checked) => onChange('skipAllowed', !checked)}
          />
          <SegmentedToggle
            label="Democratic Skip"
            description="Listeners vote to skip"
            variant="plain-full"
            disabled={!settings.skipAllowed}
            checked={settings.democraticSkip}
            onChange={(checked) => onChange('democraticSkip', checked)}
          />
        </>
      )}
      {setupId === 'repeat' && (
        <SegmentedToggle
          label="Remove Played"
          description="Remove songs after playing"
          variant="plain-full"
          checked={settings.removeOnPlay}
          onChange={(checked) => onChange('removeOnPlay', checked)}
        />
      )}
      {setupId !== 'curated' && (
        <>
          <SegmentedToggle
            label="Playlist Import"
            description="Add playlists from links"
            variant="plain-full"
            checked={settings.playlistImport}
            onChange={(checked) => onChange('playlistImport', checked)}
          />
          <SegmentedToggle
            label="Allow Duplicates"
            description="Add a song more than once"
            variant="plain-full"
            checked={settings.allowDuplicates}
            onChange={(checked) => onChange('allowDuplicates', checked)}
          />
        </>
      )}
    </div>
  );
}
