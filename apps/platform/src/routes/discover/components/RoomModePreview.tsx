import { classNames } from '@vibes/shared';
import { Button } from '@vibes/ui/web';
import { useState } from 'react';
import { RoomModeScene } from './showcase/RoomModeScene';
import { Showcase } from './showcase/Showcase';

export function RoomModePreview() {
  const [hostMode, setHostMode] = useState(false);

  return (
    <Showcase
      label="YOUR ROOM. YOUR RULES."
      description="An animated room-control illustration. Compare server mode, which advances playback automatically, with host mode, where a host directs playback. These controls change the illustration, not a real room."
    >
      <div className="scene-content px-5 pt-4 pb-6 sm:px-7 sm:pb-7">
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
          <RoomModeScene key={String(hostMode)} hostMode={hostMode} />
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
