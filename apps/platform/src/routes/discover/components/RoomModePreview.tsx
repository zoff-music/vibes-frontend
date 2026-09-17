import { classNames } from '@vibes/shared';
import { Button, PlayIcon, SkipIcon } from '@vibes/ui/web';
import { useState } from 'react';
import { Equalizer } from './showcase/Equalizer';
import { Showcase } from './showcase/Showcase';

export function RoomModePreview() {
  const [hostMode, setHostMode] = useState(false);

  return (
    <Showcase
      label="YOUR ROOM. YOUR RULES."
      description="An animated room-control illustration. Compare server mode, which advances playback automatically, with host mode, where a host directs playback. These controls change the illustration, not a real room."
    >
      <div className="px-5 pt-4 pb-6 sm:px-7 sm:pb-7">
        <fieldset
          className="grid grid-cols-2 gap-2"
          aria-label="Compare playback modes"
        >
          <Button
            size="none"
            variant={hostMode ? 'tertiary' : 'tertiary-active'}
            className="min-h-12 rounded-xl px-3 py-3 text-sm"
            aria-pressed={!hostMode}
            onClick={() => setHostMode(false)}
          >
            Server mode
          </Button>
          <Button
            size="none"
            variant={hostMode ? 'tertiary-active' : 'tertiary'}
            className="min-h-12 rounded-xl px-3 py-3 text-sm"
            aria-pressed={hostMode}
            onClick={() => setHostMode(true)}
          >
            Host mode
          </Button>
        </fieldset>
        <div className="mt-6 overflow-hidden rounded-2xl border border-theme bg-theme/90 p-5 shadow-xl">
          <div
            aria-hidden="true"
            className="flex h-28 items-center justify-between gap-5"
          >
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
              <PlayIcon className="h-7 w-7" />
            </span>
            <Equalizer className="h-20 flex-1" />
            <SkipIcon className="h-6 w-6 shrink-0 text-secondary" />
          </div>
          <div className="grid" aria-live="polite" aria-atomic="true">
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
          <div
            aria-hidden="true"
            className="scene-sequencer mt-6 grid h-10 grid-cols-8 gap-1.5"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => (
              <span
                key={step}
                className="rounded-md border border-secondary/30 bg-secondary/20"
              />
            ))}
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-xl border border-theme bg-theme/80 px-4 py-3 text-theme-muted text-xs">
          <span>Guests suggest. The room votes.</span>
          <span className="shrink-0 font-pixel text-secondary">
            YOU SET THE RULES
          </span>
        </div>
      </div>
    </Showcase>
  );
}

const modes = [
  {
    host: false,
    title: 'Let the queue run.',
    description:
      'A shared playback timeline. The next track starts automatically. Set it up, then settle in.',
  },
  {
    host: true,
    title: 'Take the controls.',
    description:
      'The host directs playback. Guests can still suggest songs and vote, subject to your room permissions.',
  },
];
