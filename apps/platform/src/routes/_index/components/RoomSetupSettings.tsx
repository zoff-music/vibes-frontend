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
    <div className="min-w-0">
      {setupId === 'adding' && (
        <SegmentedToggle
          label="Admins Only Add"
          description="Who can add songs?"
          variant="plain-full"
          checked={settings.onlyAdminAddSongs}
          onChange={(checked) => onChange('onlyAdminAddSongs', checked)}
        />
      )}
      {setupId === 'skipping' && (
        <SegmentedToggle
          label="Admins Only Skip"
          description="Who controls the next song?"
          variant="plain-full"
          checked={!settings.skipAllowed}
          onChange={(checked) => onChange('skipAllowed', !checked)}
        />
      )}
      {setupId === 'repeating' && (
        <SegmentedToggle
          label="Remove Played"
          description="Play once, or keep the song?"
          variant="plain-full"
          checked={settings.removeOnPlay}
          onChange={(checked) => onChange('removeOnPlay', checked)}
        />
      )}
    </div>
  );
}
