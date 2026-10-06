import { classNames } from '@vibes/shared';
import {
  Button,
  CheckIcon,
  ContentTransition,
  PlaybackProgress,
  PlayIcon,
} from '@vibes/ui/web';
import { MotionConfig, motion } from 'framer-motion';
import { useEffect, useId, useState } from 'react';
import logo from '../../assets/logo-header.webp';
import { useShowcaseMotion } from './useShowcaseMotion';

interface WatchSceneProps {
  compact?: boolean;
}

export function WatchScene({ compact = false }: WatchSceneProps) {
  const { ref, state } = useShowcaseMotion();
  const [frame, setFrame] = useState(3);
  const [scene, setScene] = useState(0);
  const id = useId();
  const gradient = `${id}-sky`;
  const restarting = frame >= 12;
  const current = scenes[scene];

  useEffect(() => {
    if (!state.playing) return;

    const timer = window.setInterval(
      () => setFrame((value) => (value + 1) % 15),
      850,
    );
    return () => window.clearInterval(timer);
  }, [state.playing]);

  return (
    <MotionConfig reducedMotion="user">
      <figure
        ref={ref}
        className="relative min-w-0"
        aria-label="Illustrated Watch preview, not a live room"
      >
        <div className="mb-4 flex items-center justify-between gap-3 text-theme-muted text-xs">
          <span className="font-pixel tracking-widest">THE SAME MOMENT.</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
            Three screens. One room.
          </span>
        </div>
        <div className="relative isolate overflow-hidden rounded-3xl border border-theme bg-theme-surface p-2 shadow-retro sm:p-3">
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-[#100c20] text-white">
            <ContentTransition
              transitionKey={scene}
              className="absolute inset-0"
            >
              <motion.div
                className="absolute inset-0"
                initial={false}
                animate={{
                  opacity: restarting ? 0 : 1,
                  scale: restarting ? 0.9 : 1,
                }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 800 450"
                  className="h-full w-full"
                  preserveAspectRatio="xMidYMid slice"
                >
                  <title>Illustrated night landscape</title>
                  <defs>
                    <linearGradient id={gradient} x2="0" y2="1">
                      <stop stopColor="#16102c" />
                      <stop offset=".7" stopColor={current.sky} />
                      <stop offset="1" stopColor="#ee73aa" />
                    </linearGradient>
                  </defs>
                  <path fill={`url(#${gradient})`} d="M0 0h800v450H0z" />
                  {[60, 160, 260, 390, 540, 660, 750].map((x, index) => (
                    <circle
                      key={x}
                      cx={x}
                      cy={30 + ((index * 43) % 140)}
                      r={index % 2 ? 1.5 : 2}
                      fill="#fff"
                      opacity=".65"
                    />
                  ))}
                  <motion.g
                    animate={{ x: state.playing ? [0, -18, 0] : 0 }}
                    transition={{
                      duration: 14,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <circle cx="565" cy="167" r="78" fill={current.sun} />
                    <ellipse
                      cx="565"
                      cy="170"
                      rx="115"
                      ry="22"
                      fill="none"
                      stroke="#e2d4ff"
                      strokeWidth="2"
                      transform="rotate(-22 565 170)"
                      opacity={scene === 1 ? 0.8 : 0}
                    />
                    <path
                      d="M-40 360 95 175 245 330 360 205 540 368 690 240 840 330V480H-40Z"
                      fill="#342443"
                    />
                    <path
                      d="m95 175 150 155-107-92-43-15-41 22ZM360 205l180 163-150-112-30-8-24 13Z"
                      fill="#bb85b5"
                      opacity=".5"
                    />
                  </motion.g>
                  <motion.g
                    animate={{ x: state.playing ? [0, 24, 0] : 0 }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <path
                      d="M-60 410 90 295 245 405 410 315 605 425 750 290 860 390V480H-60Z"
                      fill="#151325"
                    />
                    <path
                      d="m-60 410 150-115 155 110 165-90 195 110 145-135 110 100"
                      fill="none"
                      stroke="#00d9ff"
                      strokeWidth="1.5"
                      opacity=".5"
                    />
                  </motion.g>
                </svg>
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-black/10" />
                <div className="absolute right-5 bottom-5 left-5 flex items-end justify-between gap-3 sm:bottom-7 sm:left-7">
                  <div>
                    <p className="mb-2 text-2xs text-white/60 tracking-label">
                      ZOFF / WATCH
                    </p>
                    <p className="font-pixel text-2xl sm:text-4xl">
                      {current.title}
                    </p>
                  </div>
                  <span className="shrink-0 whitespace-nowrap rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-xs">
                    Preview
                  </span>
                </div>
              </motion.div>
            </ContentTransition>
            <motion.div
              initial={false}
              animate={{
                opacity: restarting ? 1 : 0,
                scale: restarting ? 1 : 0.7,
                rotate: restarting && state.playing ? 360 : 0,
              }}
              transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none absolute inset-0 grid place-items-center"
              aria-hidden="true"
            >
              <img
                src={logo}
                width={256}
                height={256}
                alt=""
                className="h-24 w-24 rounded-full sm:h-32 sm:w-32"
              />
            </motion.div>
          </div>
          <div className="px-3 pt-3 pb-1 sm:px-4">
            <PlaybackProgress
              smooth={state.playing && !restarting}
              durationMs={12000}
              positionMs={Math.min(frame, 12) * 1000}
              showTimes={false}
            />
            <div className="flex h-10 items-center justify-between gap-2 text-theme-muted text-xs">
              <span className="flex items-center gap-2">
                <PlayIcon className="h-3 w-3 text-secondary" />
                Shared playback
              </span>
              <span className="flex items-center gap-1.5">
                <CheckIcon className="h-3 w-3 text-secondary" />
                In sync
              </span>
            </div>
          </div>
        </div>
        {!compact && (
          <>
            <svg
              viewBox="0 0 600 28"
              className="h-7 w-full text-secondary"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M300 0V10H100V28M300 10V28M300 10H500V28"
                stroke="currentColor"
                fill="none"
                opacity=".2"
              />
              <motion.path
                d="M300 0V10H100V28M300 10V28M300 10H500V28"
                stroke="currentColor"
                fill="none"
                initial={false}
                animate={{
                  pathLength: restarting ? 0 : 1,
                  opacity: restarting ? 0 : 0.65,
                }}
                transition={{ duration: 0.8 }}
              />
            </svg>
            <fieldset
              className="grid grid-cols-3 gap-2"
              aria-label="Preview viewers"
            >
              {['You', 'Mira', 'Alex'].map((name, index) => (
                <div
                  key={name}
                  className="min-w-0 rounded-xl border border-theme bg-theme-surface px-3 py-3"
                >
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span>{name}</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                  </div>
                  <motion.div
                    initial={false}
                    animate={{ scaleX: restarting ? 0 : (frame + 1) / 13 }}
                    transition={{ duration: 0.7, delay: index * 0.04 }}
                    className="h-0.5 origin-left rounded-full bg-secondary"
                  />
                </div>
              ))}
            </fieldset>
          </>
        )}
        <fieldset
          className="mt-5 flex flex-wrap gap-2"
          aria-label="Choose an example film"
        >
          {scenes.map((item, index) => (
            <Button
              key={item.title}
              size="small"
              variant="tertiary"
              aria-pressed={index === scene}
              className={classNames(
                'min-h-11 text-xs',
                scene === index && 'border-secondary',
              )}
              onClick={() => {
                setScene(index);
                setFrame(0);
              }}
            >
              {item.label}
            </Button>
          ))}
        </fieldset>
        <figcaption className="mt-4 h-12 text-sm text-theme-muted">
          <ContentTransition transitionKey={frame < 5 ? 'join' : 'watch'}>
            <span>
              {frame < 5
                ? 'Mira joined. The night is just getting started.'
                : 'Different places. Right here, together.'}
            </span>
          </ContentTransition>
        </figcaption>
      </figure>
    </MotionConfig>
  );
}

const scenes = [
  {
    label: 'After dark',
    title: 'Beyond the city lights',
    sky: '#69405e',
    sun: '#f3b7ab',
  },
  {
    label: 'Out of orbit',
    title: 'A little further out',
    sky: '#353575',
    sun: '#bcb8ff',
  },
  {
    label: 'The scenic route',
    title: 'Nowhere to rush',
    sky: '#285567',
    sun: '#fbcda9',
  },
];
