import { Button, PlayIcon, ResetIcon } from '@vibes/ui/web';
import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';

export function ListeningPreview() {
  const [run, setRun] = useState(0);
  const reduceMotion = useReducedMotion();

  return (
    <figure className="overflow-hidden rounded-3xl border border-theme bg-theme-surface p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4 font-pixel text-2xs text-secondary tracking-label">
        <span>ONE ROOM / TWO PLACES</span>
        <PlayIcon aria-hidden="true" className="h-4 w-4" />
      </div>
      <div className="mt-7 space-y-5">
        {['You, at home', 'Your friend, across town'].map((label) => (
          <div
            key={label}
            className="rounded-2xl border border-theme bg-theme p-5"
          >
            <p className="font-pixel text-lg text-theme">{label}</p>
            <p className="mt-1 text-theme-muted text-xs">
              Same song. Shared playback timeline.
            </p>
            <div
              aria-hidden="true"
              className="mt-5 h-2 overflow-hidden rounded-full bg-theme-surface"
            >
              <motion.div
                key={run}
                initial={false}
                animate={{
                  scaleX: run > 0 && !reduceMotion ? [0.25, 0.85] : 0.55,
                }}
                transition={{ duration: 2.4, ease: 'linear' }}
                className="h-full w-full origin-left rounded-full bg-secondary"
              />
            </div>
          </div>
        ))}
      </div>
      <Button
        variant="tertiary"
        contentAlignment="between"
        className="mt-5 min-h-12 w-full gap-4"
        onClick={() => setRun((current) => current + 1)}
      >
        Preview synchronized playback
        <ResetIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
      </Button>
      <figcaption className="mt-4 text-theme-subtle text-xs leading-relaxed">
        Timeline illustration, no audio. Each device uses the music provider’s
        player.
      </figcaption>
    </figure>
  );
}
