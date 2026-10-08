import { classNames } from '@vibes/shared';
import { ChatMessageLine, QueueItem, SegmentedToggle } from '@vibes/ui/web';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import logo from '../../../assets/logo-header.webp';
import { MusicDemo } from '../../../components/seo/MusicDemo';
import {
  queueDemoPlaylistItems,
  watchDemoPlaylistItems,
} from '../../../components/seo/preview';
import { useChatPreview } from '../hooks/useChatPreview';

interface ChatPreviewProps {
  watch?: boolean;
}

export function ChatPreview({ watch = false }: ChatPreviewProps) {
  const { ref, state } = useChatPreview(watch);
  const playlistItems = watch ? watchDemoPlaylistItems : queueDemoPlaylistItems;

  if (!watch) {
    return (
      <MotionConfig reducedMotion="user">
        <MusicDemo
          elementRef={ref}
          label="More than a playlist"
          detail="electro · The conversation keeps the music company."
          caption={
            state.chatEnabled
              ? 'Every pick has a person behind it.'
              : 'Chat off on your device. The music carries on.'
          }
          paused={state.paused}
          onToggle={state.toggle}
          className="h-160"
        >
          <div className="flex h-28 items-center gap-4 border-theme border-b px-4 sm:px-6">
            <img
              src={logo}
              width={40}
              height={40}
              alt=""
              className={classNames(
                'size-10 rounded-full',
                state.branding && state.playing && 'motion-safe:animate-spin',
              )}
            />
            <div className="min-w-0 flex-1">
              <SegmentedToggle
                label="Chat"
                checked={state.chatEnabled}
                onChange={state.setChatEnabled}
                variant="plain-full"
                size="comfortable"
              />
            </div>
          </div>
          <div
            aria-hidden="true"
            inert
            className="relative h-96 overflow-hidden p-4 sm:p-6"
          >
            {state.chatEnabled && (
              <div className="relative h-full">
                <AnimatePresence initial={false}>
                  {state.messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{
                        opacity: 0,
                        y: -(state.messages.length - 1 - index) * 64 + 16,
                      }}
                      animate={{
                        opacity: 1,
                        y: -(state.messages.length - 1 - index) * 64,
                      }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: state.reducedMotion ? 0 : 0.5,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="absolute inset-x-0 bottom-0 flex h-16 items-end"
                    >
                      <ChatMessageLine message={message} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
            {!state.chatEnabled && (
              <div className="space-y-3">
                <p className="mb-5 text-theme-muted text-xs">UP NEXT</p>
                {playlistItems.slice(0, 3).map((item, index) => (
                  <QueueItem
                    key={item.id}
                    playlistItem={item}
                    position={index + 1}
                    providerLink={false}
                    density="compact"
                  />
                ))}
              </div>
            )}
          </div>
        </MusicDemo>
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <figure
        ref={ref}
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
                <span className="font-pixel text-sm text-theme">
                  {watch ? 'afterhours' : 'electro'}
                </span>
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
                    <div className="relative h-full">
                      <AnimatePresence initial={false}>
                        {state.messages.map((message, index) => (
                          <motion.div
                            key={message.id}
                            initial={{
                              opacity: 0,
                              y: -(state.messages.length - 1 - index) * 80 + 16,
                            }}
                            animate={{
                              opacity: 1,
                              y: -(state.messages.length - 1 - index) * 80,
                            }}
                            exit={{ opacity: 0 }}
                            transition={{
                              duration: state.reducedMotion ? 0 : 0.35,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            className="absolute inset-x-0 bottom-0 flex h-20 items-end"
                          >
                            <ChatMessageLine message={message} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
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
                    {playlistItems.slice(0, 3).map((playlistItem, index) => (
                      <QueueItem
                        key={playlistItem.id}
                        playlistItem={playlistItem}
                        position={index + 1}
                        providerLink={false}
                        density="compact"
                      />
                    ))}
                    <p className="px-2 pt-4 text-sm text-theme-muted">
                      {watch ? 'Chat off. Film on.' : 'Chat off. Music on.'}
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
              src={logo}
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
            An example conversation shows friends adding and voting for playlist
            items, voting to skip, skipping, deleting an item and changing a
            display name. Turn Chat off to hide the conversation on this device
            and return to the queue without stopping playback.
          </span>
        </figcaption>
      </figure>
    </MotionConfig>
  );
}
