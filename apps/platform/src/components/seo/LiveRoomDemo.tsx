import { classNames } from '@vibes/shared';
import {
  ArrowLeftIcon,
  CastIcon,
  IconButton,
  ListenerCount,
  loadMotionLayoutFeatures,
  NowPlayingPlaylistItem,
  PauseIcon,
  PlaybackProgress,
  PlayerControls,
  PlayIcon,
  PlusIcon,
  QueueItem,
  RemoteIcon,
  SettingsIcon,
  ShareIcon,
  Toast,
} from '@vibes/ui/web';
import {
  AnimatePresence,
  LazyMotion,
  MotionConfig,
  m as motion,
} from 'framer-motion';
import { useEffect, useState } from 'preact/compat';
import { useLiveRoomDemo } from './hooks/useLiveRoomDemo';
import { DemoAddModal } from './live/DemoAddModal';
import { DemoGuestPhone } from './live/DemoGuestPhone';
import { DemoPointer } from './live/DemoPointer';
import { LiveRoomStage } from './live/LiveRoomStage';

interface LiveRoomDemoProps {
  watch?: boolean;
  variant?: 'room' | 'queue';
}

const noop = () => {};
const ease = [0.22, 1, 0.36, 1] as const;

// A scripted miniature of a real room, assembled from the room's own pieces.
export function LiveRoomDemo({
  watch = false,
  variant = 'room',
}: LiveRoomDemoProps) {
  const { ref, state, actions } = useLiveRoomDemo(watch);
  const share = usePhaseProgress(
    state.previousProgress,
    state.progress,
    state.phaseDuration,
    state.playing,
    `${state.cycle}-${state.phase}`,
  );
  const durationMs = (state.current.duration ?? 214) * 1000;
  const roomType = watch ? 'WATCH' : 'MUSIC';
  const room = variant === 'room';
  const pointerTarget =
    state.pointer === 'vote'
      ? `vote:${state.voteTargetId}`
      : (state.pointer ?? null);

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={loadMotionLayoutFeatures}>
        <figure
          aria-label={`Example ${watch ? 'Watch' : 'Music'} room, not a live room`}
          className="min-w-0"
        >
          <div
            ref={ref}
            data-phase={state.phase}
            className={classNames(
              '@container relative isolate min-w-0 overflow-hidden rounded-3xl border border-theme bg-theme p-2 shadow-lg sm:p-4',
            )}
          >
            {room && <DemoRoomHeader name={watch ? 'afterhours' : 'electro'} />}
            <motion.div
              initial={false}
              animate={{ opacity: state.resetting ? 0 : 1 }}
              transition={{ duration: 0.4 }}
              className={classNames(
                'grid min-w-0 gap-4',
                room && 'mt-3 @3xl:grid-cols-5 @3xl:gap-6 sm:mt-4',
              )}
            >
              {room && (
                <div className="flex min-w-0 flex-col gap-4 @3xl:col-span-3">
                  <div className="crt-frame rounded-player relative isolate aspect-video w-full overflow-hidden bg-black @3xl:aspect-[6/5]">
                    <LiveRoomStage
                      playlistItem={state.current}
                      playing={state.playing}
                      watch={watch}
                    />
                  </div>
                  <div inert aria-hidden="true" data-demo-target="controls">
                    <PlayerControls
                      roomType={roomType}
                      isPlaying={!state.userPaused}
                      canPlay
                      canSkip
                      showReset={false}
                      onPlay={noop}
                      onPause={noop}
                      onReset={noop}
                      onSkip={noop}
                      addPlaylistItemHref="#"
                      castHref="#"
                      showCast
                      isCasting={false}
                      volume={80}
                      onVolumeChange={noop}
                      onToggleMuted={noop}
                    />
                  </div>
                </div>
              )}

              <div
                className={classNames(
                  'relative min-w-0',
                  room && '@3xl:col-span-2',
                )}
              >
                <div
                  className={classNames(
                    'flex min-w-0 flex-col',
                    room && '@3xl:absolute @3xl:inset-0',
                  )}
                >
                  <div className="mb-2 shrink-0" inert aria-hidden="true">
                    <NowPlayingPlaylistItem
                      playlistItem={state.current}
                      isPlaying={!state.userPaused}
                      providerLink={false}
                      animate={!state.reducedMotion}
                      statusAside={
                        <span className="relative inline-flex min-h-11 items-center px-1">
                          <AnimatePresence initial={false}>
                            {state.joining && (
                              <motion.span
                                key={state.listeners}
                                aria-hidden="true"
                                initial={{ opacity: 0.9, scale: 0.6 }}
                                animate={{ opacity: 0, scale: 1.6 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.9, ease: 'easeOut' }}
                                className="border-secondary absolute inset-0 rounded-full border-2"
                              />
                            )}
                          </AnimatePresence>
                          <motion.span
                            key={state.listeners}
                            initial={
                              state.joining ? { scale: 1.3, y: -2 } : false
                            }
                            animate={{ scale: 1, y: 0 }}
                            transition={{
                              type: 'spring',
                              stiffness: 380,
                              damping: 14,
                            }}
                            className={classNames(
                              'inline-flex transition-colors duration-700',
                              state.joining && '[&>div]:text-secondary',
                            )}
                          >
                            <ListenerCount
                              count={state.listeners}
                              roomType={roomType}
                              variant="inline"
                            />
                          </motion.span>
                        </span>
                      }
                    />
                    <div className="mt-3">
                      <PlaybackProgress
                        durationMs={durationMs}
                        positionMs={share * durationMs}
                      />
                    </div>
                  </div>

                  <div
                    inert
                    aria-hidden="true"
                    className="border-theme mb-3 flex shrink-0 items-center justify-between border-b"
                  >
                    <span className="border-secondary text-theme font-display text-2xs tracking-label inline-flex min-h-12 items-center border-b-2 px-1">
                      Up next ({state.queue.length})
                    </span>
                    <span className="text-theme-muted font-display text-2xs tracking-label inline-flex min-h-12 items-center border-b-2 border-transparent px-1">
                      {state.unread > 0 ? `Chat (${state.unread})` : 'Chat'}
                    </span>
                  </div>

                  <ol
                    aria-label="Example queue"
                    className={classNames(
                      'relative flex min-h-0 flex-col gap-2 overflow-hidden [mask-image:linear-gradient(to_bottom,black_92%,transparent)]',
                      room ? 'h-48 sm:h-64 @3xl:h-auto @3xl:flex-1' : 'h-80',
                    )}
                  >
                    <AnimatePresence initial={false} mode="popLayout">
                      {state.queue.map((item, index) => (
                        <motion.li
                          key={item.id}
                          layout="position"
                          data-demo-target={`item-${item.id}`}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -16 }}
                          transition={{ duration: 0.55, ease }}
                          className="shrink-0"
                        >
                          <QueueItem
                            playlistItem={item}
                            providerLink={false}
                            position={index + 1}
                            onVote={actions.vote}
                            isVoting={state.votingId === item.id}
                          />
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ol>
                </div>
              </div>
            </motion.div>

            <DemoGuestPhone
              guest={state.guest}
              current={state.current}
              positionMs={share * durationMs}
              listeners={state.listeners}
              watch={watch}
              queue={state.queue}
              roomName={watch ? 'afterhours' : 'electro'}
              targetId={state.added.id}
              votingId={state.guestVotingId}
            />

            <span
              data-demo-target="add"
              aria-hidden="true"
              className={classNames(
                'bg-primary shadow-primary-popover absolute right-4 bottom-4 z-10 flex size-14 items-center justify-center rounded-full text-pink-950',
                room && 'sm:hidden',
              )}
            >
              <PlusIcon className="size-6" />
            </span>

            <div inert aria-hidden="true">
              <DemoAddModal
                modal={state.modal}
                query={state.query}
                result={state.added}
                alternatives={state.queue.slice(-1)}
                watch={watch}
                typing={state.typing}
              />
            </div>

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-6 z-40 flex justify-center px-4"
            >
              <AnimatePresence>
                {state.toast && (
                  <motion.div
                    key={state.toastKey}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 16 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Toast
                      message={state.toast}
                      type="success"
                      standalone={false}
                      duration={1600}
                      onClose={actions.dismissToast}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <DemoPointer
              containerRef={ref}
              target={pointerTarget}
              pressed={state.pressed}
              phase={state.phase}
            />
          </div>

          <figcaption className="text-theme-muted mt-3 flex min-h-11 items-center justify-between gap-3 px-1 text-sm">
            <AnimatePresence initial={false} mode="wait">
              <motion.span
                key={state.caption}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="min-w-0 truncate"
              >
                {state.caption}
              </motion.span>
            </AnimatePresence>
            <button
              type="button"
              onClick={actions.toggle}
              disabled={state.reducedMotion}
              aria-pressed={state.paused}
              aria-label={
                state.reducedMotion
                  ? 'Animation disabled by reduced-motion preference'
                  : state.paused
                    ? 'Play the room preview'
                    : 'Pause the room preview'
              }
              className="hover:bg-theme-surface hover:text-theme focus-visible:ring-secondary flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-default disabled:opacity-50"
            >
              {state.paused && (
                <PlayIcon aria-hidden="true" className="size-3.5" />
              )}
              {!state.paused && (
                <PauseIcon aria-hidden="true" className="size-3.5" />
              )}
            </button>
          </figcaption>
        </figure>
        <p role="status" className="sr-only">
          {state.announcement}
        </p>
      </LazyMotion>
    </MotionConfig>
  );
}

interface DemoRoomHeaderProps {
  name: string;
}

function DemoRoomHeader({ name }: DemoRoomHeaderProps) {
  return (
    <div
      inert
      aria-hidden="true"
      className="border-theme bg-theme-surface w-full rounded-full border p-1 shadow-lg"
    >
      <div className="grid min-w-0 grid-cols-[1fr_minmax(0,1fr)_1fr] items-center gap-1">
        <IconButton
          className="justify-self-start"
          variant="ghost"
          aria-label="Leave room"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </IconButton>
        <p className="font-heading text-theme min-w-0 truncate text-center text-xs tracking-[0.15em] whitespace-nowrap uppercase sm:text-sm">
          {name}
        </p>
        <div className="flex shrink-0 items-center gap-1 justify-self-end">
          <span className="hidden sm:block">
            <IconButton variant="ghost" aria-label="Share">
              <ShareIcon className="h-5 w-5" />
            </IconButton>
          </span>
          <span className="hidden sm:block">
            <IconButton variant="ghost" aria-label="Remote">
              <RemoteIcon className="h-5 w-5" />
            </IconButton>
          </span>
          <span className="sm:hidden">
            <IconButton variant="ghost" aria-label="Cast">
              <CastIcon className="h-5 w-5" />
            </IconButton>
          </span>
          <IconButton variant="ghost" aria-label="Settings">
            <SettingsIcon className="h-5 w-5" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

// Advances playback like the room's 250ms position updates.
function usePhaseProgress(
  from: number,
  to: number,
  durationMs: number,
  playing: boolean,
  _key: string,
) {
  const [share, setShare] = useState(to);

  useEffect(() => {
    if (!playing) {
      setShare(to);

      return;
    }

    const start = performance.now();
    setShare(from);

    const interval = window.setInterval(() => {
      const elapsed = Math.min(1, (performance.now() - start) / durationMs);

      setShare(from + (to - from) * elapsed);
    }, 250);

    return () => window.clearInterval(interval);
  }, [from, to, durationMs, playing]);

  return share;
}
