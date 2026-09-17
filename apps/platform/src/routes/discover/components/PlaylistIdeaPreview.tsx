import { classNames } from '@vibes/shared';
import { Button, QueueEmptyIcon, SparklesIcon } from '@vibes/ui/web';
import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';

const ideas = [
  {
    name: 'After hours',
    prompt: 'Late-night jazz for a rainy city walk',
    colors: ['bg-primary', 'bg-secondary', 'bg-primary/50'],
    directions: ['Mellow piano', 'Brushed drums', 'Warm basslines'],
  },
  {
    name: 'The dance floor',
    prompt: 'Funk and disco to get a house party moving',
    colors: ['bg-secondary', 'bg-primary', 'bg-secondary/50'],
    directions: ['A soulful warm-up', 'Disco favorites', 'Peak-time funk'],
  },
  {
    name: 'Deep focus',
    prompt: 'Dreamy electronic music for an afternoon of focus',
    colors: ['bg-primary/50', 'bg-secondary/50', 'bg-primary'],
    directions: ['Ambient textures', 'Gentle rhythms', 'Drifting melodies'],
  },
];

export function PlaylistIdeaPreview() {
  const [selected, setSelected] = useState(0);
  const [previewRun, setPreviewRun] = useState(0);
  const reduceMotion = useReducedMotion();
  const idea = ideas[selected];
  const animate = previewRun > 0 && !reduceMotion;

  return (
    <figure className="relative isolate overflow-hidden rounded-3xl border border-theme bg-theme-surface p-5 sm:p-7">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
      />
      <div className="relative">
        <div className="flex items-center justify-between gap-4 font-pixel text-2xs tracking-label">
          <span className="text-primary">IDEA → PLAYLIST</span>
          <span className="text-theme-subtle">INTERACTIVE DEMO</span>
        </div>
        <fieldset
          className="mt-5 flex flex-wrap gap-2"
          aria-label="Example playlist ideas"
        >
          {ideas.map((example, index) => (
            <Button
              key={example.name}
              aria-pressed={selected === index}
              variant={selected === index ? 'tertiary-active' : 'tertiary'}
              size="small"
              className="min-h-11"
              onClick={() => {
                setSelected(index);
                setPreviewRun((run) => run + 1);
              }}
            >
              {example.name}
            </Button>
          ))}
        </fieldset>
        <div className="mt-5 flex min-h-28 items-center gap-4 rounded-2xl border border-theme bg-theme p-5">
          <motion.span
            key={`spark-${previewRun}`}
            initial={false}
            animate={{ rotate: animate ? [0, 180, 360] : 0 }}
            transition={{ duration: 0.65, ease: 'easeInOut' }}
            className="shrink-0 text-primary"
          >
            <SparklesIcon aria-hidden="true" className="h-7 w-7" />
          </motion.span>
          <div
            className="grid min-w-0 flex-1"
            aria-live="polite"
            aria-atomic="true"
          >
            {ideas.map((example, index) => (
              <p
                key={example.name}
                aria-hidden={selected !== index}
                className={classNames(
                  'col-start-1 row-start-1 font-pixel text-lg text-theme leading-snug',
                  selected !== index && 'invisible',
                )}
              >
                {example.prompt}
              </p>
            ))}
          </div>
        </div>
        <div aria-hidden="true" className="mx-auto h-7 w-px bg-secondary/50" />
        <div className="rounded-2xl border border-theme bg-theme p-4">
          <p className="mb-3 flex items-center justify-between gap-3 font-pixel text-theme-muted text-xs">
            A direction for your queue
            <QueueEmptyIcon
              aria-hidden="true"
              className="h-4 w-4 text-secondary"
            />
          </p>
          <ol
            key={previewRun}
            className="space-y-2"
            aria-live="polite"
            aria-atomic="true"
          >
            {idea.directions.map((direction, index) => (
              <motion.li
                key={direction}
                initial={false}
                animate={{
                  opacity: animate ? [0.2, 1] : 1,
                  x: animate ? [12, 0] : 0,
                }}
                transition={{
                  duration: 0.4,
                  delay: animate ? index * 0.14 : 0,
                  ease: 'easeOut',
                }}
                className="flex min-h-14 items-center gap-3 rounded-xl border border-theme bg-theme-surface px-3 py-2"
              >
                <span
                  aria-hidden="true"
                  className={classNames(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-pixel text-text-inverse text-xs',
                    idea.colors[index],
                  )}
                >
                  0{index + 1}
                </span>
                <span className="text-sm text-theme">{direction}</span>
              </motion.li>
            ))}
          </ol>
        </div>
        <figcaption className="mt-4 text-theme-subtle text-xs leading-relaxed">
          Pick an idea to preview the flow. These are illustrative moods, not
          generated tracks. Real generation searches the enabled music
          providers.
        </figcaption>
      </div>
    </figure>
  );
}
