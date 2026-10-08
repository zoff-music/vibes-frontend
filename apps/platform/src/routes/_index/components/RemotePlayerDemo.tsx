import { classNames } from '@vibes/shared';
import {
  Button,
  CheckIcon,
  PauseIcon,
  PlaybackProgress,
  PlayIcon,
  RemoteIcon,
} from '@vibes/ui/web';
import { MotionConfig, motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { MusicDemo } from '../../../components/seo/MusicDemo';
import { useRemotePreview } from '../hooks/useRemotePreview';
import { RemoteControlPreview } from './RemoteControlPreview';

export function RemotePlayerDemo() {
  const { ref, playButtonRef, state, actions } = useRemotePreview();

  return (
    <MotionConfig reducedMotion="user">
      <MusicDemo
        elementRef={ref}
        label="One player. A pocket remote."
        detail="Pair once. Keep the controls close."
        caption={state.caption}
        paused={state.paused || state.reducedMotion === true}
        onToggle={actions.toggle}
        presentation="stage"
        className="h-186 sm:h-170"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 top-1/4 bottom-8 rounded-full bg-[radial-gradient(ellipse,#00d5eb12,transparent_68%)]"
        />
        <div className="relative grid h-full min-w-0 items-center gap-5 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] sm:gap-6 sm:p-4">
          <section
            aria-label="Controlled player"
            className="relative min-w-0 rounded-3xl border border-theme bg-theme p-4 shadow-lg sm:-translate-y-8"
          >
            <div className="mb-4 flex items-center justify-between text-theme-muted text-xs">
              <span>THE PLAYER</span>
              <span className="flex w-18 justify-end text-cyan-800 dark:text-secondary">
                <motion.span
                  key={`${state.playing}-${state.playlistItem.id}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: state.reducedMotion ? 0 : 0.35 }}
                  className="flex items-center gap-1.5"
                >
                  {state.playing && (
                    <PlayIcon aria-hidden="true" className="size-2.5" />
                  )}
                  {!state.playing && (
                    <PauseIcon aria-hidden="true" className="size-2.5" />
                  )}
                  {state.playing ? 'Playing' : 'Paused'}
                </motion.span>
              </span>
            </div>
            <div className="flex items-center gap-4 sm:block">
              <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl sm:mx-auto sm:aspect-square sm:size-auto sm:w-full sm:max-w-64">
                <motion.img
                  key={state.playlistItem.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: state.reducedMotion ? 0 : 0.5 }}
                  src={state.playlistItem.thumbnailUrl}
                  width={240}
                  height={240}
                  alt="Illustrative album artwork"
                  className="absolute inset-0 size-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/10" />
                {!state.paired && (
                  <div
                    aria-hidden="true"
                    className="absolute right-3 bottom-3 hidden rounded-lg bg-white p-2 sm:block"
                  >
                    <QRCodeSVG
                      value="https://zoff.me/discovery/apps"
                      size={52}
                    />
                  </div>
                )}
              </div>
              <div className="min-w-0 sm:mt-4">
                <p className="truncate font-pixel text-lg text-theme">
                  {state.playlistItem.title}
                </p>
                <p className="mt-1 text-theme-muted text-xs">
                  Sound plays here
                </p>
              </div>
            </div>
            <div className="mt-3">
              <PlaybackProgress
                durationMs={state.durationMs}
                positionMs={state.position}
              />
            </div>
          </section>
          <section
            aria-label="Phone remote"
            className="relative min-w-0 overflow-hidden rounded-3xl border-2 border-theme-strong bg-theme-surface p-4 shadow-xl sm:min-h-96 sm:translate-y-8"
          >
            <div
              aria-hidden="true"
              className="mx-auto mb-4 h-1 w-10 rounded-full bg-theme-muted/30"
            />
            <div className="mb-5 flex items-center justify-between border-theme border-b pb-3 text-theme-muted text-xs">
              <span>YOUR PHONE</span>
              <RemoteIcon
                aria-hidden="true"
                className="size-4 text-cyan-800 dark:text-secondary"
              />
            </div>
            <div className="grid min-h-57 items-center sm:min-h-68">
              {!state.paired && (
                <div className="text-center">
                  <div
                    aria-hidden="true"
                    className="relative mx-auto size-28 overflow-hidden rounded-xl bg-white p-3"
                  >
                    <QRCodeSVG
                      value="https://zoff.me/discovery/apps"
                      size={88}
                    />
                    <motion.span
                      initial={{ y: 0 }}
                      animate={{ y: state.animate ? [0, 88, 0] : 44 }}
                      transition={{
                        duration: state.reducedMotion ? 0 : 2.6,
                        repeat: state.animate ? Infinity : 0,
                        ease: 'easeInOut',
                      }}
                      className="absolute inset-x-0 top-3 h-0.5 bg-secondary shadow-secondary-soft"
                    />
                  </div>
                  <p className="mt-4 text-sm text-theme">
                    Scan the player’s code
                  </p>
                  <p className="mt-1 text-theme-muted text-xs">
                    Or enter its pairing code.
                  </p>
                  <Button
                    onClick={actions.pair}
                    variant="secondary"
                    size="small"
                    className="mt-4 min-h-11 w-full"
                  >
                    Try pairing
                  </Button>
                </div>
              )}
              {state.paired && (
                <RemoteControlPreview
                  playlistItem={state.playlistItem}
                  playing={state.playing}
                  durationMs={state.durationMs}
                  position={state.position}
                  playButtonRef={playButtonRef}
                  onTogglePlayback={actions.togglePlayback}
                  onSkip={actions.skip}
                  onSeek={actions.seek}
                />
              )}
            </div>
            <p
              className={classNames(
                'mt-4 flex h-5 items-center justify-center gap-1.5 text-xs',
                state.paired
                  ? 'text-cyan-800 dark:text-secondary'
                  : 'text-theme-muted',
              )}
            >
              {state.paired && (
                <CheckIcon aria-hidden="true" className="size-3" />
              )}
              {state.paired ? 'Connected to electro' : 'Pairing preview'}
            </p>
          </section>
        </div>
      </MusicDemo>
      <p role="status" className="sr-only">
        {state.announcement}
      </p>
    </MotionConfig>
  );
}
