import { classNames } from '@vibes/shared';
import { ContentTransition, PlaybackProgress } from '@vibes/ui/web';
import { queueDemoPlaylistItems } from '../../../../components/seo/preview';
import { usePlaybackPreview } from '../../hooks/usePlaybackPreview';

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
        <div
          className={classNames(
            'relative flex size-44 items-center justify-center rounded-full border border-white/15 bg-[repeating-radial-gradient(circle,#21192d_0px,#21192d_2px,#100b18_3px,#100b18_7px)] shadow-2xl motion-safe:animate-[spin_24s_linear_infinite] sm:size-52',
            !playing && 'motion-safe:[animation-play-state:paused]',
          )}
        >
          <img
            src={playlistItem.thumbnailUrl}
            width={100}
            height={100}
            alt="Illustrative record artwork"
            className="size-22 rounded-full border-4 border-[#100b18] sm:size-26"
          />
          <span
            aria-hidden="true"
            className="absolute size-2 rounded-full border border-white/30 bg-[#100b18]"
          />
        </div>
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
