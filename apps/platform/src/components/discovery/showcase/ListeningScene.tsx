import { classNames } from '@vibes/shared';
import {
  ContentTransition,
  PlaybackProgress,
  VinylRecord,
} from '@vibes/ui/web';
import { usePlaybackPreview } from '../../../hooks/discovery/usePlaybackPreview';
import { queueDemoPlaylistItems } from '../../seo/preview';

interface ListeningSceneProps {
  playing: boolean;
}

export function ListeningScene({ playing }: ListeningSceneProps) {
  const { state } = usePlaybackPreview(false, playing);
  const playlistItem =
    queueDemoPlaylistItems[state.track % queueDemoPlaylistItems.length];

  return (
    <div className="px-3 pt-3 sm:px-5">
      <div className="relative flex h-64 items-center justify-center sm:h-72">
        <div
          aria-hidden="true"
          className="border-secondary/20 pointer-events-none absolute size-64 rounded-full border sm:size-72"
        />
        <div
          aria-hidden="true"
          className="border-primary/20 pointer-events-none absolute size-52 rounded-full border sm:size-60"
        />
        <VinylRecord
          artworkUrl={playlistItem.thumbnailUrl}
          playing={playing}
          className="size-44 sm:size-52"
        />
        <div
          aria-hidden="true"
          className="bg-secondary/40 absolute bottom-0 left-1/2 h-8 w-px"
        />
      </div>
      <div className="relative mb-5 flex h-10 items-center justify-center">
        <span className="border-theme bg-theme text-theme rounded-full border px-4 py-2 text-sm">
          <span className="dark:text-secondary mr-2 text-cyan-800">●</span>
          zoff.me/electro
        </span>
        <div
          aria-hidden="true"
          className="border-theme absolute inset-x-12 top-full h-5 rounded-t-xl border-x border-t"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {['You', 'Mira'].map((label) => (
          <section
            key={label}
            aria-label={`${label} listening`}
            className="border-theme bg-theme relative min-w-0 rounded-2xl border p-3 shadow-lg sm:p-4"
          >
            <p className="text-theme mb-3 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={classNames(
                    'hidden size-7 items-center justify-center rounded-full font-pixel sm:flex',
                    label === 'You'
                      ? 'bg-primary/10 text-pink-800 dark:text-primary'
                      : 'bg-secondary/10 text-cyan-800 dark:text-secondary',
                  )}
                >
                  {label.slice(0, 1)}
                </span>
                {label}
              </span>
              <span className="dark:text-secondary text-xs text-cyan-800">
                In sync
              </span>
            </p>
            <ContentTransition transitionKey={playlistItem.id}>
              <p className="text-theme-muted truncate text-xs">
                {playlistItem.title}
              </p>
            </ContentTransition>
            <div className="mt-3">
              <PlaybackProgress
                durationMs={playlistItem.duration * 1000}
                positionMs={state.position}
              />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
