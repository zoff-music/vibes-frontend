import {
  Button,
  NowPlayingPlaylistItem,
  PlaybackProgress,
  RemoteIcon,
} from '@vibes/ui/web';
import { AnimatePresence, MotionConfig, m as motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { LiveRoomStage } from '../../../components/seo/live/LiveRoomStage';
import { MusicDemo } from '../../../components/seo/MusicDemo';
import { useRemotePreview } from '../hooks/useRemotePreview';
import { RemoteControlPreview } from './RemoteControlPreview';

const pairingUrl = 'https://zoff.me/remotes/join';

// The room's Remote Control dialog on the player, and the remote on a phone.
interface RemotePlayerDemoProps {
  autoplay?: boolean;
}

export function RemotePlayerDemo({ autoplay = true }: RemotePlayerDemoProps) {
  const { ref, playButtonRef, state, actions } = useRemotePreview(autoplay);

  return (
    <MotionConfig reducedMotion="user">
      <MusicDemo
        elementRef={ref}
        label="One player. A pocket remote."
        detail="Pair a phone with the player that makes the sound."
        caption={state.caption}
        paused={state.paused || state.reducedMotion === true}
        onToggle={actions.toggle}
        presentation="stage"
      >
        <div className="grid min-w-0 items-end gap-5 px-1 pt-2 sm:grid-cols-[minmax(0,1fr)_15rem] sm:gap-6">
          <section aria-label="The player" className="min-w-0">
            <div
              inert
              aria-hidden="true"
              className="border-theme bg-theme relative rounded-2xl border p-2 shadow-lg sm:p-3"
            >
              <div className="crt-frame rounded-player relative aspect-video overflow-hidden bg-black">
                <LiveRoomStage
                  playlistItem={state.playlistItem}
                  playing={state.playing}
                  watch={false}
                />
                <AnimatePresence>
                  {!state.paired && (
                    <motion.div
                      key="dialog"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm"
                    >
                      <div className="panel-strong flex w-full max-w-xs items-center gap-3 rounded-3xl p-3">
                        <div className="inline-flex shrink-0 rounded-xl bg-white p-1.5">
                          <QRCodeSVG
                            value={pairingUrl}
                            size={72}
                            bgColor="#ffffff"
                            fgColor="#2a1840"
                            level="M"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-display text-theme text-sm">
                            Remote Control
                          </p>
                          <p className="font-pixel text-2xs text-theme-muted tracking-label mt-2">
                            Manual pairing
                          </p>
                          <p className="font-display text-secondary mt-1 text-lg tracking-widest">
                            Q7 4K
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {state.paired && (
                    <motion.span
                      key="paired"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs text-white"
                    >
                      <RemoteIcon className="text-secondary size-3.5" />
                      Remote paired
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <div className="mt-3">
                <NowPlayingPlaylistItem
                  playlistItem={state.playlistItem}
                  isPlaying={state.playing}
                  providerLink={false}
                  animate={false}
                  showStatus={false}
                  density="compact"
                />
                <div className="mt-2">
                  <PlaybackProgress
                    durationMs={state.durationMs}
                    positionMs={state.position}
                  />
                </div>
              </div>
            </div>
            <p className="text-theme-muted mt-3 text-center text-xs">
              Computer or TV · plays the sound
            </p>
          </section>

          <section aria-label="Your phone" className="min-w-0">
            <div className="bg-theme relative rounded-[2rem] border-4 border-[#302139] p-4 pt-6 shadow-xl">
              <span
                aria-hidden="true"
                className="absolute top-2 left-1/2 h-1.5 w-12 -translate-x-1/2 rounded-full bg-[#302139]"
              />
              <div className="flex min-h-80 flex-col justify-center">
                {!state.paired && (
                  <div className="text-center">
                    <p className="font-display text-theme text-sm">
                      Connect this device
                    </p>
                    <div
                      aria-hidden="true"
                      className="relative mx-auto mt-4 aspect-square w-full max-w-44 overflow-hidden rounded-2xl bg-black"
                    >
                      <div className="absolute inset-6 rounded-lg bg-white p-2">
                        <QRCodeSVG
                          value={pairingUrl}
                          size={96}
                          bgColor="#ffffff"
                          fgColor="#2a1840"
                          level="M"
                          className="h-full w-full"
                        />
                      </div>
                      <span className="border-secondary absolute inset-3 rounded-xl border-2" />
                      <motion.span
                        initial={{ y: 0 }}
                        animate={{ y: state.animate ? [0, 140, 0] : 70 }}
                        transition={{
                          duration: state.reducedMotion ? 0 : 2.6,
                          repeat: state.animate ? Infinity : 0,
                          ease: 'easeInOut',
                        }}
                        className="bg-secondary shadow-secondary-soft absolute inset-x-4 top-4 h-0.5"
                      />
                    </div>
                    <p className="text-theme-muted mt-3 text-xs">
                      Scan the player’s code, or enter it.
                    </p>
                    <Button
                      onClick={actions.pair}
                      variant="secondary"
                      className="mt-4 w-full gap-2"
                    >
                      <RemoteIcon className="size-4" />
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
            </div>
            <p className="text-theme-muted mt-3 text-center text-xs">
              Your phone · the remote
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
