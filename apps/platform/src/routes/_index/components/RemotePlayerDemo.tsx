import {
  CheckIcon,
  NowPlayingSong,
  PlaybackProgress,
  RemoteIcon,
} from '@vibes/ui/web';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { useRemotePreview } from '../hooks/useRemotePreview';
import { RemoteControlPreview } from './RemoteControlPreview';
import {
  RemotePairingDetails,
  RemotePairingPreview,
} from './RemotePairingPreview';

export function RemotePlayerDemo() {
  const { ref, playButtonRef, state, actions } = useRemotePreview();
  const paired = state.phase === 'paired';
  const transition = { duration: state.reducedMotion ? 0 : 0.2 };

  return (
    <MotionConfig reducedMotion="user">
      <figure
        ref={ref}
        tabIndex={-1}
        aria-label="Pairing a phone with the electro player"
        className="min-h-144 min-w-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary sm:min-h-92 lg:min-h-144 xl:min-h-92"
      >
        <p className="mb-3 font-pixel text-theme-muted text-xs">
          {paired
            ? '2. Your phone controls the player'
            : '1. Match the code to pair'}
        </p>
        <div className="grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <section
            aria-label="Controlled player"
            className="flex min-h-52 min-w-0 flex-col rounded-2xl border border-theme bg-theme p-4"
          >
            <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
              <span className="font-pixel text-sm text-theme">
                Player · electro
              </span>
              {paired && (
                <span className="flex items-center gap-1.5 text-theme-muted text-xs">
                  <CheckIcon
                    aria-hidden="true"
                    className="h-3.5 w-3.5 text-secondary"
                  />
                  {state.playing ? 'Playing' : 'Paused'}
                </span>
              )}
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={paired ? 'player' : 'pairing'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={transition}
                className="flex min-w-0 flex-1 flex-col justify-center"
              >
                {!paired && <RemotePairingDetails />}
                {paired && (
                  <div>
                    <NowPlayingSong
                      song={state.song}
                      isPlaying={state.playing}
                      providerLink={false}
                      animate={false}
                      density="compact"
                      showStatus={false}
                    />
                    <div className="mt-3">
                      <PlaybackProgress
                        durationMs={state.durationMs}
                        positionMs={state.position}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </section>
          <section
            aria-label="Phone remote"
            className="flex min-h-80 min-w-0 flex-col rounded-2xl border border-theme bg-theme p-4"
          >
            <div className="mb-4 flex shrink-0 items-center justify-between gap-3 border-theme border-b pb-3">
              <p className="font-pixel text-sm text-theme">Your phone</p>
              <RemoteIcon
                aria-hidden="true"
                className="h-5 w-5 shrink-0 text-secondary"
              />
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={state.phase}
                onAnimationComplete={actions.focusControls}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={transition}
                className="min-h-0 flex-1"
              >
                {!paired && (
                  <RemotePairingPreview
                    code={state.code}
                    animate={state.animate}
                    connecting={state.phase === 'connecting'}
                    onPair={actions.pair}
                  />
                )}
                {paired && (
                  <RemoteControlPreview
                    song={state.song}
                    playing={state.playing}
                    durationMs={state.durationMs}
                    position={state.position}
                    playButtonRef={playButtonRef}
                    onTogglePlayback={actions.togglePlayback}
                    onSkip={actions.skip}
                    onSeek={actions.seek}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </section>
        </div>
        <figcaption className="sr-only" aria-live="polite">
          {state.announcement}
        </figcaption>
      </figure>
    </MotionConfig>
  );
}
