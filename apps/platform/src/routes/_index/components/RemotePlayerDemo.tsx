import {
  Button,
  CheckIcon,
  NowPlayingSong,
  PauseIcon,
  PlaybackProgress,
  PlayIcon,
  RemoteIcon,
  ResetIcon,
} from '@vibes/ui/web';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { useRemotePreview } from '../hooks/useRemotePreview';
import { RemoteControlPreview } from './RemoteControlPreview';
import {
  RemotePairingDetails,
  RemotePairingPreview,
} from './RemotePairingPreview';

export function RemotePlayerDemo() {
  const { state, actions } = useRemotePreview();
  const paired = state.phase === 'paired';
  const transition = { duration: state.reducedMotion ? 0 : 0.2 };

  return (
    <MotionConfig reducedMotion="user">
      <figure
        ref={state.ref}
        aria-label="Pairing a phone with the electro player"
        className="min-w-0"
        onFocusCapture={(event) => {
          if (
            !paired &&
            event.target instanceof HTMLElement &&
            !event.target.closest('[data-animation-control]')
          ) {
            actions.pausePairing();
          }
        }}
      >
        <p className="mb-3 font-pixel text-theme-muted text-xs">
          {paired
            ? '2. Your phone controls the player'
            : '1. Match the code to pair'}
        </p>
        <div className="grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <section
            aria-label="Controlled player"
            className="flex min-h-48 min-w-0 flex-col rounded-2xl border border-theme bg-theme p-4"
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
                    playButtonRef={state.playButtonRef}
                    onTogglePlayback={actions.togglePlayback}
                    onSkip={actions.skip}
                    onSeek={actions.seek}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </section>
        </div>
        <div className="mt-4 flex gap-3">
          {!paired && !state.reducedMotion && (
            <Button
              size="small"
              variant="tertiary"
              className="min-h-12 flex-1 gap-2 text-sm"
              data-animation-control
              aria-label={
                state.paused
                  ? 'Resume pairing preview'
                  : 'Pause pairing preview'
              }
              onClick={actions.togglePairing}
            >
              {state.paused && (
                <PlayIcon aria-hidden="true" className="h-4 w-4" />
              )}
              {!state.paused && (
                <PauseIcon aria-hidden="true" className="h-4 w-4" />
              )}
              <span>{state.paused ? 'Resume' : 'Pause'}</span>
            </Button>
          )}
          <Button
            size="small"
            variant="tertiary"
            className="min-h-12 flex-1 gap-2 text-sm"
            data-animation-control
            aria-label="Pair again"
            onClick={actions.replayPairing}
          >
            <ResetIcon aria-hidden="true" className="h-4 w-4" />
            <span>Pair again</span>
          </Button>
        </div>
        <figcaption className="sr-only" aria-live="polite">
          {paired &&
            'Remote paired. The phone now controls the electro player.'}
          {state.phase === 'connecting' && 'Pairing remote.'}
        </figcaption>
      </figure>
    </MotionConfig>
  );
}
