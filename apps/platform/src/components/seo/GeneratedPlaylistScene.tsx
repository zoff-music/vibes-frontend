import { playlistGenerationMessages } from '@vibes/ui/shared';
import {
  Button,
  GenerationSparkles,
  GenerativeInput,
  QueueItem,
  SparklesIcon,
} from '@vibes/ui/web';
import { AnimatePresence, MotionConfig, m as motion } from 'framer-motion';
import { useRef } from 'preact/compat';
import { queueDemoPlaylistItems, watchDemoPlaylistItems } from './preview';
import { useGeneratedPlaylistPreview } from './useGeneratedPlaylistPreview';

interface GeneratedPlaylistSceneProps {
  prompt: string;
  playing: boolean;
  watch?: boolean;
}

const noop = () => {};

function titlesFor(prompt: string, watch: boolean) {
  if (watch) {
    if (prompt.includes('solar'))
      return [
        'A little further out',
        'The rings of Saturn',
        'Until the stars fade',
      ];

    if (prompt.includes('films'))
      return ['The last light', 'A different ending', 'Five minutes from home'];

    return ['Beyond the city lights', 'Midnight in motion', 'Nowhere to rush'];
  }

  if (prompt.includes('Disco'))
    return ['Kitchen disco', 'After the party', 'One more dance'];

  if (prompt.includes('focus'))
    return ['Soft edges', 'A little headspace', 'Quiet hours'];

  return ['Velvet keys', 'Streetlight swing', 'After the last train'];
}

// The Add dialog in AI mode, then the queue filling in.
export function GeneratedPlaylistScene({
  prompt,
  playing,
  watch = false,
}: GeneratedPlaylistSceneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { state } = useGeneratedPlaylistPreview(prompt, playing);
  const generating = state.phase === 'searching';
  const filling = state.phase === 'arriving' || state.phase === 'ready';
  const titles = titlesFor(prompt, watch);
  const source = watch ? watchDemoPlaylistItems : queueDemoPlaylistItems;
  const message =
    playlistGenerationMessages[
      prompt.length % playlistGenerationMessages.length
    ];

  return (
    <MotionConfig reducedMotion="user">
      <div data-phase={state.phase} className="@container mt-4">
        <div inert aria-hidden="true" className="flex gap-2">
          <div className="min-w-0 flex-1">
            <GenerativeInput
              active
              enabled
              showToggle
              disabled={false}
              hideLabel
              label="Playlist description"
              inputRef={inputRef}
              value={state.prompt}
              placeholder={
                watch
                  ? 'A trip through the solar system'
                  : 'Late-night synthwave for a rainy drive'
              }
              onChange={noop}
              onToggle={noop}
              onSubmit={noop}
            />
          </div>
          <Button
            variant="primary"
            className="h-14 w-14 shrink-0 gap-2 px-0! @lg:w-40 @lg:px-5!"
            aria-busy={generating}
          >
            {!generating && <SparklesIcon className="h-5 w-5" />}
            {generating && (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            )}
            <span className="sr-only whitespace-nowrap @lg:not-sr-only">
              {generating ? 'Generating…' : 'Generate'}
            </span>
          </Button>
        </div>
        <p className="sr-only">{prompt}</p>

        <div className="relative mt-4 h-60">
          <AnimatePresence initial={false} mode="wait">
            {!filling && (
              <motion.div
                key="progress"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: generating ? 1 : 0.55, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: state.reducedMotion ? 0 : 0.3 }}
                className="border-secondary/60 bg-theme-surface relative isolate flex h-full flex-col items-center justify-center gap-4 rounded-3xl border p-6 text-center"
              >
                {generating && (
                  <span
                    aria-hidden="true"
                    className="shadow-secondary-progress pointer-events-none absolute inset-0 -z-10 rounded-3xl motion-safe:animate-pulse"
                  />
                )}
                <GenerationSparkles active={playing && generating} />
                <p className="font-pixel text-theme text-sm sm:text-base">
                  {generating
                    ? message
                    : 'Describe a mood, a genre or an idea.'}
                </p>
              </motion.div>
            )}
            {filling && (
              <motion.ol
                key="queue"
                aria-label={
                  watch
                    ? 'Illustrative video lineup'
                    : 'Illustrative generated playlist'
                }
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: state.reducedMotion ? 0 : 0.25 }}
                className="flex flex-col gap-2"
              >
                {source.slice(0, state.count).map((playlistItem, index) => (
                  <motion.li
                    key={playlistItem.id}
                    initial={{
                      opacity: state.reducedMotion ? 1 : 0,
                      y: state.reducedMotion ? 0 : 14,
                    }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: state.reducedMotion ? 0 : 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="pointer-events-none"
                  >
                    <QueueItem
                      playlistItem={{
                        ...playlistItem,
                        title: titles[index],
                        ...(watch && { publisher: 'Preview film' }),
                      }}
                      position={index + 1}
                      providerLink={false}
                      density="compact"
                    />
                  </motion.li>
                ))}
              </motion.ol>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
}
