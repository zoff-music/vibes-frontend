import { Button, SparklesIcon } from '@vibes/ui/web';
import { useState } from 'react';
import { Equalizer } from './showcase/Equalizer';
import { Record } from './showcase/Record';
import { Showcase } from './showcase/Showcase';

const ideas = [
  {
    label: 'After hours',
    prompt: 'Jazz after midnight',
    tracks: ['Velvet keys', 'Streetlight swing', 'Last train home'],
    mood: 'Warm, unhurried, a little blue.',
  },
  {
    label: 'Dance floor',
    prompt: 'Disco in the kitchen',
    tracks: ['Golden hour groove', 'Keep it moving', 'One more dance'],
    mood: 'The kitchen is the dance floor.',
  },
  {
    label: 'Deep focus',
    prompt: 'Dreamy focus beats',
    tracks: ['Soft signals', 'Cloud patterns', 'A little headspace'],
    mood: 'Less noise. More flow.',
  },
];

export function PlaylistIdeaPreview() {
  const [selected, setSelected] = useState(0);
  const idea = ideas[selected];

  return (
    <Showcase
      label="AI PLAYLISTS"
      description="Animated illustration: an idea is typed, a search runs, then three example tracks arrive in a new queue. Use playlist generation to create a real room."
    >
      <div className="scene-content px-5 pt-3 pb-5 sm:px-7 sm:pb-7">
        <fieldset
          aria-label="Choose a playlist mood"
          className="grid grid-cols-3 gap-2"
        >
          {ideas.map((example, index) => (
            <Button
              key={example.label}
              size="none"
              variant={selected === index ? 'tertiary-active' : 'tertiary'}
              aria-pressed={selected === index}
              onClick={() => setSelected(index)}
              className="min-h-11 rounded-xl px-2 py-2 text-xs"
            >
              {example.label}
            </Button>
          ))}
        </fieldset>
        <div key={selected} aria-hidden="true" className="pt-6">
          <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-theme px-4 py-5 shadow-lg">
            <p className="mb-3 font-pixel text-theme-subtle text-xs">
              START WITH A FEELING
            </p>
            <div className="flex min-w-0 items-center gap-3">
              <SparklesIcon className="scene-prompt-icon h-5 w-5 shrink-0 text-primary" />
              <span className="scene-type min-w-0 flex-1 truncate font-pixel text-base text-theme">
                {idea.prompt}
              </span>
              <span className="scene-caret h-5 w-0.5 shrink-0 bg-primary" />
            </div>
            <span className="scene-scan absolute inset-x-0 bottom-0 h-0.5 origin-left bg-secondary shadow-cyan" />
          </div>
          <div className="relative flex h-24 items-center justify-between gap-4 px-3">
            <div className="relative min-w-0 flex-1">
              <p className="scene-status-thinking absolute inset-x-0 top-0 -translate-y-1/2 font-pixel text-sm text-theme-muted">
                Finding your sound...
              </p>
              <p className="scene-status-ready font-pixel text-lg text-theme">
                Your room is ready.
              </p>
            </div>
            <Record className="h-14 w-14 shrink-0" />
          </div>
          <div className="space-y-2">
            {idea.tracks.map((track, index) => (
              <div
                key={track}
                className="scene-song flex h-17 items-center gap-3 rounded-2xl border border-theme bg-theme/90 p-2.5 shadow-lg"
              >
                <div className="scene-art flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-primary/20 bg-primary/10">
                  <span className="h-7 w-7 rounded-full border-4 border-primary/60 bg-theme shadow-secondary-soft" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-pixel text-sm text-theme">
                    {track}
                  </p>
                  <p className="mt-1 text-theme-subtle text-xs">
                    {index === 0 ? 'First in the queue' : 'Up next'}
                  </p>
                </div>
                {index === 0 && (
                  <Equalizer className="h-6 w-12 shrink-0 overflow-hidden" />
                )}
                {index > 0 && (
                  <span className="pr-2 font-pixel text-secondary text-xs">
                    0{index + 1}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between gap-3 text-theme-muted text-xs">
            <span>{idea.mood}</span>
            <span className="shrink-0 text-theme-subtle">Example queue</span>
          </div>
        </div>
      </div>
    </Showcase>
  );
}
