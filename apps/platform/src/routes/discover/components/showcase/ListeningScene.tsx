import {
  ContentTransition,
  NowPlayingPlaylistItem,
  PlaybackProgress,
} from '@vibes/ui/web';
import { queueDemoPlaylistItems } from '../../../../components/seo/preview';
import { usePlaybackPreview } from '../../hooks/usePlaybackPreview';

interface ListeningSceneProps {
  playing: boolean;
}

export function ListeningScene({ playing }: ListeningSceneProps) {
  const { state } = usePlaybackPreview(false, playing);
  const playlistItem = {
    ...queueDemoPlaylistItems[state.track % queueDemoPlaylistItems.length],
    duration: state.durationMs / 1000,
  };

  return (
    <div className="space-y-4 pt-5">
      {['Your device', 'Their device'].map((label) => (
        <section
          key={label}
          aria-label={label}
          className="rounded-2xl border border-theme bg-theme p-4"
        >
          <div className="mb-4 flex items-center justify-between text-theme-muted text-xs">
            <span>{label}</span>
            <span className="font-pixel text-secondary">electro</span>
          </div>
          <ContentTransition transitionKey={state.track}>
            <NowPlayingPlaylistItem
              playlistItem={playlistItem}
              isPlaying={playing}
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
        </section>
      ))}
      <p className="pt-1 text-center text-sm text-theme-muted">
        Same room. Same song. Same point in the track.
      </p>
    </div>
  );
}
