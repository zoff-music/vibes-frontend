import type { RoomSetupId, RoomSetupSettings } from '../hooks/roomSetups';
import { useRoomSetupScene } from '../hooks/useRoomSetupScene';
import { AddSongSetupScene } from './AddSongSetupScene';
import { RepeatSongSetupScene } from './RepeatSongSetupScene';
import { SkipSongSetupScene } from './SkipSongSetupScene';

interface RoomSetupSceneProps {
  setupId: RoomSetupId;
  settings: RoomSetupSettings;
  active: boolean;
  reducedMotion: boolean;
  announce: boolean;
  onAction: () => void;
}

export function RoomSetupScene({
  setupId,
  settings,
  active,
  reducedMotion,
  announce,
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
      <div className="min-h-48">
        {setupId === 'adding' && (
          <AddSongSetupScene
            complete={state.complete}
            blocked={state.blocked}
            reducedMotion={reducedMotion}
            onAdd={performAction}
          />
        )}
        {setupId === 'skipping' && (
          <SkipSongSetupScene
            song={state.currentSong}
            positionMs={state.positionMs}
            canSkip={settings.skipAllowed && !state.changedSong}
            changedSong={state.changedSong}
            isSkipping={
              state.complete && !state.advanced && settings.skipAllowed
            }
            onSkip={performAction}
          />
        )}
        {setupId === 'repeating' && (
          <RepeatSongSetupScene
            song={state.currentSong}
            positionMs={state.positionMs}
            advanced={state.advanced}
            removePlayed={settings.removeOnPlay}
            reducedMotion={reducedMotion}
            onFinish={performAction}
          />
        )}
      </div>
      <p
        aria-live={announce ? 'polite' : 'off'}
        aria-atomic="true"
        className="mt-2 flex min-h-12 items-center pr-22 text-sm text-theme-muted leading-snug"
      >
        {state.caption}
      </p>
    </div>
  );
}
