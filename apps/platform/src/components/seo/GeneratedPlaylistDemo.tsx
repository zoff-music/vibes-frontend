import { Button, ContentTransition } from '@vibes/ui/web';
import { useState } from 'preact/compat';
import { GeneratedPlaylistScene } from './GeneratedPlaylistScene';
import { MusicDemo } from './MusicDemo';
import { useShowcaseMotion } from './useShowcaseMotion';

const ideas = [
  { label: 'Jazz', prompt: 'Jazz after midnight' },
  { label: 'Disco', prompt: 'Disco in the kitchen' },
  { label: 'Focus', prompt: 'Instrumental focus beats' },
];

const watchIdeas = [
  { label: 'Night walks', prompt: 'Beautiful places after dark' },
  { label: 'Short films', prompt: 'Short films with a twist' },
  { label: 'Space', prompt: 'A trip through the solar system' },
];

interface GeneratedPlaylistDemoProps {
  watch?: boolean;
  autoplay?: boolean;
}

export function GeneratedPlaylistDemo({
  watch = false,
  autoplay = true,
}: GeneratedPlaylistDemoProps) {
  const [selected, setSelected] = useState(0);
  const [revision, setRevision] = useState(0);
  const examples = watch ? watchIdeas : ideas;
  const idea = examples[selected];
  const { ref, state, actions } = useShowcaseMotion(autoplay);

  return (
    <MusicDemo
      elementRef={ref}
      label={watch ? 'An idea becomes an evening' : 'Start with a feeling'}
      detail="Illustrative AI playlist preview. No request is sent and these are not actual AI results."
      caption={
        watch
          ? 'Illustrative lineup. Your room starts from your idea.'
          : 'An opening suggestion. Not a fixed playlist.'
      }
      paused={state.paused}
      onToggle={actions.toggle}
    >
      <div className="p-4 sm:p-5">
        <fieldset aria-label="Choose an idea" className="flex flex-wrap gap-2">
          {examples.map((example, index) => (
            <Button
              key={example.label}
              variant={selected === index ? 'tertiary' : 'ghost'}
              aria-pressed={selected === index}
              onClick={() => {
                setSelected(index);
                setRevision((current) => current + 1);
              }}
              className="shrink-0"
            >
              {example.label}
            </Button>
          ))}
        </fieldset>
        <ContentTransition transitionKey={`${idea.prompt}-${revision}`}>
          <GeneratedPlaylistScene
            watch={watch}
            prompt={idea.prompt}
            playing={state.playing}
          />
        </ContentTransition>
      </div>
    </MusicDemo>
  );
}
