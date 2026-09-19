import {
  Button,
  CheckIcon,
  NowPlayingSong,
  PauseIcon,
  PlaybackProgress,
  PlayIcon,
  RemoteIcon,
  ResetIcon,
  SkipIcon,
} from '@vibes/ui/web';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { useRemotePreview } from '../hooks/useRemotePreview';
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
      >
        <div className="mb-4 flex min-h-11 items-center justify-between gap-3">
          <p className="font-pixel text-theme-muted text-xs">
            {paired ? '2. Control the player' : '1. Pair the devices'}
          </p>
          <div className="flex gap-2">
            {!paired && !state.reducedMotion && (
              <Button
                size="icon"
                variant="tertiary"
                aria-label={
                  state.paused
                    ? 'Resume pairing preview'
                    : 'Pause pairing preview'
                }
                onClick={actions.togglePairing}
              >
                {state.paused && <PlayIcon className="h-4 w-4" />}
                {!state.paused && <PauseIcon className="h-4 w-4" />}
              </Button>
            )}
            <Button
              size="icon"
              variant="tertiary"
              aria-label="Replay pairing preview"
              onClick={actions.replayPairing}
            >
              <ResetIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <section
            aria-label="Phone remote"
            className="flex h-96 min-w-0 flex-col rounded-3xl border border-theme bg-theme p-5"
          >
            <div className="mb-6 flex shrink-0 items-center justify-between gap-3 border-theme border-b pb-4">
              <div>
                <p className="font-pixel text-secondary text-xs">
                  {paired ? 'Controlling machine' : 'Zoff Remote'}
                </p>
                <p className="mt-2 text-sm text-theme">electro</p>
              </div>
              <RemoteIcon className="h-6 w-6 shrink-0 text-secondary" />
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
                  <div className="flex h-full flex-col">
                    <p className="font-pixel text-theme-muted text-xs">
                      Now playing
                    </p>
                    <h3 className="mt-4 truncate font-display text-lg text-theme">
                      {state.song.title}
                    </h3>
                    <p className="mt-2 text-sm text-theme-muted">
                      {state.song.artist}
                    </p>
                    <div className="mt-6 flex items-center gap-3">
                      <Button
                        ref={state.playButtonRef}
                        variant="secondary"
                        size="icon"
                        aria-label={
                          state.playing
                            ? 'Pause from remote'
                            : 'Play from remote'
                        }
                        onClick={actions.togglePlayback}
                      >
                        {state.playing && <PauseIcon className="h-5 w-5" />}
                        {!state.playing && <PlayIcon className="h-5 w-5" />}
                      </Button>
                      <Button
                        variant="tertiary"
                        size="icon"
                        aria-label="Skip from remote"
                        onClick={actions.skip}
                      >
                        <SkipIcon className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="mt-auto pt-4">
                      <PlaybackProgress
                        disabled={false}
                        durationMs={state.durationMs}
                        positionMs={state.position}
                        onChange={(event) =>
                          actions.seek(Number(event.currentTarget.value))
                        }
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </section>
          <section
            aria-label="Controlled player"
            className="flex h-96 min-w-0 flex-col rounded-3xl border border-theme bg-theme p-5"
          >
            <div className="mb-6 flex shrink-0 items-center justify-between gap-3 border-theme border-b pb-4">
              <span className="font-pixel text-sm text-theme">Player</span>
              <span className="text-secondary text-xs">electro</span>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={paired ? 'player' : 'pairing'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={transition}
                className="min-h-0 flex-1"
              >
                {!paired && <RemotePairingDetails />}
                {paired && (
                  <div className="flex h-full flex-col">
                    <p className="mb-5 flex items-center gap-2 text-secondary text-xs">
                      <CheckIcon className="h-4 w-4" /> Remote paired
                    </p>
                    <NowPlayingSong
                      song={state.song}
                      isPlaying={state.playing}
                      providerLink={false}
                      animate={false}
                    />
                    <div className="mt-auto pt-4">
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
