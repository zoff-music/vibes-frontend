import {
  ControlGroup,
  IconButton,
  NowPlayingPlaylistItem,
  PauseIcon,
  PlaybackProgress,
  PlayIcon,
  SkipIcon,
} from '@vibes/ui/web';
import { usePlaybackPreview } from '../../../hooks/discovery/usePlaybackPreview';
import {
  queueDemoPlaylistItems,
  watchDemoPlaylistItems,
} from '../../seo/preview';

interface RoomModeSceneProps {
  hostMode: boolean;
  playing: boolean;
  watch?: boolean;
}

export function RoomModeScene({
  hostMode,
  playing,
  watch = false,
}: RoomModeSceneProps) {
  const { state, actions } = usePlaybackPreview(hostMode, playing);
  const source = watch ? watchDemoPlaylistItems : queueDemoPlaylistItems;
  const playlistItem = {
    ...source[state.track % source.length],
    duration: state.durationMs / 1000,
  };

  return (
    <div className="min-w-0">
      <NowPlayingPlaylistItem
        playlistItem={playlistItem}
        isPlaying={state.isPlaying}
        providerLink={false}
        isHost={hostMode}
      />
      <div className="mt-3">
        <PlaybackProgress
          durationMs={state.durationMs}
          positionMs={state.position}
        />
      </div>
      <div className="mt-4 min-h-14">
        {hostMode && (
          <ControlGroup aria-label="Host playback controls" className="w-fit">
            <IconButton
              variant="ghost"
              onClick={actions.togglePlayback}
              aria-label={
                state.isPlaying
                  ? 'Pause preview playback'
                  : 'Play preview playback'
              }
              className="active:scale-95"
            >
              {state.isPlaying && (
                <PauseIcon className="h-6 w-6 fill-current" />
              )}
              {!state.isPlaying && (
                <PlayIcon className="ml-0.5 h-6 w-6 fill-current" />
              )}
            </IconButton>
            <IconButton
              variant="ghost"
              onClick={actions.skip}
              aria-label="Skip preview song"
            >
              <SkipIcon className="h-5 w-5" />
            </IconButton>
          </ControlGroup>
        )}
        {!hostMode && (
          <p className="text-theme-muted flex min-h-14 items-center text-sm">
            No one has to press play. The next {watch ? 'video' : 'song'} starts
            automatically.
          </p>
        )}
      </div>
    </div>
  );
}
