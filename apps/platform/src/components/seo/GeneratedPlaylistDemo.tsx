import { Button, ContentTransition } from '@vibes/ui/web';
import { useState } from 'react';
import { GeneratedPlaylistScene } from './GeneratedPlaylistScene';
import { Showcase } from './Showcase';

const ideas = [
  { label: 'Jazz', prompt: 'Jazz after midnight' },
  { label: 'Disco', prompt: 'Disco in the kitchen' },
  { label: 'Focus', prompt: 'Instrumental focus beats' },
];

export function GeneratedPlaylistDemo() {
  const [selected, setSelected] = useState(0);
  const [revision, setRevision] = useState(0);
  const idea = ideas[selected];

  return (
    <Showcase
      label="AI PLAYLIST GENERATOR"
      description="An AI playlist starts with your idea, searches for matching songs and fills the electro queue."
    >
      {(playing) => (
        <div className="pt-4">
          <fieldset
            aria-label="Choose a playlist idea"
            className="grid grid-cols-3 gap-2"
          >
            {ideas.map((example, index) => (
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
            <GeneratedPlaylistScene prompt={idea.prompt} playing={playing} />
          </ContentTransition>
        </div>
      )}
    </Showcase>
  );
}
