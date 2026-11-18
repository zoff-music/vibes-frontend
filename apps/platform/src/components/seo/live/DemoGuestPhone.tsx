import type { PlaylistItem } from '@vibes/models';
import { ListenerCount, PlaybackProgress, QueueItem } from '@vibes/ui/web';
import { AnimatePresence, m as motion } from 'framer-motion';
import type { DemoGuest } from '../hooks/useLiveRoomDemo';

interface DemoGuestPhoneProps {
  guest: DemoGuest | null;
  current: PlaylistItem;
  positionMs: number;
  listeners: number;
  queue: PlaylistItem[];
  roomName: string;
  targetId: string;
  votingId: string | null;
  watch: boolean;
}

const noop = () => {};
const ease = [0.22, 1, 0.36, 1] as const;

// Another listener's phone in the same room: her tap updates every screen.
export function DemoGuestPhone({
  guest,
  current,
  positionMs,
  listeners,
  queue,
  roomName,
  targetId,
  votingId,
  watch,
}: DemoGuestPhoneProps) {
  return (
    <AnimatePresence>
      {guest && (
        <motion.div
          key="guest"
          aria-hidden="true"
          inert
          initial={{ opacity: 0, y: 40, rotate: -4 }}
          animate={{ opacity: 1, y: 0, rotate: -2 }}
          exit={{ opacity: 0, y: 40, rotate: -4 }}
          transition={{ duration: 0.5, ease }}
          className="absolute bottom-4 left-4 z-30 w-80 max-w-[calc(100%-2rem)] origin-bottom-left sm:bottom-6 sm:left-6"
        >
          <p className="bg-primary font-display text-2xs tracking-label mb-2 inline-flex rounded-full px-3 py-1 text-pink-950 shadow-lg">
            Mira’s phone
          </p>
          <div className="bg-theme relative rounded-[2rem] border-4 border-[#302139] p-2 pt-5 shadow-xl">
            <span className="absolute top-1.5 left-1/2 h-1.5 w-12 -translate-x-1/2 rounded-full bg-[#302139]" />
            <div className="border-theme bg-theme-surface flex h-8 items-center justify-center rounded-full border">
              <span className="font-heading text-theme text-2xs tracking-[0.15em] uppercase">
                {roomName}
              </span>
            </div>
            <div className="relative h-80 overflow-hidden">
              <AnimatePresence initial={false} mode="wait">
                {guest === 'link' && (
                  <motion.div
                    key="link"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.25 }}
                    className="flex h-full flex-col items-center justify-center gap-4 text-center"
                  >
                    <span className="border-secondary/60 bg-theme-surface text-theme rounded-full border px-4 py-2 text-sm">
                      zoff.me/{roomName}
                    </span>
                    <span className="border-theme border-t-primary size-6 animate-spin rounded-full border-2" />
                    <span className="text-theme-muted text-xs">
                      Joining {roomName}…
                    </span>
                  </motion.div>
                )}
                {guest !== 'link' && (
                  <motion.div
                    key="room"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease }}
                    className="h-full"
                  >
                    <div className="mt-2 flex items-center gap-2 px-1">
                      <img
                        src={current.thumbnailUrl}
                        alt=""
                        width={40}
                        height={40}
                        className="border-theme size-10 shrink-0 rounded-lg border object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-theme text-2xs truncate uppercase">
                          {current.title}
                        </p>
                        <ListenerCount
                          count={listeners}
                          variant="inline"
                          roomType={watch ? 'WATCH' : 'MUSIC'}
                        />
                      </div>
                    </div>
                    <div className="px-1">
                      <PlaybackProgress
                        durationMs={(current.duration ?? 214) * 1000}
                        positionMs={positionMs}
                        showTimes={false}
                      />
                    </div>
                    <div className="border-theme mt-2 mb-2 flex border-b">
                      <span className="border-secondary font-display text-2xs text-theme tracking-label border-b-2 px-1 py-2">
                        Up next ({queue.length})
                      </span>
                    </div>
                    <ol className="flex flex-col gap-1.5">
                      {queue.slice(0, 3).map((item, index) => (
                        <motion.li
                          key={item.id}
                          layout="position"
                          transition={{ duration: 0.55, ease }}
                          className="relative"
                        >
                          <QueueItem
                            playlistItem={item}
                            position={index + 1}
                            providerLink={false}
                            density="compact"
                            onVote={noop}
                            isVoting={votingId === item.id}
                          />
                          {item.id === targetId &&
                            (guest === 'aim' || guest === 'vote') && (
                              <span className="pointer-events-none absolute top-1/2 right-6 size-0">
                                <motion.span
                                  initial={{ opacity: 0, scale: 0.6 }}
                                  animate={{
                                    opacity: guest === 'vote' ? [1, 0] : 0.9,
                                    scale: guest === 'vote' ? [0.8, 2.2] : 1,
                                  }}
                                  transition={{
                                    duration: guest === 'vote' ? 0.7 : 0.4,
                                  }}
                                  className="absolute -top-4 -left-4 size-8 rounded-full border-2 border-white/80 bg-white/25"
                                />
                              </span>
                            )}
                        </motion.li>
                      ))}
                    </ol>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
