import { classNames } from '@vibes/shared';
import {
  ContentTransition,
  GenerationSparkles,
  QueueItem,
  SparklesIcon,
} from '@vibes/ui/web';
import { MotionConfig, motion } from 'framer-motion';
import { queueDemoPlaylistItems, watchDemoPlaylistItems } from './preview';
import { useGeneratedPlaylistPreview } from './useGeneratedPlaylistPreview';

interface GeneratedPlaylistSceneProps {
  prompt: string;
  playing: boolean;
  watch?: boolean;
}

export function GeneratedPlaylistScene({
  prompt,
  playing,
  watch = false,
}: GeneratedPlaylistSceneProps) {
  const { state } = useGeneratedPlaylistPreview(prompt, playing);
  const searching = state.phase === 'searching';
  const typing = state.phase === 'typing';
  const resetting = state.phase === 'resetting';
  const showPlaylist = state.phase === 'arriving' || state.phase === 'ready';
  const titles = prompt.includes('Disco')
    ? ['Kitchen disco', 'After the party', 'One more dance']
    : prompt.includes('focus')
      ? ['Soft edges', 'A little headspace', 'Quiet hours']
      : ['Velvet keys', 'Streetlight swing', 'After the last train'];

  const watchTitles = prompt.includes('solar')
    ? ['A little further out', 'The rings of Saturn', 'Until the stars fade']
    : prompt.includes('films')
      ? ['The last light', 'A different ending', 'Five minutes from home']
      : ['Beyond the city lights', 'Midnight in motion', 'Nowhere to rush'];

  if (!watch) {
    return (
      <MotionConfig reducedMotion="user">
        <div className="pt-5" data-phase={state.phase}>
          <div className="flex min-h-20 items-center gap-3 rounded-2xl border border-theme bg-theme-surface px-4">
            <SparklesIcon
              aria-hidden="true"
              className="size-5 shrink-0 text-primary"
            />
            <p className="h-12 min-w-0 flex-1 text-theme leading-6">
              <span className="sr-only">{prompt}</span>
              <span aria-hidden="true">
                {state.prompt || 'A mood, a genre, an idea…'}
              </span>
            </p>
          </div>
          <div className="flex h-16 items-center justify-between gap-3 text-theme-muted text-xs">
            <span>YOUR STARTING QUEUE</span>
            <span className="w-26 shrink-0">
              {typing
                ? 'Describe the mood'
                : searching
                  ? 'Finding songs…'
                  : 'Make it yours'}
            </span>
          </div>
          <ol
            aria-label="Illustrative generated playlist"
            className="min-h-64 space-y-2"
          >
            {queueDemoPlaylistItems.slice(0, 3).map((item, index) => (
              <motion.li
                key={item.id}
                initial={false}
                animate={{
                  opacity: showPlaylist && index < state.count ? 1 : 0.25,
                  y: showPlaylist && index < state.count ? 0 : 6,
                }}
                transition={{
                  duration: state.reducedMotion ? 0 : 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={classNames(
                  'pointer-events-none',
                  !showPlaylist && 'select-none',
                )}
              >
                <QueueItem
                  playlistItem={{ ...item, title: titles[index] }}
                  position={index + 1}
                  providerLink={false}
                  density="compact"
                />
              </motion.li>
            ))}
          </ol>
          <p className="text-theme-muted text-xs">
            Illustrative songs, not actual AI results.
          </p>
        </div>
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={false}
        animate={{ opacity: resetting ? 0 : 1 }}
        transition={{ duration: state.reducedMotion ? 0 : 0.35 }}
        data-phase={state.phase}
        className="mt-5"
      >
        <div className="rounded-2xl border border-theme bg-theme-surface p-4">
          <p className="mb-3 font-pixel text-theme-muted text-xs">
            {watch ? 'Your Watch idea' : 'Your playlist prompt'}
          </p>
          <div className="flex min-h-12 min-w-0 items-center gap-3">
            <SparklesIcon
              aria-hidden="true"
              className="h-5 w-5 shrink-0 text-primary"
            />
            <p className="min-w-0 text-sm text-theme">
              <span className="sr-only">{prompt}</span>
              <span aria-hidden="true">{state.prompt}</span>
              {typing && (
                <span
                  aria-hidden="true"
                  className="ml-0.5 border-primary border-r-2"
                />
              )}
            </p>
          </div>
        </div>
        <div className="my-5 flex flex-wrap items-center justify-between gap-2 text-theme-muted text-xs">
          <span className="font-pixel">
            {watch ? 'afterhours / preview' : 'electro'}
          </span>
          <span className="w-36 shrink-0 text-right">
            {typing && 'Describe your playlist'}
            {searching &&
              (watch ? 'Imagining the lineup' : 'Generating with AI')}
            {state.phase === 'arriving' &&
              (watch ? 'Building the preview…' : 'Adding songs…')}
            {(state.phase === 'ready' || resetting) &&
              (watch ? 'Example lineup' : 'AI playlist ready')}
          </span>
        </div>
        <ContentTransition
          transitionKey={showPlaylist ? 'playlist' : 'search'}
          className="relative grid min-h-72"
        >
          {!showPlaylist && (
            <div className="col-start-1 row-start-1 flex flex-col items-center justify-center gap-5 rounded-2xl border border-theme bg-theme-surface p-6 text-center">
              <GenerationSparkles active={playing && searching} />
              <motion.p
                key={searching ? 'searching' : 'prompt'}
                initial={{ opacity: state.reducedMotion ? 1 : 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: state.reducedMotion ? 0 : 0.2 }}
                className="w-full font-pixel text-sm text-theme"
              >
                {watch &&
                  (searching
                    ? 'A night of new discoveries…'
                    : 'Start with something you’re curious about.')}
                {!watch &&
                  (searching
                    ? 'Finding your songs…'
                    : 'Start with a mood or a genre.')}
              </motion.p>
            </div>
          )}
          {showPlaylist && (
            <div className="col-start-1 row-start-1 self-start">
              <h3 className="sr-only">
                {watch ? 'Example video lineup' : 'Generated songs'}
              </h3>
              <ol
                aria-label={
                  watch
                    ? 'Illustrative video lineup'
                    : 'AI-generated playlist preview'
                }
                className="space-y-2"
              >
                {(watch ? watchDemoPlaylistItems : queueDemoPlaylistItems)
                  .slice(0, state.count)
                  .map((playlistItem, index) => (
                    <motion.li
                      key={playlistItem.id}
                      initial={{
                        opacity: state.reducedMotion ? 1 : 0,
                        y: state.reducedMotion ? 0 : 12,
                      }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: state.reducedMotion ? 0 : 0.25 }}
                    >
                      <QueueItem
                        playlistItem={{
                          ...playlistItem,
                          title: watch ? watchTitles[index] : titles[index],
                          publisher: watch
                            ? 'Preview film'
                            : playlistItem.publisher,
                        }}
                        position={index + 1}
                        providerLink={false}
                      />
                    </motion.li>
                  ))}
              </ol>
            </div>
          )}
        </ContentTransition>
      </motion.div>
    </MotionConfig>
  );
}
