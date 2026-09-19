import { classNames } from '@vibes/shared';
import { ChatMessageLine, QueueItem, SegmentedToggle } from '@vibes/ui/web';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { queueDemoSongs } from '../../../components/seo/previewSongs';
import { useChatPreview } from '../hooks/useChatPreview';

export function ChatPreview() {
  const state = useChatPreview();

  return (
    <MotionConfig reducedMotion="user">
      <figure
        ref={state.ref}
        data-phase={state.phase}
        data-playing={state.playing}
        aria-label="A preview of room chat and activity"
        className="relative min-w-0"
      >
        <div className="mb-4 min-h-12">
          <SegmentedToggle
            label="Chat"
            variant="plain-full"
            size="comfortable"
            checked={state.chatEnabled}
            onChange={state.setChatEnabled}
          />
        </div>
        <div
          aria-hidden="true"
          inert
          className="relative grid h-112 min-w-0 place-items-center sm:h-124"
        >
          <motion.div
            initial={false}
            animate={{
              width: state.branding ? 176 : '100%',
              height: state.branding ? 176 : '100%',
              borderRadius: state.branding ? 88 : 24,
            }}
            transition={{
              duration: state.reducedMotion ? 0 : 0.65,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative col-start-1 row-start-1 min-w-0 overflow-hidden border border-theme bg-theme-surface shadow-secondary-panel"
          >
            <motion.div
              initial={false}
              animate={{ opacity: state.branding ? 0 : 1 }}
              transition={{
                duration: state.reducedMotion ? 0 : 0.2,
                delay: state.branding ? 0 : 0.35,
              }}
              className="flex h-full min-w-0 flex-col"
            >
              <div className="flex shrink-0 items-center justify-between gap-3 border-theme border-b px-5 py-4">
                <span className="font-pixel text-sm text-theme">electro</span>
                <span className="flex items-center gap-2 text-secondary text-xs">
                  <span className="size-1.5 rounded-full bg-secondary" />
                  {state.chatEnabled ? 'Room chat' : 'Up next'}
                </span>
              </div>
              <AnimatePresence initial={false} mode="wait">
                {state.chatEnabled && (
                  <motion.div
                    key="conversation"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: state.reducedMotion ? 0 : 0.2 }}
                    className="flex min-h-0 flex-1 flex-col justify-end overflow-hidden px-4 pt-3 pb-5 [mask-image:linear-gradient(to_bottom,transparent,black_1rem)] sm:px-5"
                  >
                    <AnimatePresence initial={false} mode="popLayout">
                      {state.messages.map((message) => (
                        <motion.div
                          key={message.id}
                          layout="position"
                          initial={{ opacity: 0, y: 18 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          transition={{
                            duration: state.reducedMotion ? 0 : 0.35,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="shrink-0"
                        >
                          <ChatMessageLine message={message} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
                {!state.chatEnabled && (
                  <motion.div
                    key="queue"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: state.reducedMotion ? 0 : 0.3 }}
                    className="min-h-0 flex-1 space-y-3 p-3 sm:p-5"
                  >
                    {queueDemoSongs.slice(0, 3).map((song, index) => (
                      <QueueItem
                        key={song.id}
                        song={song}
                        position={index + 1}
                        providerLink={false}
                        density="compact"
                      />
                    ))}
                    <p className="px-2 pt-4 text-sm text-theme-muted">
                      Chat off. Music on.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
          <motion.div
            initial={false}
            animate={{
              opacity: state.branding ? 1 : 0,
              scale: state.branding ? 1 : 0.5,
            }}
            transition={{
              duration: state.reducedMotion ? 0 : 0.5,
              delay: state.branding ? 0.2 : 0,
            }}
            className="pointer-events-none z-10 col-start-1 row-start-1"
          >
            <img
              src="/logo.png"
              alt=""
              width={1024}
              height={1024}
              className={classNames(
                'size-36 rounded-full',
                state.branding &&
                  'motion-safe:animate-spin motion-safe:[animation-duration:1.4s] motion-safe:[animation-iteration-count:1]',
                !state.playing && '[animation-play-state:paused]',
              )}
            />
          </motion.div>
        </div>
        <figcaption className="mt-4 h-12 text-center text-sm text-theme-muted">
          <span aria-hidden="true">
            {state.chatEnabled
              ? 'Every pick has a person behind it.'
              : 'Your device. Your choice. The room keeps playing.'}
          </span>
          <span className="sr-only">
            {' '}
            An example conversation shows friends adding and voting for songs,
            voting to skip, skipping, deleting a song and changing a display
            name. Turn Chat off to hide the conversation on this device and
            return to the queue without stopping the music.
          </span>
        </figcaption>
      </figure>
    </MotionConfig>
  );
}
