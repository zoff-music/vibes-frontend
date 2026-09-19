import {
  Button,
  ContentTransition,
  NowPlayingSong,
  PauseIcon,
  PlaybackProgress,
  PlayIcon,
  SkipIcon,
} from '@vibes/ui/web';
import { queueDemoSongs } from '../../../../components/seo/previewSongs';
import { usePlaybackPreview } from '../../hooks/usePlaybackPreview';

interface RoomModeSceneProps {
  hostMode: boolean;
  playing: boolean;
}

export function RoomModeScene({ hostMode, playing }: RoomModeSceneProps) {
  const { state, actions } = usePlaybackPreview(hostMode, playing);
  const song = {
    ...queueDemoSongs[state.track % queueDemoSongs.length],
    duration: state.durationMs / 1000,
  };

  return (
    <div className="min-w-0">
      <ContentTransition transitionKey={state.track}>
        <NowPlayingSong
          song={song}
          isPlaying={state.isPlaying && playing}
          providerLink={false}
          animate={false}
        />
        <div className="mt-3">
          <PlaybackProgress
            durationMs={state.durationMs}
            positionMs={state.position}
          />
        </div>
      </ContentTransition>
      <div className="mt-5 flex min-h-11 items-center gap-2">
        {hostMode && (
          <>
            <Button
              variant="tertiary"
              size="icon"
              onClick={actions.togglePlayback}
              aria-label={
                state.isPlaying
                  ? 'Pause preview playback'
                  : 'Play preview playback'
              }
            >
              {state.isPlaying && (
                <PauseIcon className="h-6 w-6 fill-current" />
              )}
              {!state.isPlaying && (
                <PlayIcon className="ml-0.5 h-6 w-6 fill-current" />
              )}
            </Button>
            <Button
              variant="tertiary"
              size="icon"
              onClick={actions.skip}
              aria-label="Skip preview song"
            >
              <SkipIcon className="h-5 w-5 text-theme-muted" />
            </Button>
          </>
        )}
        {!hostMode && (
          <span className="text-sm text-theme-muted">
            The next song starts automatically.
          </span>
        )}
      </div>
    </div>
  );
}
