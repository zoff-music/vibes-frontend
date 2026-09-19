import { GenerationSparkles, QueueItem, SparklesIcon } from '@vibes/ui/web';
import { MotionConfig, motion } from 'framer-motion';
import { queueDemoSongs } from './previewSongs';
import { useGeneratedPlaylistPreview } from './useGeneratedPlaylistPreview';

interface GeneratedPlaylistSceneProps {
  prompt: string;
  playing: boolean;
}

export function GeneratedPlaylistScene({
  prompt,
  playing,
}: GeneratedPlaylistSceneProps) {
  const { state } = useGeneratedPlaylistPreview(prompt, playing);
  const searching = state.phase === 'searching';
  const typing = state.phase === 'typing';

  return (
    <MotionConfig reducedMotion="user">
      <div className="mt-5">
        <div className="rounded-2xl border border-theme bg-theme-surface p-4">
          <p className="mb-3 font-pixel text-theme-muted text-xs">
            Your playlist prompt
          </p>
          <div className="flex min-h-10 min-w-0 items-center gap-3">
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
          <span className="font-pixel">electro</span>
          <span>
            {typing && 'Describe your playlist'}
            {searching && 'Generating with AI'}
            {state.phase === 'arriving' && 'Adding songs…'}
            {state.phase === 'ready' && 'AI playlist ready'}
          </span>
        </div>
        <div className="relative grid min-h-72">
          {(typing || searching) && (
            <div className="col-start-1 row-start-1 flex flex-col items-center justify-center gap-5 rounded-2xl border border-theme bg-theme-surface p-6 text-center">
              <GenerationSparkles active={playing && searching} />
              <p className="font-pixel text-sm text-theme">
                {typing
                  ? 'Start with a mood or a genre.'
                  : 'Finding your songs…'}
              </p>
            </div>
          )}
          <ol
            aria-label="AI-generated playlist preview"
            className="col-start-1 row-start-1 space-y-2 self-start"
          >
            {queueDemoSongs.slice(0, state.count).map((song, index) => (
              <motion.li
                key={song.id}
                initial={{
                  opacity: state.reducedMotion ? 1 : 0,
                  y: state.reducedMotion ? 0 : 12,
                }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: state.reducedMotion ? 0 : 0.25 }}
              >
                <QueueItem
                  song={song}
                  position={index + 1}
                  providerLink={false}
                />
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </MotionConfig>
  );
}
