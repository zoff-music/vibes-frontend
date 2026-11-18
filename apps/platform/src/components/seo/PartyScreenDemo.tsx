import { ListenerCount, PlaybackProgress } from '@vibes/ui/web';
import { AnimatePresence, MotionConfig, m as motion } from 'framer-motion';
import { useEffect, useState } from 'preact/compat';
import { QRCodeSVG } from 'qrcode.react';
import { WatchLandscape, watchPalettes } from './live/WatchLandscape';
import { MusicDemo } from './MusicDemo';
import { useShowcaseMotion } from './useShowcaseMotion';

const counts = [2, 3, 5, 6];

// Party screen on a TV: the video plays big and friends scan in to join.
interface PartyScreenDemoProps {
  autoplay?: boolean;
}

export function PartyScreenDemo({ autoplay = true }: PartyScreenDemoProps) {
  const { ref, state, actions } = useShowcaseMotion(autoplay);
  const [tick, setTick] = useState(0);
  const [positionMs, setPositionMs] = useState(96_000);
  const count = state.paused ? counts[counts.length - 1] : counts[tick];

  useEffect(() => {
    if (!state.playing) return;

    const interval = window.setInterval(() => {
      setTick((value) => (value + 1) % counts.length);
    }, 2200);
    const clock = window.setInterval(() => {
      setPositionMs((value) => (value >= 470_000 ? 96_000 : value + 250));
    }, 250);

    return () => {
      window.clearInterval(interval);
      window.clearInterval(clock);
    };
  }, [state.playing]);

  return (
    <MotionConfig reducedMotion="user">
      <MusicDemo
        elementRef={ref}
        label="Party screen"
        detail="Put the room on a TV with a QR code friends scan to join, add videos and vote."
        caption="Put it on the TV. Friends scan the code to join from their phones."
        paused={state.paused}
        onToggle={actions.toggle}
        presentation="stage"
      >
        <div aria-hidden="true" inert className="px-2 pt-2 pb-4 sm:px-6">
          <div className="rounded-2xl border-8 border-[#1a1226] bg-[#0b0814] p-2 shadow-xl sm:p-3">
            <div className="crt-frame rounded-player relative aspect-video overflow-hidden bg-black">
              <WatchLandscape
                palette={watchPalettes[0]}
                playing={state.playing}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
              <span className="absolute top-3 right-3 rounded-full bg-black/50 px-3 py-1 text-white">
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.span
                    key={count}
                    initial={{ opacity: 0, y: -8, scale: 1.2 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 18 }}
                    className="block [&>div]:text-white"
                  >
                    <ListenerCount
                      count={count}
                      roomType="WATCH"
                      variant="inline"
                    />
                  </motion.span>
                </AnimatePresence>
              </span>
              <div className="absolute right-4 bottom-3 left-4 text-white">
                <p className="font-pixel truncate text-base sm:text-xl">
                  Beyond the city lights
                </p>
                <div className="mt-1 [&_.text-theme-muted]:text-white/70">
                  <PlaybackProgress
                    durationMs={480_000}
                    positionMs={positionMs}
                  />
                </div>
              </div>
            </div>
            <div className="panel-strong border-primary/30 mt-3 flex items-center gap-4 rounded-3xl border p-3 sm:gap-5 sm:p-4">
              <div className="relative inline-flex shrink-0 overflow-hidden rounded-2xl bg-white p-2">
                <QRCodeSVG
                  value="https://zoff.me/afterhours"
                  size={88}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="M"
                  className="size-18 sm:size-22"
                />
                <motion.span
                  animate={{ y: state.playing ? [0, 76, 0] : 38 }}
                  transition={{
                    duration: 2.2,
                    repeat: state.playing ? Infinity : 0,
                    ease: 'easeInOut',
                  }}
                  className="bg-secondary shadow-secondary-soft absolute inset-x-1 top-2 h-0.5"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-pixel text-2xs text-secondary tracking-label">
                  Scan to join
                </p>
                <p className="font-display text-theme mt-2 truncate text-lg">
                  afterhours
                </p>
                <p className="text-theme-muted mt-1 text-xs">
                  Add videos and vote from your phone
                </p>
              </div>
            </div>
          </div>
          <div className="mx-auto h-3 w-1/4 rounded-b-xl bg-[#1a1226]" />
        </div>
      </MusicDemo>
    </MotionConfig>
  );
}
