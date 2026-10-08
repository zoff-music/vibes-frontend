import { Button, ContentTransition } from '@vibes/ui/web';
import { useState } from 'react';
import { MusicDemo } from '../../../components/seo/MusicDemo';
import { useShowcaseMotion } from '../../../components/seo/useShowcaseMotion';
import { RoomModeScene } from './showcase/RoomModeScene';

export function RoomModePreview() {
  const [hostMode, setHostMode] = useState(false);
  const { ref, state, actions } = useShowcaseMotion();

  return (
    <MusicDemo
      elementRef={ref}
      label="Who leads the room?"
      detail="One shared timeline, two ways to play."
      paused={state.paused}
      onToggle={actions.toggle}
      className="min-h-140"
      caption={
        hostMode
          ? 'The host’s play, pause and skip actions lead the room.'
          : 'The queue keeps going as people come and go.'
      }
    >
      <div className="p-4 sm:p-6">
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
        <div className="mt-6 min-h-56 rounded-2xl border border-theme bg-theme-surface p-4 sm:p-5">
          <ContentTransition transitionKey={String(hostMode)}>
            <RoomModeScene hostMode={hostMode} playing={state.playing} />
          </ContentTransition>
        </div>
      </div>
    </MusicDemo>
  );
}
