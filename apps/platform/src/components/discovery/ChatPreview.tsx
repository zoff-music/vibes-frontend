import {
  ArrowRightIcon,
  Button,
  ChatMessageLine,
  QueueItem,
  SegmentedToggle,
} from '@vibes/ui/web';
import { AnimatePresence, MotionConfig, m as motion } from 'framer-motion';
import { useChatPreview } from '../../hooks/discovery/useChatPreview';
import { MusicDemo } from '../seo/MusicDemo';
import { queueDemoPlaylistItems, watchDemoPlaylistItems } from '../seo/preview';

interface ChatPreviewProps {
  watch?: boolean;
  autoplay?: boolean;
}

// The room's Chat tab, plus the device setting that hides it.
export function ChatPreview({
  watch = false,
  autoplay = true,
}: ChatPreviewProps) {
  const { ref, state } = useChatPreview(watch, autoplay);
  const playlistItems = watch ? watchDemoPlaylistItems : queueDemoPlaylistItems;

  return (
    <MotionConfig reducedMotion="user">
      <MusicDemo
        elementRef={ref}
        label={watch ? 'Watch party chat' : 'Room chat'}
        detail="An example conversation shows friends adding and voting for playlist items, voting to skip, skipping, deleting an item and changing a display name. Turn Chat off to hide the conversation on this device without stopping playback."
        caption={
          state.chatEnabled
            ? 'Every pick has a person behind it.'
            : watch
              ? 'Chat off on this device. The film plays on.'
              : 'Chat off on this device. The music plays on.'
        }
        paused={state.paused}
        onToggle={state.toggle}
      >
        <div className="border-theme bg-theme-surface/60 border-b px-4 py-2 sm:px-5">
          <SegmentedToggle
            label="Chat"
            description="Device setting"
            checked={state.chatEnabled}
            onChange={state.setChatEnabled}
            variant="plain-full"
          />
        </div>
        <div aria-hidden="true" inert className="px-4 pt-2 pb-4 sm:px-5">
          <div className="border-theme mb-3 flex items-center justify-between border-b">
            <span
              className={
                state.chatEnabled
                  ? 'font-display text-2xs tracking-label text-theme-muted inline-flex min-h-12 items-center border-b-2 border-transparent px-1'
                  : 'font-display text-2xs tracking-label text-theme border-secondary inline-flex min-h-12 items-center border-b-2 px-1'
              }
            >
              Up next ({playlistItems.length})
            </span>
            {state.chatEnabled && (
              <span className="font-display text-2xs tracking-label text-theme border-secondary inline-flex min-h-12 items-center border-b-2 px-1">
                Chat
              </span>
            )}
          </div>
          <div className="relative h-72 overflow-hidden">
            <AnimatePresence initial={false} mode="wait">
              {state.chatEnabled && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: state.reducedMotion ? 0 : 0.2 }}
                  className="flex h-full flex-col"
                >
                  <div className="flex min-h-0 flex-1 flex-col justify-end overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_2.5rem)]">
                    <AnimatePresence initial={false} mode="popLayout">
                      {state.messages.map((message) => (
                        <motion.div
                          key={message.id}
                          layout="position"
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{
                            duration: state.reducedMotion ? 0 : 0.35,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        >
                          <ChatMessageLine message={message} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  <div className="border-theme flex shrink-0 items-end gap-2 border-t pt-3">
                    <span className="border-theme bg-theme-surface text-theme-muted flex h-12 min-w-0 flex-1 items-center rounded-full border px-4 text-base">
                      Send a message...
                    </span>
                    <Button
                      size="icon"
                      aria-label="Send message"
                      className="h-12! w-12!"
                      disabled
                    >
                      <ArrowRightIcon className="h-5 w-5" />
                    </Button>
                  </div>
                </motion.div>
              )}
              {!state.chatEnabled && (
                <motion.ol
                  key="queue"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: state.reducedMotion ? 0 : 0.25 }}
                  className="flex flex-col gap-2"
                >
                  {playlistItems.slice(0, 3).map((playlistItem, index) => (
                    <li key={playlistItem.id}>
                      <QueueItem
                        playlistItem={playlistItem}
                        position={index + 1}
                        providerLink={false}
                      />
                    </li>
                  ))}
                </motion.ol>
              )}
            </AnimatePresence>
          </div>
        </div>
      </MusicDemo>
    </MotionConfig>
  );
}
