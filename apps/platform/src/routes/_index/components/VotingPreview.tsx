import {
  Button,
  PauseIcon,
  PlayIcon,
  QueueItem,
  ResetIcon,
} from '@vibes/ui/web';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { useQueueDemo } from '../hooks/useQueueDemo';

export function VotingPreview() {
  const { state, actions } = useQueueDemo();
  const branding = state.phase >= 5;
  let caption = 'Vote for a song to move it up the queue.';
  if (state.phase === 1) caption = 'Voting for Song title 02…';
  if (state.phase === 2) caption = 'Vote added. Queue updated.';
  if (state.phase === 3) caption = 'Adding Song title 04…';
  if (state.phase === 4) caption = 'Song title 04 added to the queue.';
  if (branding) caption = '';

  return (
    <MotionConfig reducedMotion="user">
      <figure
        ref={state.ref}
        aria-label="Interactive preview of the electro queue"
        data-playing={state.playing}
        data-phase={state.phase}
        className="w-full min-w-0"
      >
        <div className="mb-5 flex items-center justify-between gap-3 px-1">
          <span className="font-pixel text-theme-muted text-xs tracking-widest">
            ELECTRO
          </span>
          <div className="flex gap-2">
            <Button
              variant="tertiary"
              size="icon"
              onClick={actions.replay}
              aria-label="Restart queue preview"
            >
              <ResetIcon aria-hidden="true" className="h-4 w-4" />
            </Button>
            <Button
              variant="tertiary"
              size="icon"
              onClick={state.paused ? actions.replay : actions.pause}
              disabled={state.reduceMotion === true}
              aria-label={
                state.paused ? 'Play queue preview' : 'Pause queue preview'
              }
            >
              {state.paused && (
                <PlayIcon aria-hidden="true" className="h-4 w-4" />
              )}
              {!state.paused && (
                <PauseIcon aria-hidden="true" className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="relative grid h-108 place-items-center sm:h-116">
          <motion.div
            initial={false}
            animate={{
              width: branding ? 176 : '100%',
              height: branding ? 176 : '100%',
              borderRadius: branding ? 88 : 24,
            }}
            transition={{
              duration: state.reduceMotion ? 0 : 0.65,
              ease: [0.22, 1, 0.36, 1],
            }}
            aria-hidden={branding}
            inert={branding}
            className="relative col-start-1 row-start-1 overflow-hidden border border-theme bg-theme-surface p-3 sm:p-6"
          >
            <motion.div
              animate={{ opacity: branding ? 0 : 1 }}
              transition={{ duration: 0.15, delay: branding ? 0 : 0.4 }}
            >
              <h3 className="mb-4 font-display text-2xs text-theme-muted tracking-label">
                Up Next ({state.songs.length})
              </h3>
              <ol
                aria-label="Preview queue"
                onFocusCapture={actions.pause}
                className="space-y-2"
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {state.songs.map((song, index) => (
                    <motion.li
                      key={song.id}
                      layout="position"
                      initial={{ opacity: 0, y: 20, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{
                        type: 'spring',
                        stiffness: 240,
                        damping: 28,
                        opacity: { duration: 0.25 },
                      }}
                      className="relative"
                    >
                      <QueueItem
                        song={song}
                        providerLink={false}
                        position={index + 1}
                        onVote={actions.vote}
                        isVoting={state.votingSongId === song.id}
                      />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ol>
            </motion.div>
          </motion.div>
          <motion.div
            aria-hidden="true"
            initial={false}
            animate={{ opacity: branding ? 1 : 0, scale: branding ? 1 : 0.5 }}
            transition={{
              duration: state.reduceMotion ? 0 : 0.65,
              delay: branding ? 0.2 : 0,
            }}
            className="pointer-events-none z-10 col-start-1 row-start-1 flex items-center justify-center"
          >
            <img
              src="/logo.png"
              width={1024}
              height={1024}
              alt=""
              className="h-36 w-36 rounded-full"
            />
          </motion.div>
        </div>
        <figcaption className="mt-4 min-h-12 text-center text-sm text-theme-muted">
          <span aria-hidden="true" className="block">
            {state.announcement || caption}
          </span>
        </figcaption>
        <p role="status" className="sr-only">
          {state.announcement}
        </p>
      </figure>
    </MotionConfig>
  );
}
