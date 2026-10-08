import { classNames } from '@vibes/shared';
import {
  ContentTransition,
  NowPlayingPlaylistItem,
  QueueItem,
} from '@vibes/ui/web';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { MusicDemo } from '../../../components/seo/MusicDemo';
import { useQueueDemo } from '../hooks/useQueueDemo';

// Keep the 72px rows and 8px gaps in reserved slots while the queue reorders.
const rowStride = 80;

export function VotingPreview() {
  const { ref, state, actions } = useQueueDemo();

  return (
    <MotionConfig reducedMotion="user">
      <MusicDemo
        elementRef={ref}
        label="The shared queue"
        detail="electro · 3 friends listening"
        caption={state.caption}
        paused={state.paused || state.reduceMotion === true}
        onToggle={actions.toggle}
        className="h-170"
      >
        <div className="px-3 pt-5 sm:px-5">
          <div className="h-28 border-theme border-b pb-5">
            <ContentTransition transitionKey={state.currentItem.id}>
              <NowPlayingPlaylistItem
                playlistItem={state.currentItem}
                isPlaying
                providerLink={false}
                animate={false}
                density="compact"
              />
            </ContentTransition>
          </div>
          <div className="flex h-10 items-center justify-between text-theme-muted text-xs">
            <span>UP NEXT</span>
            <span>Try a vote ↓</span>
          </div>
          <ol aria-label="Preview queue" className="relative h-80">
            <AnimatePresence initial={false}>
              {state.playlistItems.map((item, index) => (
                <motion.li
                  key={item.id}
                  initial={{
                    opacity: 0,
                    y: index * rowStride + (state.reduceMotion ? 0 : 18),
                  }}
                  animate={{ opacity: 1, y: index * rowStride }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: state.reduceMotion ? 0 : 0.65,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="absolute inset-x-0 top-0 h-18 [&_article]:h-18"
                >
                  <QueueItem
                    playlistItem={item}
                    providerLink={false}
                    position={index + 1}
                    onVote={actions.vote}
                    density="compact"
                    isVoting={state.votingPlaylistItemId === item.id}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
        </div>
        <div
          aria-hidden="true"
          className="grid grid-cols-3 gap-2 px-5 pb-3 text-xs"
        >
          {['Add a song', 'Vote it up', 'Listen together'].map(
            (step, index) => (
              <span
                key={step}
                className={classNames(
                  'h-10 border-t-2 pt-2 transition-colors duration-500',
                  state.step === index
                    ? 'border-secondary text-theme'
                    : 'border-theme text-theme-muted',
                )}
              >
                {step}
              </span>
            ),
          )}
        </div>
      </MusicDemo>
      <p role="status" className="sr-only">
        {state.announcement}
      </p>
    </MotionConfig>
  );
}
