import { Button, ContentTransition } from '@vibes/ui/web';
import { useState } from 'react';
import { GeneratedPlaylistScene } from './GeneratedPlaylistScene';
import { Showcase } from './Showcase';

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
}

export function GeneratedPlaylistDemo({
  watch = false,
}: GeneratedPlaylistDemoProps) {
  const [selected, setSelected] = useState(0);
  const [revision, setRevision] = useState(0);
  const examples = watch ? watchIdeas : ideas;
  const idea = examples[selected];

  return (
    <Showcase
      className="min-h-144"
      label={watch ? 'AN IDEA BECOMES AN EVENING' : 'AI PLAYLIST GENERATOR'}
      description={
        watch
          ? 'Illustrative Watch generation concept. No request is sent and these are not actual AI results.'
          : 'An AI playlist starts with your idea, searches for matching songs and fills the electro queue.'
      }
    >
      {(playing) => (
        <div className="pt-4">
          <fieldset
            aria-label="Choose a playlist idea"
            className="grid grid-cols-3 gap-2"
          >
            {examples.map((example, index) => (
              <Button
                key={example.label}
                size="none"
                variant={selected === index ? 'tertiary-active' : 'tertiary'}
                aria-pressed={selected === index}
                onClick={() => {
                  setSelected(index);
                  setRevision((current) => current + 1);
                }}
                className="min-h-11 rounded-xl px-2 py-2 text-sm"
              >
                {example.label}
              </Button>
            ))}
          </fieldset>
          <ContentTransition transitionKey={`${idea.prompt}-${revision}`}>
            <GeneratedPlaylistScene
              watch={watch}
              prompt={idea.prompt}
              playing={playing}
            />
          </ContentTransition>
        </div>
      )}
    </Showcase>
  );
}
