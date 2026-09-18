import { Button } from '@vibes/ui/web';
import { useState } from 'react';
import { RoomModeScene } from './showcase/RoomModeScene';
import { Showcase } from './showcase/Showcase';

export function RoomModePreview() {
  const [hostMode, setHostMode] = useState(false);

  return (
    <Showcase
      label="PLAYBACK MODES"
      description="Preview the room's player controls and timeline. Server mode advances automatically. In host mode the host pauses, resumes and skips."
    >
      {(playing) => (
        <div className="scene-content px-5 pt-4 pb-6 sm:px-7 sm:pb-7">
          <fieldset
            className="grid grid-cols-2 gap-2"
            aria-label="Compare playback modes"
          >
            <Button
              size="none"
              variant="tertiary"
              className="min-h-12 rounded-xl px-3 py-3 text-sm aria-pressed:border-secondary aria-pressed:ring-1 aria-pressed:ring-secondary/30"
              aria-pressed={!hostMode}
              onClick={() => setHostMode(false)}
            >
              Server mode
            </Button>
            <Button
              size="none"
              variant="tertiary"
              className="min-h-12 rounded-xl px-3 py-3 text-sm aria-pressed:border-secondary aria-pressed:ring-1 aria-pressed:ring-secondary/30"
              aria-pressed={hostMode}
              onClick={() => setHostMode(true)}
            >
              Host mode
            </Button>
          </fieldset>
          <div className="mt-6 rounded-2xl border border-theme bg-theme p-4 sm:p-5">
            <RoomModeScene
              key={String(hostMode)}
              hostMode={hostMode}
              playing={playing}
            />
          </div>
          <p
            aria-live="polite"
            className="mt-5 min-h-15 text-sm text-theme-muted leading-relaxed"
          >
            {hostMode
              ? 'The host controls playback. Watch it pause, resume and skip.'
              : 'The room shares one timeline. When a song ends, the next starts automatically.'}
          </p>
        </div>
      )}
    </Showcase>
  );
}
