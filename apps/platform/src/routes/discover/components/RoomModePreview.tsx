import { classNames } from '@vibes/shared';
import { Button, SettingsIcon } from '@vibes/ui/web';
import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';

export function RoomModePreview() {
  const [hostMode, setHostMode] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <figure className="overflow-hidden rounded-3xl border border-theme bg-theme-surface p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4 font-pixel text-2xs text-secondary tracking-label">
        <span>CHOOSE HOW IT PLAYS</span>
        <SettingsIcon aria-hidden="true" className="h-5 w-5" />
      </div>
      <fieldset
        className="mt-6 grid grid-cols-2 gap-2"
        aria-label="Compare playback modes"
      >
        <Button
          variant={hostMode ? 'tertiary' : 'tertiary-active'}
          className="min-h-12"
          aria-pressed={!hostMode}
          onClick={() => setHostMode(false)}
        >
          Server mode
        </Button>
        <Button
          variant={hostMode ? 'tertiary-active' : 'tertiary'}
          className="min-h-12"
          aria-pressed={hostMode}
          onClick={() => setHostMode(true)}
        >
          Host mode
        </Button>
      </fieldset>
      <div
        className="mt-5 rounded-2xl border border-theme bg-theme p-5"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="grid">
          {modes.map((mode) => (
            <div
              key={mode.title}
              aria-hidden={hostMode !== mode.host}
              className={classNames(
                'col-start-1 row-start-1',
                hostMode !== mode.host && 'invisible',
              )}
            >
              <p className="font-pixel text-2xl text-theme">{mode.title}</p>
              <p className="mt-3 text-sm text-theme-muted leading-relaxed">
                {mode.description}
              </p>
            </div>
          ))}
        </div>
        <div aria-hidden="true" className="mt-4 grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((bar) => (
            <motion.div
              key={bar}
              initial={false}
              animate={{ scaleY: hostMode ? 0.35 : 0.3 + bar * 0.14 }}
              transition={{
                duration: reduceMotion ? 0 : 0.35,
                delay: reduceMotion ? 0 : bar * 0.04,
              }}
              className="h-12 origin-bottom rounded-t-lg bg-secondary/60"
            />
          ))}
        </div>
      </div>
      <figcaption className="mt-4 text-theme-subtle text-xs leading-relaxed">
        Mode comparison only. Choose your actual settings when creating a room.
      </figcaption>
    </figure>
  );
}

const modes = [
  {
    host: false,
    title: 'Let the queue run.',
    description:
      'The server keeps a shared timeline and advances to the next track automatically. Each listener plays along on their own device.',
  },
  {
    host: true,
    title: 'A host takes the lead.',
    description:
      'The host directs playback. Guests can suggest songs and vote, subject to your room permissions.',
  },
];
