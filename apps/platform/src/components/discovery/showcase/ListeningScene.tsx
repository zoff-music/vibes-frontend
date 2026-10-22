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
          className="pointer-events-none absolute size-64 rounded-full border border-secondary/20 sm:size-72"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute size-52 rounded-full border border-primary/20 sm:size-60"
        />
        <VinylRecord
          artworkUrl={playlistItem.thumbnailUrl}
          playing={playing}
          className="size-44 sm:size-52"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-1/2 h-8 w-px bg-secondary/40"
        />
      </div>
      <div className="relative mb-5 flex h-10 items-center justify-center">
        <span className="rounded-full border border-theme bg-theme px-4 py-2 text-sm text-theme">
          <span className="mr-2 text-cyan-800 dark:text-secondary">●</span>
          zoff.me/electro
        </span>
        <div
          aria-hidden="true"
          className="absolute inset-x-12 top-full h-5 rounded-t-xl border-theme border-x border-t"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {['You', 'Mira'].map((label) => (
          <section
            key={label}
            aria-label={`${label} listening`}
            className="relative min-w-0 rounded-2xl border border-theme bg-theme p-3 shadow-lg sm:p-4"
          >
            <p className="mb-3 flex items-center justify-between text-sm text-theme">
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
              <span className="text-cyan-800 text-xs dark:text-secondary">
                In sync
              </span>
            </p>
            <ContentTransition transitionKey={playlistItem.id}>
              <p className="truncate text-theme-muted text-xs">
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
