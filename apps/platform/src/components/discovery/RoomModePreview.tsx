import { Button, ContentTransition } from '@vibes/ui/web';
import { useState } from 'preact/compat';
import { MusicDemo } from '../seo/MusicDemo';
import { useShowcaseMotion } from '../seo/useShowcaseMotion';
import { RoomModeScene } from './showcase/RoomModeScene';

interface RoomModePreviewProps {
  watch?: boolean;
  autoplay?: boolean;
}

export function RoomModePreview({
  watch = false,
  autoplay = true,
}: RoomModePreviewProps) {
  const [hostMode, setHostMode] = useState(false);
  const { ref, state, actions } = useShowcaseMotion(autoplay);

  return (
    <MusicDemo
      elementRef={ref}
      label="Who leads the room?"
      detail="One shared timeline, two ways to play."
      paused={state.paused}
      onToggle={actions.toggle}
      caption={
        hostMode
          ? 'The host’s play, pause and skip lead everyone.'
          : watch
            ? 'The videos keep going as people come and go.'
            : 'The queue keeps going as people come and go.'
      }
    >
      <div className="p-4 sm:p-5">
        <p className="font-pixel text-2xs text-theme-muted tracking-label mb-3">
          Room Mode
        </p>
        <fieldset
          className="grid grid-cols-2 gap-2"
          aria-label="Compare playback modes"
        >
          <Button
            onClick={() => setHostMode(false)}
            shape="rounded"
            className="min-h-22 w-full flex-col items-start gap-1 px-4 py-3 text-left"
            variant={hostMode ? 'tertiary' : 'cyan'}
            aria-pressed={!hostMode}
          >
            <span className="w-full text-left leading-snug text-current">
              Server Mode
            </span>
            <span className="font-pixel text-caption w-full text-left leading-relaxed tracking-normal text-current opacity-75">
              {watch
                ? 'Keep videos playing together.'
                : 'Auto-play music 24/7.'}
            </span>
          </Button>
          <Button
            onClick={() => setHostMode(true)}
            shape="rounded"
            className="min-h-22 w-full flex-col items-start gap-1 px-4 py-3 text-left"
            variant={hostMode ? 'magenta' : 'tertiary'}
            aria-pressed={hostMode}
          >
            <span className="w-full text-left leading-snug text-current">
              Host Mode
            </span>
            <span className="font-pixel text-caption w-full text-left leading-relaxed tracking-normal text-current opacity-75">
              Host controls playback.
            </span>
          </Button>
        </fieldset>
        <div className="border-theme mt-5 border-t pt-5">
          <ContentTransition transitionKey={String(hostMode)}>
            <RoomModeScene
              hostMode={hostMode}
              playing={state.playing}
              watch={watch}
            />
          </ContentTransition>
        </div>
      </div>
    </MusicDemo>
  );
}
