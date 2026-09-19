import { classNames } from '@vibes/shared';
import { ContentTransition } from '@vibes/ui/web';
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
}

export function RoomSetupScene({
  setupId,
  settings,
  active,
  reducedMotion,
  announce,
}: RoomSetupSceneProps) {
  const { state, actions } = useRoomSetupScene({
    setupId,
    settings,
    active,
    reducedMotion,
  });

  return (
    <div>
      <div className="flex min-h-84 flex-col justify-center sm:min-h-64">
        {setupId === 'adding' && (
          <AddSongSetupScene
            complete={state.complete}
            blocked={state.blocked}
            reducedMotion={reducedMotion}
            onAdd={actions.performAction}
          />
        )}
        {setupId === 'skipping' && (
          <SkipSongSetupScene
            song={state.currentSong}
            positionMs={state.positionMs}
            canSkip={settings.skipAllowed}
            changedSong={state.changedSong}
            isSkipping={
              state.complete && !state.advanced && settings.skipAllowed
            }
            onSkip={actions.performAction}
          />
        )}
        {setupId === 'repeating' && (
          <RepeatSongSetupScene
            song={state.currentSong}
            positionMs={state.positionMs}
            advanced={state.advanced}
            removePlayed={settings.removeOnPlay}
            reducedMotion={reducedMotion}
            onFinish={actions.performAction}
          />
        )}
      </div>
      <ContentTransition
        transitionKey={state.caption}
        className="mt-4 min-h-12"
      >
        <p
          className={classNames(
            'text-sm leading-relaxed',
            state.blocked ? 'text-theme' : 'text-theme-muted',
          )}
        >
          {state.caption}
        </p>
      </ContentTransition>
      {announce && (
        <p role="status" className="sr-only">
          {state.complete && state.caption}
        </p>
      )}
    </div>
  );
}
