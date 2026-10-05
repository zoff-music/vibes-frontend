import type { RoomSetupId, RoomSetupSettings } from '../hooks/roomSetups';
import { useRoomSetupScene } from '../hooks/useRoomSetupScene';
import { AddPlaylistItemSetupScene } from './AddScene';
import { RepeatPlaylistItemSetupScene } from './RepeatScene';
import { SkipPlaylistItemSetupScene } from './SkipScene';

interface RoomSetupSceneProps {
  setupId: RoomSetupId;
  settings: RoomSetupSettings;
  active: boolean;
  reducedMotion: boolean;
  onAction: () => void;
}

export function RoomSetupScene({
  setupId,
  settings,
  active,
  reducedMotion,
  onAction,
}: RoomSetupSceneProps) {
  const { state, actions } = useRoomSetupScene({
    setupId,
    settings,
    active,
    reducedMotion,
  });

  function performAction() {
    actions.performAction();
    onAction();
  }

  return (
    <div>
      <div className="min-h-60">
        {setupId === 'adding' && (
          <AddPlaylistItemSetupScene
            complete={state.complete}
            blocked={state.blocked}
            reducedMotion={reducedMotion}
            onAdd={performAction}
          />
        )}
        {setupId === 'skipping' && (
          <SkipPlaylistItemSetupScene
            playlistItem={state.currentPlaylistItem}
            positionMs={state.positionMs}
            canSkip={settings.skipAllowed && !state.changedPlaylistItem}
            changedPlaylistItem={state.changedPlaylistItem}
            isSkipping={
              state.complete && !state.advanced && settings.skipAllowed
            }
            onSkip={performAction}
          />
        )}
        {setupId === 'repeating' && (
          <RepeatPlaylistItemSetupScene
            playlistItem={state.currentPlaylistItem}
            positionMs={state.positionMs}
            advanced={state.advanced}
            removePlayed={settings.removeOnPlay}
            reducedMotion={reducedMotion}
            onFinish={performAction}
          />
        )}
      </div>
      <p
        aria-live={state.requested ? 'polite' : 'off'}
        aria-atomic="true"
        className="mt-3 min-h-12 text-sm text-theme-muted leading-snug"
      >
        {state.caption}
      </p>
    </div>
  );
}
