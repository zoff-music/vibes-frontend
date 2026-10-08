import { classNames } from '@vibes/shared';
import { MotionConfig, motion } from 'framer-motion';
import { useState } from 'react';
import mobileRemote from '../../assets/product/mobile-remote.webp?url';
import mobileSearch from '../../assets/product/mobile-search.webp?url';

const screens = [
  {
    label: 'Find a song',
    source: mobileSearch,
    alt: 'Zoff app showing YouTube and SoundCloud search results with add buttons',
    caption: 'Find it on your phone. Hear it with everyone.',
    selectedX: '-62%',
    restingX: '-85%',
    angle: -6,
  },
  {
    label: 'Take the controls',
    source: mobileRemote,
    alt: 'Zoff app pairing a phone with another player using a QR code or pairing code',
    caption: 'Pair with the player. Your phone becomes the remote.',
    selectedX: '-38%',
    restingX: '-15%',
    angle: 7,
  },
];

export function ProductScreenshots() {
  const [selected, setSelected] = useState(0);

  return (
    <MotionConfig reducedMotion="user">
      <figure className="relative isolate min-w-0 overflow-hidden rounded-3xl px-4 pt-6 sm:px-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,#ff2e9726,transparent_65%)]"
        />
        <div className="relative flex items-center justify-between gap-3 text-theme-muted text-xs">
          <span className="font-pixel text-cyan-800 dark:text-secondary">
            ZOFF IN YOUR POCKET
          </span>
          <span>iOS + Android</span>
        </div>
        <div className="relative mx-auto mt-6 h-[clamp(23rem,118vw,36rem)] max-w-112 sm:h-144">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-12 aspect-square rounded-full border border-primary/15"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-8 top-20 aspect-square rounded-full border border-secondary/15"
          />
          {screens.map((screen, index) => (
            <motion.div
              key={screen.label}
              initial={false}
              animate={{
                x: selected === index ? screen.selectedX : screen.restingX,
                y: selected === index ? 12 : 42,
                rotate: screen.angle,
                scale: selected === index ? 1 : 0.9,
                zIndex: selected === index ? 2 : 1,
              }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-3 left-1/2 w-3/5 max-w-60 overflow-hidden rounded-3xl border-4 border-[#302139] bg-[#120b1e] shadow-2xl"
            >
              <img
                src={screen.source}
                width={520}
                height={1130}
                decoding="async"
                alt={screen.alt}
                className="block h-auto w-full"
              />
            </motion.div>
          ))}
        </div>
        <fieldset
          aria-label="Explore the mobile app"
          className="relative z-10 mx-auto grid max-w-96 grid-cols-2 gap-2"
        >
          {screens.map((screen, index) => (
            <button
              type="button"
              key={screen.label}
              onClick={() => setSelected(index)}
              aria-pressed={selected === index}
              className={classNames(
                'min-h-12 cursor-pointer rounded-xl border px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary',
                selected === index
                  ? 'border-secondary bg-theme-surface text-theme'
                  : 'border-theme bg-theme-surface text-theme-muted hover:text-theme',
              )}
            >
              {screen.label}
            </button>
          ))}
        </fieldset>
        <figcaption className="relative flex h-20 items-center justify-center text-center text-sm text-theme-muted">
          {screens[selected].caption}
        </figcaption>
      </figure>
    </MotionConfig>
  );
}
