import { Button } from '@vibes/ui/web';
import { useState } from 'react';
import { PlaylistIdeaScene } from './showcase/PlaylistIdeaScene';
import { Showcase } from './showcase/Showcase';

const ideas = [
  { label: 'Jazz', prompt: 'Jazz after midnight' },
  { label: 'Disco', prompt: 'Disco in the kitchen' },
  { label: 'Focus', prompt: 'Instrumental focus beats' },
];

export function PlaylistIdeaPreview() {
  const [selected, setSelected] = useState(0);
  const idea = ideas[selected];

  return (
    <Showcase
      label="PLAYLIST IDEAS"
      description="Choose an idea to see tracks arrive in the electro queue."
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
                onClick={() => setSelected(index)}
                className="min-h-11 rounded-xl px-2 py-2 text-sm"
              >
                {example.label}
              </Button>
            ))}
          </fieldset>
          <PlaylistIdeaScene
            key={idea.prompt}
            prompt={idea.prompt}
            playing={playing}
          />
        </div>
      )}
    </Showcase>
  );
}
