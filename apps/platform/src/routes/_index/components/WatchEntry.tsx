import {
  generatedPlaylistPromptMaxLength,
  roomNameMaxLength,
} from '@vibes/models';
import {
  ArrowRightIcon,
  Button,
  ContentTransition,
  Modal,
  SparklesIcon,
} from '@vibes/ui/web';
import { useInView } from 'framer-motion';
import { lazy, Suspense, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useAnimatedPlaceholder } from '../hooks/useAnimatedPlaceholder';

const ideas = [
  { label: 'After dark', prompt: 'Beautiful places after dark' },
  { label: 'Short films', prompt: 'Short films with a twist' },
  { label: 'Space', prompt: 'A trip through the solar system' },
];

const LazyWatchScene = lazy(() =>
  import('../../../components/seo/WatchScene').then((module) => ({
    default: module.WatchScene,
  })),
);

export function WatchEntry() {
  const [searchParams] = useSearchParams();
  const [generate, setGenerate] = useState(searchParams.get('mode') === 'ai');
  const [value, setValue] = useState('');
  const [preview, setPreview] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const visible = useInView(ref);
  const { placeholder, reset } = useAnimatedPlaceholder(
    generate,
    visible && value.length === 0,
    true,
  );

  return (
    <div ref={ref} className="text-left">
      <div className="mb-3 flex items-center justify-between gap-3">
        <label htmlFor="watch-entry" className="text-sm text-theme-muted">
          {generate ? 'What are we watching?' : 'Your room, your people'}
        </label>
        <button
          type="button"
          aria-pressed={generate}
          onClick={() => {
            setGenerate(!generate);
            setValue('');
            setPreview(false);
            reset();
            inputRef.current?.focus();
          }}
          className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-3 text-sm text-theme-muted hover:bg-theme-surface hover:text-theme focus-visible:ring-2 focus-visible:ring-secondary"
        >
          <SparklesIcon className="h-4 w-4 text-primary" />
          {generate ? 'Use a room name' : 'Find an idea'}
        </button>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setPreview(true);
        }}
        className="grid gap-3 md:grid-cols-[minmax(0,1fr)_13rem]"
      >
        <label className="flex h-14 min-w-0 cursor-text items-center rounded-2xl border border-theme bg-theme-surface px-4 focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/30">
          <span className="sr-only">
            {generate ? 'Watch prompt' : 'Watch room name'}
          </span>
          {!generate && (
            <span aria-hidden="true" className="text-sm text-theme-muted">
              zoff.me/
            </span>
          )}
          <input
            ref={inputRef}
            id="watch-entry"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setPreview(false);
            }}
            maxLength={
              generate ? generatedPlaylistPromptMaxLength : roomNameMaxLength
            }
            placeholder={placeholder}
            className="h-full w-full min-w-0 bg-transparent px-1 text-base text-theme placeholder:text-theme-subtle focus:outline-none"
            autoComplete="off"
          />
        </label>
        <Button
          type="submit"
          variant="primary"
          className="h-14 w-full gap-4"
          contentAlignment="between"
        >
          {generate ? 'Preview lineup' : 'Preview room'}
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </form>
      <div className="mt-3 min-h-24">
        <ContentTransition transitionKey={generate ? 'ideas' : 'note'}>
          {generate && (
            <div className="grid grid-cols-3 gap-2">
              {ideas.map((idea) => (
                <button
                  type="button"
                  key={idea.label}
                  onClick={() => {
                    setValue(idea.prompt);
                    setPreview(false);
                  }}
                  className="min-h-11 cursor-pointer rounded-xl border border-theme bg-theme-surface px-3 text-theme-muted text-xs hover:border-secondary hover:text-theme focus-visible:ring-2 focus-visible:ring-secondary"
                >
                  {idea.label}
                </button>
              ))}
            </div>
          )}
          {!generate && (
            <p className="pt-1 text-theme-muted text-xs">
              Always free. No account, ever.
            </p>
          )}
        </ContentTransition>
        <p role="status" className="mt-2 text-theme-muted text-xs">
          {preview
            ? 'Preview only. No room was created. Explore the Watch scenes below.'
            : 'Design preview only. No room or AI request is created.'}
        </p>
      </div>
      {preview && (
        <Modal
          isOpen
          ariaLabelledBy="watch-preview-heading"
          size="lg"
          onClose={() => setPreview(false)}
        >
          <h2
            id="watch-preview-heading"
            className="mb-3 font-pixel text-2xl normal-case"
          >
            {value || 'A night with your people'}
          </h2>
          <p className="mb-6 text-sm text-theme-muted">
            Local design preview. These are illustrative scenes, not generated
            results or a live room.
          </p>
          <Suspense fallback={<div className="h-120" />}>
            <LazyWatchScene compact />
          </Suspense>
        </Modal>
      )}
    </div>
  );
}
